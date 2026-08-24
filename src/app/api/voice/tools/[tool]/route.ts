import { NextResponse, type NextRequest } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { assertInternalEvaluation } from '@/lib/security/gate'
import { logSafe, newCorrelationId, toPublicError } from '@/lib/security/redact'
import { checkToolRateLimit } from '@/lib/security/rate-limit'
import { serverEnv } from '@/lib/env'
import {
  TOOL_INPUT_SCHEMAS,
  isAgentToolName,
  toolFailure,
  type AgentToolName,
  type ToolResponse,
} from '@/lib/agent/tools'
import { assessAllergenQuestion, detectSeverity, type AllergenFacts } from '@/lib/agent/safety'
import { asDataBlock } from '@/lib/agent/sanitise'

/**
 * Voice tool endpoints — the agent's only route to restaurant data.
 *
 * Every response goes through the approved-data-only RPCs added in migration
 * 0013. There is no code path here that can read a draft row, because there is
 * no query here that touches a base table.
 *
 * Authentication note, recorded rather than assumed: Retell signs *webhooks*
 * with X-Retell-Signature, and retell-sdk@5.64.0 ships a verifier for exactly
 * that. Its custom-function tool calls are not covered by that scheme, so these
 * endpoints authenticate with a shared bearer secret configured as a custom
 * header on the Retell tool. Where a signature IS present it is checked as well.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function constantTimeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

function authorise(request: NextRequest): boolean {
  const configured = serverEnv().ASTRA_TOOL_SHARED_SECRET
  // Fail closed: an unconfigured secret denies every request rather than
  // accidentally opening the endpoint to the internet.
  if (!configured) return false

  const header =
    request.headers.get('x-astra-tool-secret') ??
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
    ''

  return header !== '' && constantTimeEquals(header, configured)
}

interface CallRow {
  id: string
  organisation_id: string
  location_id: string
  detected_language: 'en' | 'it' | null
  locations: { name: string } | { name: string }[] | null
}

/** Short, speakable, and never longer than a sentence or two. */
function money(cents: number | null, currency: string): string {
  if (cents === null) return 'no price listed'
  const whole = Math.floor(cents / 100)
  const part = cents % 100
  const symbol = currency === 'EUR' ? '€' : ''
  return part === 0 ? `${symbol}${whole}` : `${symbol}${whole}.${String(part).padStart(2, '0')}`
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tool: string }> },
) {
  const correlationId = newCorrelationId()
  const { tool } = await params

  const gate = assertInternalEvaluation()
  if (!gate.ok) {
    const { body, status } = toPublicError(correlationId, 403)
    return NextResponse.json(body, { status })
  }

  if (!authorise(request)) {
    logSafe('warn', 'voice.tool.unauthorised', { correlation_id: correlationId, tool })
    return NextResponse.json(
      { error: 'Unauthorised', correlation_id: correlationId },
      { status: 401 },
    )
  }

  if (!isAgentToolName(tool)) {
    // Not on the allow-list. This is the ceiling on what a successful prompt
    // injection can reach: an unknown tool simply does not exist.
    logSafe('warn', 'voice.tool.unknown', { correlation_id: correlationId, tool })
    return NextResponse.json(
      { error: 'Unknown tool', correlation_id: correlationId },
      { status: 404 },
    )
  }

  const toolName: AgentToolName = tool

  let rawInput: unknown
  try {
    rawInput = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON', correlation_id: correlationId },
      { status: 400 },
    )
  }

  const parsed = TOOL_INPUT_SCHEMAS[toolName].safeParse(rawInput)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', correlation_id: correlationId },
      { status: 400 },
    )
  }
  const input = parsed.data

  const supabase = createServiceRoleClient()

  // Resolve the call, and through it the location. The agent never tells us
  // which restaurant it is: we look it up from the call it is on.
  const { data: callRow } = await supabase
    .from('call_sessions')
    .select('id, organisation_id, location_id, detected_language, locations(name)')
    .eq('provider', 'retell')
    .eq('provider_call_id', input.call_id)
    .maybeSingle()

  const call = callRow as unknown as CallRow | null
  if (!call) {
    logSafe('warn', 'voice.tool.unknown_call', { correlation_id: correlationId, tool: toolName })
    return NextResponse.json(
      toolFailure(
        'tool_failure',
        'I could not look that up just now. Let me pass you to a colleague.',
      ),
      { status: 200 },
    )
  }

  const language = call.detected_language ?? 'en'

  const limit = await checkToolRateLimit(supabase, call.id, toolName)
  if (!limit.allowed) {
    await recordEvent(supabase, call, 'tool_rate_limited', toolName, {
      used: limit.used,
      limit: limit.limit,
    })
    logSafe('warn', 'voice.tool.rate_limited', {
      correlation_id: correlationId,
      tool: toolName,
      used: limit.used,
    })
    return NextResponse.json(
      toolFailure('tool_failure', 'Let me pass you to a colleague who can help with that.'),
      { status: 200 },
    )
  }

  await recordEvent(supabase, call, 'tool_called', toolName, { correlation_id: correlationId })

  try {
    const response = await execute(supabase, toolName, input, call, language)
    await recordEvent(supabase, call, 'tool_succeeded', toolName, {
      escalate: response.escalate?.reason ?? null,
    })
    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    await recordEvent(
      supabase,
      call,
      'tool_failed',
      toolName,
      { correlation_id: correlationId },
      'tool_error',
      error instanceof Error ? error.message : 'unknown',
    )
    logSafe('error', 'voice.tool.failed', { correlation_id: correlationId, tool: toolName })

    // A failure NEVER becomes a successful spoken result. The agent is handed an
    // honest fallback and an escalation, not a plausible-sounding answer.
    return NextResponse.json(
      toolFailure(
        'tool_failure',
        'I could not check that just now, so I would rather not guess. Let me pass you to a colleague.',
      ),
      { status: 200 },
    )
  }
}

