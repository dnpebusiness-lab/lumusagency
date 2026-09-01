import type Retell from 'retell-sdk'
import type { LanguageCode } from '@/lib/db/enums'
import { buildAgentPrompt } from '@/lib/agent/prompt'
import { getDisclosure } from '@/lib/agent/disclosure'
import type { VoiceAgentConfig } from '../types'

/**
 * The whole Retell agent, derived from one configuration row.
 *
 * Milestone 4A originally configured the vendor by hand, and by hand meant
 * roughly twenty fields spread across four dialogs. A header typed into the
 * wrong box, a description pasted into the name field, a timeout left at the
 * vendor's two-minute default, a stale agent id in the database — each of
 * those cost a live call. So the configuration is written down once, here, and
 * two things consume it:
 *
 *   * RetellVoiceProvider.syncAgent(), which pushes it to the vendor;
 *   * docs/retell-agent/*, which is the same thing on paper for anyone who has
 *     to inspect or rebuild the agent without the application.
 *
 * Because both come from this file they cannot disagree.
 *
 * The payloads are typed against the vendor's own parameter definitions — a
 * type-only import, so nothing of retell-sdk is loaded at runtime and the
 * artefact test can read this file freely. That typing is not decoration: it
 * is the only check available without a network, and it is what proves a field
 * name or an enum value is one the vendor actually accepts rather than one
 * that merely looked right.
 */

type RetellLanguage = Extract<Retell.AgentCreateParams['language'], readonly unknown[]>[number]

/** How our two-letter language codes are spelled at the vendor. */
const RETELL_LANGUAGE: Record<LanguageCode, RetellLanguage> = {
  en: 'en-US',
  it: 'it-IT',
}

export interface RetellDefinitionInput {
  readonly config: VoiceAgentConfig
  /** Public origin of this deployment, e.g. https://astra.example. No trailing slash. */
  readonly appUrl: string
  /** Value sent as x-astra-tool-secret on every tool call. */
  readonly toolSecret: string
}

export type RetellCustomTool = Extract<
  NonNullable<Retell.LlmCreateParams['general_tools']>[number],
  { type: 'custom' }
>

/**
 * A caller listening to silence is the vendor's two-minute default timeout.
 * Ten seconds is longer than the slowest tool response we have measured and
 * short enough that the agent can still apologise inside the same breath.
 */
const TOOL_TIMEOUT_MS = 10_000

const CALL_ID_PARAMETER = {
  type: 'string',
  description: 'The Retell call id. Retell fills this in; never invent it.',
} as const

interface ToolSource {
  readonly name: string
  readonly description: string
  readonly properties: Record<string, unknown>
  readonly required: readonly string[]
}

/**
 * Tool descriptions are not documentation. They are the only thing that decides
 * whether the model reaches for a tool at all, so they are written to cover the
 * question a caller actually asks rather than the data we happen to store.
 */
const TOOL_SOURCES: readonly ToolSource[] = [
  {
    name: 'get_business_info',
    description:
      'Everything the restaurant has approved about itself: opening hours, when the kitchen stops taking orders, address and directions, phone, plus its own written answers to common questions — parking, accessibility, children, dogs, wifi, the head chef, seating, payment, dress code, groups, anything else it has published. Call this for ANY question about the restaurant that is not a dish or an allergen, and call it before saying you cannot confirm something.',
    properties: {
      topic: {
        type: 'string',
        description: 'What the caller asked about, e.g. "opening hours". Optional.',
      },
    },
    required: ['call_id'],
  },
  {
    name: 'search_menu',
    description:
      'Search the approved menu. Returns only items the restaurant has approved; unapproved items do not exist as far as this call is concerned.',
    properties: {
      query: { type: 'string', description: 'What the caller asked for, in their own words.' },
      limit: { type: 'integer', description: 'How many items to return. Default is small.' },
    },
    required: ['call_id'],
  },
  {
    name: 'get_allergen_info',
    description:
      'Allergen declarations for one dish. SAFETY-CRITICAL: this is the ONLY source of allergen facts. Pass the caller’s own wording in caller_phrasing so a severe allergy can be detected and escalated.',
    properties: {
      menu_item: { type: 'string', description: 'The dish the caller named.' },
      allergen_code: {
        type: 'string',
        description: 'The allergen the caller named, if any, e.g. "peanuts".',
      },
      caller_phrasing: {
        type: 'string',
        description:
          'The caller’s exact words about their allergy. Used only to detect severity; never stored.',
      },
    },
    required: ['call_id', 'menu_item'],
  },
]

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

