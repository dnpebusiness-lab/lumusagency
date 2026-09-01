import type { LanguageCode } from '@/lib/db/enums'
import { err, ok, type Result } from '@/lib/result'
import type { VoiceAgentConfig } from '@/lib/providers/voice/types'

/**
 * The database row a manager edits, turned into the vocabulary the provider
 * boundary speaks.
 *
 * Kept pure and separate from the action that reads it so the awkward parts —
 * a missing voice, a location with no Italian greeting, recording switched on —
 * are decided by a function a test can call, rather than inside a form handler.
 */

/** Shape selected from public.agent_configurations joined to its location. */
export interface AgentConfigurationRow {
  location_id: string
  organisation_id: string
  default_language: LanguageCode
  supported_languages: LanguageCode[] | null
  greeting_en: string | null
  greeting_it: string | null
  ai_disclosure_en: string | null
  ai_disclosure_it: string | null
  voice_id: string | null
  retell_agent_id: string | null
  transfer_enabled: boolean
  transfer_number_e164: string | null
  recording_enabled: boolean
  prompt_version: number
  locations: { name: string; timezone: string } | { name: string; timezone: string }[] | null
}

/**
 * What the seed writes so that a demonstration database is complete without
 * naming a voice that only exists in one vendor account. It is not a voice:
 * synchronising it would be rejected by the vendor with an error nobody can
 * act on, so it is treated here as "not chosen yet".
 */
export const PLACEHOLDER_VOICE_ID = 'demo-voice-placeholder'

export function hasRealVoice(voiceId: string | null): boolean {
  return voiceId !== null && voiceId !== '' && voiceId !== PLACEHOLDER_VOICE_ID
}

function firstOf<T>(value: T | T[] | null): T | null {
  if (value === null) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

export function toVoiceAgentConfig(row: AgentConfigurationRow): Result<VoiceAgentConfig> {
  const location = firstOf(row.locations)
  if (!location) {
    return err('invalid_input', 'This agent configuration has no location attached to it.', {
      retryable: false,
    })
  }

  if (row.recording_enabled) {
    // The adapter refuses this too. Refusing here as well means the reason
    // reaches the person reading the screen instead of a vendor error code.
    return err(
      'rejected',
      'Audio recording is switched on for this restaurant. Milestone 4A keeps no audio, so the agent cannot be synchronised until it is switched off.',
      { retryable: false },
    )
  }

  if (!hasRealVoice(row.voice_id)) {
    return err(
      'invalid_input',
      'No voice has been chosen for this restaurant yet. Pick one just above, then synchronise.',
      { retryable: false },
    )
  }

  const supported = (row.supported_languages ?? []).filter(
    (code): code is LanguageCode => code === 'en' || code === 'it',
  )

  return ok({
    locationId: row.location_id,
    organisationId: row.organisation_id,
    locationName: location.name,
    timezone: location.timezone,
    defaultLanguage: row.default_language,
    supportedLanguages: supported.length > 0 ? supported : [row.default_language],
    voiceId: row.voice_id,
    greeting: { en: row.greeting_en, it: row.greeting_it },
    aiDisclosure: { en: row.ai_disclosure_en, it: row.ai_disclosure_it },
    transferEnabled: row.transfer_enabled,
    transferNumberE164: row.transfer_number_e164,
    recordingEnabled: row.recording_enabled,
    promptVersion: row.prompt_version,
    providerAgentId: row.retell_agent_id,
  })
}

/** Columns to select. Named once so the query and the row type cannot drift. */
export const AGENT_CONFIGURATION_COLUMNS =
  'location_id, organisation_id, default_language, supported_languages, greeting_en, greeting_it, ai_disclosure_en, ai_disclosure_it, voice_id, retell_agent_id, transfer_enabled, transfer_number_e164, recording_enabled, prompt_version, locations(name, timezone)'