async function execute(
  supabase: ReturnType<typeof createServiceRoleClient>,
  tool: AgentToolName,
  input: Record<string, unknown>,
  call: CallRow,
  language: 'en' | 'it',
): Promise<ToolResponse> {
  switch (tool) {
    case 'get_business_info': {
      const { data, error } = await supabase.rpc('voice_get_business_info', {
        p_location: call.location_id,
      })
      if (error) throw new Error(error.message)
      if (!data) {
        return toolFailure(
          'outside_approved_information',
          'I do not have that confirmed. Let me pass you to a colleague.',
        )
      }
      return {
        spoken: 'Here is what I have on file for the restaurant.',
        // Business facts are structured, but the free-text articles staff wrote
        // are wrapped so the model treats them as data, never as instructions.
        data: {
          ...(data as Record<string, unknown>),
          articles_block: asDataBlock(
            'knowledge_articles',
            JSON.stringify((data as { articles?: unknown }).articles ?? []),
          ),
        },
      }
    }

    case 'search_menu': {
      const { data, error } = await supabase.rpc('voice_search_menu', {
        p_location: call.location_id,
        p_query: (input.query as string | undefined) ?? null,
        p_limit: (input.limit as number | undefined) ?? 6,
      })
      if (error) throw new Error(error.message)

      const items = (data ?? []) as Array<{
        menu_item_id: string
        name_en: string
        name_it: string | null
        price_cents: number | null
        currency: string
      }>

      if (items.length === 0) {
        return toolFailure(
          'outside_approved_information',
          language === 'it'
            ? 'Non ho quel piatto confermato nel menu. La passo a un collega.'
            : 'I do not have that on the confirmed menu. Let me pass you to a colleague.',
        )
      }

      // At most three, spoken. A phone caller cannot hold a list of twelve.
      const spokenItems = items.slice(0, 3).map((item) => {
        const name = language === 'it' ? (item.name_it ?? item.name_en) : item.name_en
        return `${name}, ${money(item.price_cents, item.currency)}`
      })

      return {
        spoken: spokenItems.join('; '),
        data: { items, total: items.length },
      }
    }

    case 'get_allergen_info': {
      const { data: resolved, error: resolveError } = await supabase.rpc(
        'voice_resolve_menu_item',
        {
          p_location: call.location_id,
          p_text: input.menu_item as string,
        },
      )
      if (resolveError) throw new Error(resolveError.message)

      const severe = detectSeverity(String(input.caller_phrasing ?? ''))

      if (!resolved) {
        // No approved dish matched. Severity still decides the escalation
        // reason, because a severe allergy outranks a lookup miss.
        const answer = assessAllergenQuestion(
          { allergenCode: (input.allergen_code as string | undefined) ?? null, severe },
          null,
          language,
        )
        return {
          spoken:
            language === 'it'
              ? 'Non ho quel piatto confermato. Le passo una persona del team.'
              : 'I do not have that dish confirmed. Let me pass you to a member of the team.',
          data: { verdict: answer.verdict },
          escalate: {
            reason: answer.escalationReason ?? 'outside_approved_information',
            spoken:
              language === 'it'
                ? 'La metto in contatto con una persona del team.'
                : 'Let me put you through to a member of the team.',
          },
          safety_directive: answer.safetyDirective,
        }
      }

      const { data: facts, error: factsError } = await supabase.rpc('voice_get_allergen_info', {
        p_location: call.location_id,
        p_menu_item: resolved,
      })
      if (factsError) throw new Error(factsError.message)

      const raw = (facts ?? {}) as Record<string, unknown>
      const allergenFacts: AllergenFacts = {
        menuItemId: (raw.menu_item_id as string) ?? null,
        nameEn: (raw.name_en as string) ?? null,
        nameIt: (raw.name_it as string) ?? null,
        contains: mapDeclarations(raw.contains),
        mayContain: mapDeclarations(raw.may_contain),
        declaredFreeFrom: mapDeclarations(raw.declared_free_from),
        undeclared: mapDeclarations(raw.undeclared),
        crossContaminationNotes: (raw.cross_contamination_notes as string) ?? null,
      }

      const answer = assessAllergenQuestion(
        { allergenCode: (input.allergen_code as string | undefined) ?? null, severe },
        allergenFacts,
        language,
      )

      if (answer.mustEscalate) {
        return {
          spoken:
            language === 'it'
              ? 'Per un’allergia grave non posso darle garanzie. La metto subito in contatto con una persona del team.'
              : 'For a serious allergy I cannot give you any assurance. Let me put you through to a member of the team right now.',
          data: { verdict: answer.verdict },
          escalate: {
            reason: answer.escalationReason ?? 'severe_allergy',
            spoken:
              language === 'it'
                ? 'La metto in contatto con una persona del team.'
                : 'Putting you through to the team now.',
          },
          safety_directive: answer.safetyDirective,
        }
      }

      const spoken =
        answer.speakableFacts.length > 0
          ? answer.speakableFacts.join('. ')
          : language === 'it'
            ? 'Non ho una dichiarazione confermata per quell’allergene su questo piatto.'
            : 'I do not have a confirmed declaration for that allergen on this dish.'

      return {
        spoken,
        data: {
          verdict: answer.verdict,
          contains: allergenFacts.contains,
          may_contain: allergenFacts.mayContain,
          declared_free_from: allergenFacts.declaredFreeFrom,
          undeclared: allergenFacts.undeclared,
        },
        safety_directive: answer.safetyDirective,
      }
    }
  }
}

