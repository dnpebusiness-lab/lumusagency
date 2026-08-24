import 'server-only'

import type { LanguageCode } from '@/lib/db/enums'
import type { VoiceCallEvent, VoiceTranscriptTurn } from '@/lib/providers/voice/types'
import { DISCLOSURE_VERSION, disclosureFragments } from '@/lib/agent/disclosure'

/**
 * Turns a normalised vendor event into the payload the transactional ingest RPC
 * expects, and derives the things the vendor does not tell us.
 *
 * Everything derived here is a documented heuristic, not a claim of fact. Where
 * a heuristic cannot decide, the field is left null rather than guessed: an
 * empty intent is honest, a wrong one silently corrupts the dashboard.
 */

export interface IngestContext {
  readonly organisationId: string
  readonly locationId: string
  readonly locationName: string
  readonly defaultLanguage: LanguageCode
  readonly supportedLanguages: readonly LanguageCode[]
  readonly recordingEnabled: boolean
  /** Secret salt for the caller correlation hash. Never logged, never returned. */
  readonly callerSalt: string
}

/**
 * Keyword sets for the primary-intent heuristic.
 *
 * Deliberately shallow: Milestone 4A needs the Calls list to be scannable, not a
 * classifier. Anything unmatched stays null and shows as "unclassified" rather
 * than being forced into a bucket.
 */
const INTENT_KEYWORDS: ReadonlyArray<{ intent: string; patterns: readonly RegExp[] }> = [
  {
    intent: 'allergen',
    patterns: [
      /\ballerg/i,
      /\bgluten\b/i,
      /\bcoeliac\b/i,
      /\bceliac\b/i,
      /\bnut[s]?\b/i,
      /\bglutine\b/i,
      /\bintolleran/i,
    ],
  },
  {
    intent: 'hours',
    patterns: [
      /\bopen(ing)?\b/i,
      /\bclos(e|ed|ing)\b/i,
      /\bwhat time\b/i,
      /\borari?\b/i,
      /\baperto\b/i,
      /\bchius/i,
    ],
  },
  {
    intent: 'reservation',
    patterns: [/\bbook(ing)?\b/i, /\btable\b/i, /\breserv/i, /\bprenot/i, /\btavolo\b/i],
  },
  {
    intent: 'menu',
    patterns: [
      /\bmenu\b/i,
      /\bdish(es)?\b/i,
      /\bvegan\b/i,
      /\bvegetarian\b/i,
      /\bprice\b/i,
      /\bpiatt/i,
      /\bprezz/i,
    ],
  },
  {
    intent: 'directions',
    patterns: [
      /\bwhere are you\b/i,
      /\baddress\b/i,
      /\bpark(ing)?\b/i,
      /\bindirizzo\b/i,
      /\bparcheggio\b/i,
      /\bdove siete\b/i,
    ],
  },
  {
    intent: 'human_request',
    patterns: [
      /\bspeak to (a|someone|somebody)\b/i,
      /\breal person\b/i,
      /\bmanager\b/i,
      /\bpersona\b/i,
      /\bqualcuno\b/i,
    ],
  },
  {
    intent: 'complaint',
    patterns: [/\bcomplain/i, /\bterrible\b/i, /\brude\b/i, /\breclamo\b/i, /\blament/i],
  },
]

function callerText(transcript: readonly VoiceTranscriptTurn[]): string {
  return transcript
    .filter((turn) => turn.speaker === 'caller')
    .map((turn) => turn.content)
    .join(' ')
}

export function deriveIntents(transcript: readonly VoiceTranscriptTurn[]): {
  primary: string | null
  all: string[]
} {
  const text = callerText(transcript)
  if (text.trim() === '') return { primary: null, all: [] }

  const matched = INTENT_KEYWORDS.filter((entry) =>
    entry.patterns.some((pattern) => pattern.test(text)),
  ).map((entry) => entry.intent)

  // Allergen wins whenever it appears: it is the one intent where a
  // misclassification has a safety consequence, so it is never demoted.
  const primary = matched.includes('allergen') ? 'allergen' : (matched[0] ?? null)

  return { primary, all: matched }
}

/** Vendor disconnection reasons that mean the system failed, not the caller left. */
const FAILURE_REASONS = new Set([
  'error_llm_websocket_open',
  'error_llm_websocket_lost_connection',
  'error_llm_websocket_runtime',
  'error_llm_websocket_corrupt_payload',
  'error_no_audio_received',
  'error_asr',
  'error_retell',
  'error_unknown',
  'telephony_provider_unavailable',
  'sip_routing_error',
  'dial_failed',
])

/**
 * Milestone 4A is information-only, so the outcome vocabulary in use here is
 * deliberately narrow. A call that reached a conversation resolved information;
 * anything else is a failure mode, never a booking.
 */