export function buildRetellTools(input: RetellDefinitionInput): RetellCustomTool[] {
  const origin = trimTrailingSlash(input.appUrl)

  return TOOL_SOURCES.map((source) => ({
    type: 'custom' as const,
    name: source.name,
    description: source.description,
    url: `${origin}/api/voice/tools/${source.name}`,
    method: 'POST' as const,
    timeout_ms: TOOL_TIMEOUT_MS,
    // The tool endpoints are not covered by the webhook signature scheme, so
    // this one header is what separates a Retell call from anyone on the
    // internet who guessed the path.
    headers: { 'x-astra-tool-secret': input.toolSecret },
    parameter_type: 'json' as const,
    parameters: {
      type: 'object',
      properties: { call_id: CALL_ID_PARAMETER, ...source.properties },
      required: [...source.required],
    },
    query_params: {},
    response_variables: {},
    // args_at_root false keeps the vendor's call object in the payload; the
    // endpoint reads which restaurant the call belongs to from it, never from
    // an argument the model composed.
    args_at_root: false,
    // No invented filler while the lookup runs — a spoken filler is a sentence
    // the restaurant never approved. The answer itself is spoken.
    speak_during_execution: false,
    speak_after_execution: true,
    enable_typing_sound: false,
  }))
}

/** The response engine: prompt, opening line and tools. */
export function buildRetellLlmPayload(input: RetellDefinitionInput): Retell.LlmCreateParams {
  const prompt = buildAgentPrompt(input.config)

  return {
    model: 'gpt-4.1',
    tool_call_strict_mode: true,
    general_prompt: prompt.text,
    // The caller must hear the disclosure before saying anything, so the agent
    // speaks first and speaks our words, not an improvised greeting.
    start_speaker: 'agent',
    begin_message: getDisclosure(input.config.defaultLanguage, {
      locationName: input.config.locationName,
      recordingEnabled: input.config.recordingEnabled,
    }).full,
    knowledge_base_ids: [],
    general_tools: buildRetellTools(input),
  }
}

/**
 * Everything about the agent except which engine answers with it.
 * Split out so the same settings serve an API call, which must name an engine,
 * and an import file, which must not name one that belongs to this account.
 */
function agentSettings(
  input: RetellDefinitionInput,
): Omit<Retell.AgentCreateParams, 'response_engine'> {
  const { config } = input
  const languages = [
    config.defaultLanguage,
    ...config.supportedLanguages.filter((code) => code !== config.defaultLanguage),
  ].map((code) => RETELL_LANGUAGE[code])

  return {
    agent_name: `Astra — ${config.locationName}`,
    voice_id: config.voiceId ?? '',
    language: languages,
    timezone: config.timezone,
    webhook_url: `${trimTrailingSlash(input.appUrl)}/api/webhooks/retell`,
    // No stored audio, at the vendor as well as in our database. The
    // disclosure the caller hears says so, so this is not a preference.
    data_storage_setting: 'basic_attributes_only',
    opt_in_signed_url: false,
    // The agent has no end_call tool in this configuration, so silence and
    // duration are what stop a forgotten open line from spending the credit.
    end_call_after_silence_ms: 62_000,
    max_call_duration_ms: 208_000,
    interruption_sensitivity: 0.9,
    allow_user_dtmf: true,
    post_call_analysis_model: 'gpt-4.1',
    pii_config: { categories: [], mode: 'post_call' },
    // ai_disclosure: when a caller asks outright, the vendor's own layer
    // acknowledges being a virtual assistant too. Our prompt already requires
    // it; this is the second lock on the same door.
    handbook_config: { default_personality: true, ai_disclosure: true },
  }
}

/** The agent as the vendor's create/update endpoint wants it. */
export function buildRetellAgentPayload(
  input: RetellDefinitionInput,
  llmId: string,
): Retell.AgentCreateParams {
  return {
    ...agentSettings(input),
    response_engine: { type: 'retell-llm', llm_id: llmId },
  }
}

/**
 * The agent as a single importable document, for the case where the
 * application cannot reach the vendor and somebody has to rebuild it by hand.
 * Ids are omitted so an import creates its own.
 */
export function buildRetellAgentImport(input: RetellDefinitionInput): Record<string, unknown> {
  return {
    ...agentSettings(input),
    // Present in a dashboard export, but not something the create endpoint
    // accepts — so it belongs to the import file only.
    channel: 'voice',
    response_engine: { type: 'retell-llm' },
    retellLlmData: buildRetellLlmPayload(input),
  }
}