function mapDeclarations(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map((entry) => {
    const record = entry as Record<string, unknown>
    return {
      code: String(record.code ?? ''),
      nameEn: String(record.name_en ?? ''),
      nameIt: String(record.name_it ?? ''),
      crossContaminationNotes: (record.cross_contamination_notes as string | null) ?? null,
    }
  })
}

/**
 * Append to the call's audit trail. Best-effort by design: failing to log must
 * not fail the call, but a lost event is recorded in the application log so it
 * is not silent.
 */
async function recordEvent(
  supabase: ReturnType<typeof createServiceRoleClient>,
  call: CallRow,
  eventType: string,
  toolName: string,
  payload: Record<string, unknown>,
  errorCode?: string,
  errorMessage?: string,
): Promise<void> {
  const { data: last } = await supabase
    .from('call_events')
    .select('sequence')
    .eq('call_session_id', call.id)
    .order('sequence', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sequence = ((last as { sequence: number } | null)?.sequence ?? -1) + 1

  const { error } = await supabase.from('call_events').insert({
    organisation_id: call.organisation_id,
    call_session_id: call.id,
    sequence,
    event_type: eventType,
    tool_name: toolName,
    payload,
    error_code: errorCode ?? null,
    error_message: errorMessage ?? null,
  })

  if (error) {
    logSafe('error', 'voice.tool.event_not_recorded', { tool: toolName, code: error.code })
  }
}