export function deriveOutcome(event: VoiceCallEvent): string | null {
  if (event.kind === 'call_started') return null

  if (event.inVoicemail) return 'voicemail'
  if (event.disconnectionReason && FAILURE_REASONS.has(event.disconnectionReason)) {
    return 'system_failure'
  }
  if (
    event.disconnectionReason === 'marked_as_spam' ||
    event.disconnectionReason === 'scam_detected'
  ) {
    return 'spam'
  }

  const callerTurns = event.transcript.filter((turn) => turn.speaker === 'caller').length
  if (callerTurns === 0) return 'abandoned'

  return 'resolved_information'
}

/**
 * Detect from the transcript whether the disclosure was actually delivered.
 *
 * This is evidence rather than assertion: it reads what the agent is recorded as
 * having said, not what we intended it to say. A prompt regression that drops
 * the disclosure therefore shows up as a call with no disclosure evidence, which
 * is exactly the signal we want.
 */
export function detectDisclosure(
  event: VoiceCallEvent,
  context: IngestContext,
): { version: string | null; language: LanguageCode | null; completedAt: string | null } {
  const agentTurns = event.transcript.filter((turn) => turn.speaker === 'agent')
  if (agentTurns.length === 0) {
    return { version: null, language: null, completedAt: null }
  }

  // Only the opening turns count. A disclosure delivered after five minutes of
  // data collection is not a disclosure.
  const opening = agentTurns.slice(0, 3)

  for (const language of context.supportedLanguages) {
    // Two independent fragments must BOTH appear: the assistant's name and the
    // word "transcribed". Matching a whole sentence would fail on ordinary
    // speech-synthesis and transcription noise; matching one fragment alone
    // would count a greeting that names Astra but never mentions transcription,
    // which is not a disclosure at all. See compliance/12.
    const fragments = disclosureFragments(language)

    const turn = opening.find((t) => {
      const normalised = t.content.toLowerCase().replace(/[^a-z ]/g, '')
      return fragments.every((fragment) => normalised.includes(fragment))
    })

    if (turn) {
      const completedAt =
        turn.endedAtMs !== null && event.startedAt
          ? new Date(new Date(event.startedAt).getTime() + turn.endedAtMs).toISOString()
          : (event.startedAt ?? null)

      return { version: DISCLOSURE_VERSION, language, completedAt }
    }
  }

  return { version: null, language: null, completedAt: null }
}

/** Language actually spoken, inferred from which disclosure matched, else the default. */
function deriveLanguage(detected: LanguageCode | null, context: IngestContext): LanguageCode {
  return detected ?? context.defaultLanguage
}

export interface IngestPayload extends Record<string, unknown> {
  vendor: string
  event_id: string
  event_kind: string
}

/**
 * Build the RPC payload.
 *
 * Note what never appears in it: any recording URL. The mapper has already
 * dropped it; when one was present we record the fact as an event so the
 * discard is auditable (TPR-1.2).
 */
export function buildIngestPayload(event: VoiceCallEvent, context: IngestContext): IngestPayload {
  const disclosure = detectDisclosure(event, context)
  const intents = deriveIntents(event.transcript)
  const language = deriveLanguage(disclosure.language, context)

  const events: Array<Record<string, unknown>> = []

  if (event.kind === 'call_started') {
    events.push({ event_type: 'call_started', occurred_at: event.startedAt })
  }

  if (disclosure.completedAt) {
    events.push({
      event_type: 'ai_disclosure_completed',
      occurred_at: disclosure.completedAt,
      payload: { version: disclosure.version, language: disclosure.language },
    })
  }

  if (event.recordingUrlDiscarded) {
    events.push({
      event_type: 'recording_url_discarded',
      payload: { reason: 'audio recording is disabled for this location (TPR-1.2)' },
    })
  }

  if (event.kind === 'call_ended') {
    events.push({
      event_type: 'call_ended',
      occurred_at: event.endedAt,
      payload: { disconnection_reason: event.disconnectionReason },
    })
  }

  return {
    vendor: 'retell',
    event_id: event.eventId,
    event_kind: event.kind,
    provider: 'retell',
    provider_call_id: event.providerCallId,
    organisation_id: context.organisationId,
    location_id: context.locationId,
    caller_salt: context.callerSalt,
    status: event.kind === 'call_started' ? 'in_progress' : 'completed',
    outcome: deriveOutcome(event),
    started_at: event.startedAt,
    ended_at: event.endedAt,
    caller_number_e164: event.fromNumberE164,
    initial_language: context.defaultLanguage,
    detected_language: language,
    primary_intent: intents.primary,
    intents: intents.all,
    disclosure_version: disclosure.version,
    disclosure_language: disclosure.language,
    disclosure_completed_at: disclosure.completedAt,
    is_internal_evaluation: true,
    cost_cents: event.costCents,
    summary: event.summary,
    sentiment: event.sentiment,
    summary_model: event.summary ? 'retell-post-call-analysis' : null,
    transcript: event.transcript,
    events,
    metadata: event.metadata,
  }
}
