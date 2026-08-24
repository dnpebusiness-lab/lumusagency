import { NextResponse, type NextRequest } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getVoiceProvider } from '@/lib/providers/registry'
import { assertInternalEvaluation } from '@/lib/security/gate'
import { logSafe, newCorrelationId, toPublicError } from '@/lib/security/redact'
import { buildIngestPayload, type IngestContext } from '@/lib/voice/ingest'
import { serverEnv } from '@/lib/env'

/**
 * Retell lifecycle webhook.
 *
 * Node runtime, not Edge: this handler needs the raw request body for signature
 * verification and the service-role key for the ingest.
 *
 * Order of operations is the security property, so it is written out rather than
 * left implicit:
 *
 *   1. read the RAW body, before any parsing;
 *   2. verify the vendor signature (and, inside the SDK verifier, the replay
 *      window) — a failure returns 401 having written nothing at all;
 *   3. resolve which location the call belongs to;
 *   4. hand the whole thing to one transactional, idempotent RPC.
 *
 * Anything that fails between 1 and 3 leaves no trace in the domain tables.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface LocationRow {
  id: string
  organisation_id: string
  name: string
  agent_configurations: {
    default_language: 'en' | 'it'
    supported_languages: ('en' | 'it')[]
    recording_enabled: boolean
    retell_agent_id: string | null
  } | null
}

export async function POST(request: NextRequest) {
  const correlationId = newCorrelationId()

  // The activation gate is checked before the body is even read: a deployment
  // that is not an approved internal evaluation processes nothing.
  const gate = assertInternalEvaluation()
  if (!gate.ok) {
    logSafe('warn', 'retell.webhook.denied_by_gate', { correlation_id: correlationId })
    const { body, status } = toPublicError(correlationId, 403)
    return NextResponse.json(body, { status })
  }

  const provider = getVoiceProvider()
  if (!provider.ok) {
    logSafe('error', 'retell.webhook.provider_unavailable', {
      correlation_id: correlationId,
      code: provider.error.code,
    })
    const { body, status } = toPublicError(correlationId, 503)
    return NextResponse.json(body, { status })
  }

  // 1. Raw body. Never request.json() here: JSON round-tripping changes bytes
  //    and the signature is over bytes.
  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    const { body, status } = toPublicError(correlationId, 400)
    return NextResponse.json(body, { status })
  }

  // 2. Signature and replay window.
  const verified = await provider.data.verifyWebhook(rawBody, request.headers)
  if (!verified.ok) {
    logSafe('warn', 'retell.webhook.rejected', {
      correlation_id: correlationId,
      code: verified.error.code,
    })
    // 401 for anything that failed authentication, including a stale replay.
    // 400 only for a body that verified but made no sense.
    const status = verified.error.code === 'unauthorised' ? 401 : 400
    return NextResponse.json({ error: 'Rejected', correlation_id: correlationId }, { status })
  }

  const event = verified.data
  const supabase = createServiceRoleClient()

  // 3. Which restaurant is this? Resolved from the agent the vendor names, and
  //    from the dialled number as a fallback.
  const { data: locations, error: lookupError } = await supabase
    .from('locations')
    .select(
      'id, organisation_id, name, agent_configurations(default_language, supported_languages, recording_enabled, retell_agent_id)',
    )
    .eq('is_active', true)
    .is('deleted_at', null)

  if (lookupError) {
    logSafe('error', 'retell.webhook.location_lookup_failed', { correlation_id: correlationId })
    const { body, status } = toPublicError(correlationId, 503)
    return NextResponse.json(body, { status })
  }

  const rows = (locations ?? []) as unknown as LocationRow[]
  const normalised = rows.map((row) => ({
    ...row,
    config: Array.isArray(row.agent_configurations)
      ? (row.agent_configurations[0] ?? null)
      : row.agent_configurations,
  }))

  const match =
    normalised.find(
      (row) => row.config?.retell_agent_id && row.config.retell_agent_id === event.providerAgentId,
    ) ?? (normalised.length === 1 ? normalised[0] : undefined)

  if (!match) {
    // Unroutable, not unauthenticated. Acknowledge so the vendor stops retrying
    // something we will never be able to place, and record why.
    logSafe('warn', 'retell.webhook.unroutable', {
      correlation_id: correlationId,
      provider_agent_id: event.providerAgentId,
      event: event.kind,
    })
    return NextResponse.json(
      {
        received: true,
        processed: false,
        reason: 'no_matching_location',
        correlation_id: correlationId,
      },
      { status: 200 },
    )
  }

  const context: IngestContext = {
    organisationId: match.organisation_id,
    locationId: match.id,
    locationName: match.name,
    defaultLanguage: match.config?.default_language ?? 'en',
    supportedLanguages: match.config?.supported_languages ?? ['en'],
    recordingEnabled: match.config?.recording_enabled ?? false,
    callerSalt: serverEnv().ASTRA_CALLER_HASH_SALT ?? 'astra-dev-salt',
  }

  if (event.recordingUrlDiscarded) {
    logSafe('warn', 'retell.webhook.recording_url_discarded', {
      correlation_id: correlationId,
      provider_call_id: event.providerCallId,
    })
  }

  // 4. One transactional, idempotent write.
  const payload = buildIngestPayload(event, context)
  const { data: result, error: ingestError } = await supabase.rpc('voice_ingest_call_event', {
    p_input: payload,
  })

  if (ingestError) {
    logSafe('error', 'retell.webhook.ingest_failed', {
      correlation_id: correlationId,
      event: event.kind,
      code: ingestError.code,
    })
    // 5xx so the vendor retries; the idempotency gate makes that safe.
    const { body, status } = toPublicError(correlationId, 503)
    return NextResponse.json(body, { status })
  }

  const outcome = (result ?? {}) as { duplicate?: boolean; call_session_id?: string }

  logSafe('info', 'retell.webhook.processed', {
    correlation_id: correlationId,
    event: event.kind,
    duplicate: outcome.duplicate === true,
    location_id: context.locationId,
  })

  // A duplicate is a success. Returning anything else teaches the vendor to
  // retry a delivery we have already handled.
  return NextResponse.json(
    { received: true, duplicate: outcome.duplicate === true, correlation_id: correlationId },
    { status: 200 },
  )
}
