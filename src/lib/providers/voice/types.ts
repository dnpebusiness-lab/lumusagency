import type { Result } from '@/lib/result'
import type { LanguageCode } from '@/lib/db/enums'

/**
 * The voice-provider boundary described in ARCHITECTURE.md §3.
 *
 * Two rules make it a real boundary rather than a decorative one:
 *
 *   1. Nothing throws across it. Every method returns Result<T>, so a vendor
 *      outage is a value the caller must handle rather than an exception that
 *      can be swallowed and turned into a confirmation the caller never earned.
 *
 *   2. No vendor SDK type appears in this file. Application and domain code
 *      import from here; only the adapter under ./retell/ imports retell-sdk.
 *      tests/unit/provider-boundary.test.ts scans the source tree and fails if
 *      that is ever violated.
 */

export type VoiceProviderId = 'retell'

/** Configuration the provider needs to synchronise an agent, in our own vocabulary. */
export interface VoiceAgentConfig {
  readonly locationId: string
  readonly organisationId: string
  readonly locationName: string
  /** IANA zone of the location, e.g. Europe/Dublin. The vendor needs it to read hours aloud correctly. */
  readonly timezone: string
  readonly defaultLanguage: LanguageCode
  readonly supportedLanguages: readonly LanguageCode[]
  readonly voiceId: string | null
  readonly greeting: Record<LanguageCode, string | null>
  readonly aiDisclosure: Record<LanguageCode, string | null>
  readonly transferEnabled: boolean
  readonly transferNumberE164: string | null
  readonly recordingEnabled: boolean
  readonly promptVersion: number
  readonly providerAgentId: string | null
}

export interface VoiceAgentRef {
  readonly providerAgentId: string
  readonly syncedAt: string
  /**
   * True when the vendor had no agent to update and a new one was created.
   * The caller has to be told: a new agent id means the phone number is still
   * pointed at the old one, and silence about that is a dead line.
   */
  readonly created: boolean
}

/** A lifecycle event, normalised away from any vendor's field names. */
export type VoiceEventKind = 'call_started' | 'call_updated' | 'call_ended' | 'call_analyzed'

export interface VoiceTranscriptTurn {
  readonly turnIndex: number
  readonly speaker: 'agent' | 'caller' | 'system'
  readonly content: string
  readonly startedAtMs: number | null
  readonly endedAtMs: number | null
}

export interface VoiceCallEvent {
  readonly kind: VoiceEventKind
  /** Stable per (kind, call) pair — the idempotency key. */
  readonly eventId: string
  readonly providerCallId: string
  readonly providerAgentId: string | null
  readonly fromNumberE164: string | null
  readonly toNumberE164: string | null
  readonly startedAt: string | null
  readonly endedAt: string | null
  readonly durationSeconds: number | null
  readonly disconnectionReason: string | null
  readonly transcript: readonly VoiceTranscriptTurn[]
  readonly summary: string | null
  readonly sentiment: 'positive' | 'neutral' | 'negative' | null
  readonly successful: boolean | null
  readonly inVoicemail: boolean
  readonly costCents: number | null
  /** Vendor metadata we chose to keep. Never contains transcript text or a recording URL. */
  readonly metadata: Record<string, unknown>
  /**
   * True when the vendor payload carried an audio recording URL that we
   * discarded. Recorded as evidence for TPR-1.2; the URL itself is never
   * carried across this boundary.
   */
  readonly recordingUrlDiscarded: boolean
}

/** One voice a caller could hear, described without any vendor field names. */
export interface VoiceOption {
  readonly id: string
  readonly name: string
  readonly gender: 'male' | 'female'
  readonly accent: string | null
  readonly previewUrl: string | null
}

export interface VoiceProvider {
  readonly id: VoiceProviderId

  /** Push our approved configuration to the vendor. */
  syncAgent(config: VoiceAgentConfig): Promise<Result<VoiceAgentRef>>

  /**
   * The voices this account may use. Read-only, and needed so choosing a voice
   * is a list in our own interface rather than an identifier copied by hand out
   * of the vendor's dashboard into a SQL statement.
   */
  listVoices(): Promise<Result<readonly VoiceOption[]>>

  /**
   * Verify a webhook against the RAW request body and return the normalised
   * event. Must be called before the body is parsed as JSON.
   */
  verifyWebhook(rawBody: string, headers: Headers): Promise<Result<VoiceCallEvent>>

  /** Transfer a live call to a human. Not used in Milestone 4A; Milestone 5 owns it. */
  transferCall(providerCallId: string, toE164: string): Promise<Result<void>>
}
