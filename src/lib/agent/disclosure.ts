import type { LanguageCode } from '@/lib/db/enums'

/**
 * AI and transcription disclosure (TECHNICAL_PRIVACY_REQUIREMENTS.md TPR-2).
 *
 * The human-reviewable source is compliance/06_AI_AND_RECORDING_DISCLOSURE_SCRIPTS.md.
 * tests/unit/disclosure.test.ts asserts this file and that document have not
 * drifted, so the wording a lawyer reviews is the wording a caller hears.
 *
 * Milestone 4A permits the no-stored-audio variant only. The recorded variant is
 * defined so the shape is complete, and is rejected while recording is disabled.
 */

export type DisclosureVariant = 'ai_no_recording' | 'ai_with_recording'
export const DISCLOSURE_VERSION = 'v1' as const

export interface DisclosureScript {
  readonly version: string
  readonly variant: DisclosureVariant
  readonly language: LanguageCode
  /** Full opening line, with {location_name} substituted at build time. */
  readonly full: string
  /**
   * The part that must have been heard before any caller data is collected.
   * If the caller talks over the line, this is what gets replayed.
   */
  readonly material: string
  /** Shorter line used when completing an interrupted disclosure. */
  readonly replay: string
}

type ScriptBody = Omit<DisclosureScript, 'version' | 'variant' | 'language'>

const SCRIPTS: Record<DisclosureVariant, Record<LanguageCode, ScriptBody>> = {
  ai_no_recording: {
    en: {
      full: "You're through to {location_name}. Just so you know, I'm an automated assistant, this call is transcribed, and no audio recording is kept. How can I help?",
      material:
        "I'm an automated assistant, this call is transcribed, and no audio recording is kept.",
      replay:
        "Sorry, just to finish that — I'm an automated assistant and this call is transcribed, with no audio recording kept.",
    },
    it: {
      full: 'Ha chiamato {location_name}. Le segnalo che sono un assistente automatico, la conversazione viene trascritta e non viene conservata alcuna registrazione audio. Come posso aiutarla?',
      material:
        'sono un assistente automatico, la conversazione viene trascritta e non viene conservata alcuna registrazione audio.',
      replay:
        'Scusi, completo solo una cosa: sono un assistente automatico e la conversazione viene trascritta, senza registrazione audio.',
    },
  },
  ai_with_recording: {
    en: {
      full: "You're through to {location_name}. I'm an automated assistant, and this call is recorded and transcribed. If you'd rather not be recorded, say so and I'll pass you to a colleague. How can I help?",
      material: "I'm an automated assistant, and this call is recorded and transcribed.",
      replay:
        "Sorry, just to finish that — I'm an automated assistant and this call is recorded and transcribed.",
    },
    it: {
      full: 'Ha chiamato {location_name}. Sono un assistente automatico e questa chiamata viene registrata e trascritta. Se preferisce non essere registrato me lo dica e la passo a un collega. Come posso aiutarla?',
      material: 'Sono un assistente automatico e questa chiamata viene registrata e trascritta.',
      replay:
        'Scusi, completo solo una cosa: sono un assistente automatico e la chiamata viene registrata e trascritta.',
    },
  },
}

export function getDisclosure(
  language: LanguageCode,
  options: { locationName: string; recordingEnabled: boolean },
): DisclosureScript {
  const variant: DisclosureVariant = options.recordingEnabled
    ? 'ai_with_recording'
    : 'ai_no_recording'
  const script = SCRIPTS[variant][language]

  return {
    version: DISCLOSURE_VERSION,
    variant,
    language,
    full: script.full.replace('{location_name}', options.locationName),
    material: script.material,
    replay: script.replay,
  }
}

/** Every script, for the drift test and for a future approval workflow. */
export function allDisclosures(): DisclosureScript[] {
  const out: DisclosureScript[] = []
  for (const variant of Object.keys(SCRIPTS) as DisclosureVariant[]) {
    for (const language of Object.keys(SCRIPTS[variant]) as LanguageCode[]) {
      const script = SCRIPTS[variant][language]
      out.push({ version: DISCLOSURE_VERSION, variant, language, ...script })
    }
  }
  return out
}

/**
 * Milestone 4A gate: only the no-stored-audio variant may be used.
 * Returns the reason when refused, so a caller cannot ignore a bare false.
 */
export function assertDisclosurePermitted(script: DisclosureScript): string | null {
  if (script.variant === 'ai_with_recording') {
    return 'The recorded-call disclosure is not permitted in Milestone 4A: no audio is stored (TPR-1.1).'
  }
  return null
}

export interface DisclosureState {
  readonly startedAt: string | null
  readonly completedAt: string | null
  readonly interrupted: boolean
}

/**
 * Whether the material part still owes the caller a replay.
 *
 * Interruption does not excuse the disclosure — it postpones it. A caller who
 * talked over the opening line has not been told anything, so data collection
 * stays blocked until this returns false.
 */
export function disclosureNeedsReplay(state: DisclosureState): boolean {
  if (state.completedAt) return false
  return state.startedAt !== null
}

/** May the agent collect caller information yet? */
export function mayCollectCallerData(state: DisclosureState): boolean {
  return state.completedAt !== null
}
