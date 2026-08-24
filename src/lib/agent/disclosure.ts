import type { LanguageCode } from '@/lib/db/enums'

/**
 * AI and privacy disclosure scripts.
 *
 * WORDING SOURCE: compliance/06_AI_AND_RECORDING_DISCLOSURE_SCRIPTS.md, which is
 * the founder's own reviewed draft, restored verbatim from the M4A handoff
 * package on 24 August 2026. Earlier reconstructed wording was replaced by it;
 * the superseded version is kept at docs/reconstructed-superseded/ for
 * inspection.
 *
 * The division of labour matters:
 *   * the DOCUMENT owns the words a caller hears — it is what a solicitor and
 *     the pilot restaurant sign off;
 *   * this FILE owns the mechanism — versioning, variant selection, replay after
 *     interruption, and detection evidence.
 *
 * tests/unit/disclosure.test.ts compares the two and fails on any drift, so the
 * wording that gets reviewed is the wording that gets spoken.
 *
 * Milestone 4A permits the no-stored-audio scripts only. The recorded-call flow
 * exists in the document, is marked "do not deploy in M4A" there, and is
 * rejected here by assertDisclosurePermitted().
 */

export type DisclosureVariant = 'ai_no_recording' | 'ai_with_recording'

/** Which of the two approved no-recording phrasings a location uses. */
export type DisclosureLength = 'full' | 'short'

export const DISCLOSURE_VERSION = 'v1' as const
export const AGENT_NAME = 'Astra' as const

export interface DisclosureScript {
  readonly version: string
  readonly variant: DisclosureVariant
  readonly length: DisclosureLength
  readonly language: LanguageCode
  /** The opening line, with the restaurant name substituted. */
  readonly full: string
  /**
   * The part that must have been heard before any caller data is collected.
   * Location-free, so it can be replayed without repeating the whole greeting.
   */
  readonly material: string
  /** Line used to complete an interrupted disclosure. */
  readonly replay: string
}

/**
 * Approved answers to the questions a caller asks about privacy. These are not
 * optional extras: PRIV-* in voice_qa/VOICE_TEST_CASES.csv are P0 release
 * blockers, and "are you recording me?" is the single likeliest privacy question
 * an Irish caller will actually ask.
 */
export interface PrivacyScripts {
  /** Caller asks what happens to their data, or whether they are recorded. */
  readonly privacyDetails: string
  /** Caller refuses to be transcribed. Transcription is required to operate. */
  readonly refusesTranscription: string
}

const PLACEHOLDER_EN = '[Restaurant]'
const PLACEHOLDER_IT = '[Ristorante]'

interface ScriptSource {
  readonly full: string
  readonly short: string
  readonly material: string
  readonly replay: string
  readonly privacyDetails: string
  readonly refusesTranscription: string
}

/**
 * Verbatim from compliance/06. Only `material` and `replay` are ours: the
 * document defines no replay fragment, because completing an interrupted
 * disclosure is a mechanism rather than a script. They are built from the
 * document's own words so nothing new is said to a caller.
 */
const SOURCE: Record<LanguageCode, ScriptSource> = {
  en: {
    full: `Hi, you’re speaking with Astra, an AI assistant for ${PLACEHOLDER_EN}. I’ll create a text transcript to answer your questions and record the outcome of this call. You can ask for a member of staff at any time. How can I help?`,
    short: `Hi, I’m Astra, the AI assistant for ${PLACEHOLDER_EN}. This call is transcribed, not audio-recorded. You can ask for a member of staff at any time. How can I help?`,
    material:
      'I’m Astra, an AI assistant. This call is transcribed, not audio-recorded. You can ask for a member of staff at any time.',
    replay:
      'Sorry, just to finish that — I’m Astra, an AI assistant, and this call is transcribed, not audio-recorded. You can ask for a member of staff at any time.',
    privacyDetails:
      'The restaurant uses the transcript to answer your request and manage any booking. The pilot does not store an audio recording. I can send or read the restaurant’s privacy-contact details, or try to connect you with a member of staff.',
    refusesTranscription:
      'I understand. I need text transcription to operate, so I can’t continue through the AI service without it. I can try to connect you with the restaurant, take a minimal callback request if you agree, or give you the restaurant’s direct contact details.',
  },
  it: {
    full: `Ciao, stai parlando con Astra, l’assistente AI di ${PLACEHOLDER_IT}. Creerò una trascrizione testuale per rispondere alle tue domande e registrare l’esito della chiamata. Puoi chiedere di parlare con una persona in qualsiasi momento. Come posso aiutarti?`,
    short: `Ciao, sono Astra, l’assistente AI di ${PLACEHOLDER_IT}. Questa chiamata viene trascritta, ma l’audio non viene registrato. Puoi chiedere di parlare con una persona in qualsiasi momento. Come posso aiutarti?`,
    material:
      'Sono Astra, l’assistente AI. Questa chiamata viene trascritta, ma l’audio non viene registrato. Puoi chiedere di parlare con una persona in qualsiasi momento.',
    replay:
      'Scusa, completo solo una cosa: sono Astra, l’assistente AI, la chiamata viene trascritta e l’audio non viene registrato. Puoi chiedere di parlare con una persona in qualsiasi momento.',
    privacyDetails:
      'Il ristorante usa la trascrizione per rispondere alla tua richiesta e gestire un’eventuale prenotazione. Durante il progetto pilota non viene salvata una registrazione audio. Posso indicarti i contatti privacy del ristorante o provare a passarti una persona.',
    refusesTranscription:
      'Capisco. Per funzionare ho bisogno della trascrizione testuale, quindi non posso continuare tramite il servizio AI senza di essa. Posso provare a passarti il ristorante, registrare una richiesta minima di richiamata se sei d’accordo, oppure indicarti i contatti diretti.',
  },
}

/**
 * The recorded-call flow. Present so the shape is complete and so the M4A
 * refusal has something to refuse; the document marks it "do not deploy in M4A".
 */
const RECORDING_SOURCE: Record<
  LanguageCode,
  Pick<ScriptSource, 'full' | 'short' | 'material' | 'replay'>
> = {
  en: {
    full: `Hi, you’re speaking with Astra, an AI assistant for ${PLACEHOLDER_EN}. With your permission, this call will be audio-recorded and transcribed for [specific purpose]. Are you happy for the recording to begin?`,
    short: `Hi, you’re speaking with Astra, an AI assistant for ${PLACEHOLDER_EN}. With your permission, this call will be audio-recorded and transcribed for [specific purpose]. Are you happy for the recording to begin?`,
    material: 'I’m Astra, an AI assistant, and this call would be audio-recorded and transcribed.',
    replay:
      'Sorry, just to finish that — I’m Astra, an AI assistant, and this call would be recorded.',
  },
  it: {
    full: `Ciao, stai parlando con Astra, l’assistente AI di ${PLACEHOLDER_IT}. Con il tuo permesso, questa chiamata verrà registrata e trascritta per [finalità specifica]. Accetti che inizi la registrazione?`,
    short: `Ciao, stai parlando con Astra, l’assistente AI di ${PLACEHOLDER_IT}. Con il tuo permesso, questa chiamata verrà registrata e trascritta per [finalità specifica]. Accetti che inizi la registrazione?`,
    material: 'Sono Astra, l’assistente AI, e questa chiamata verrebbe registrata e trascritta.',
    replay:
      'Scusa, completo solo una cosa: sono Astra, l’assistente AI, e la chiamata verrebbe registrata.',
  },
}

function substitute(text: string, locationName: string): string {
  return text.replaceAll(PLACEHOLDER_EN, locationName).replaceAll(PLACEHOLDER_IT, locationName)
}

export function getDisclosure(
  language: LanguageCode,
  options: { locationName: string; recordingEnabled: boolean; length?: DisclosureLength },
): DisclosureScript {
  const length = options.length ?? 'full'

  if (options.recordingEnabled) {
    const source = RECORDING_SOURCE[language]
    return {
      version: DISCLOSURE_VERSION,
      variant: 'ai_with_recording',
      length,
      language,
      full: substitute(length === 'short' ? source.short : source.full, options.locationName),
      material: source.material,
      replay: source.replay,
    }
  }

  const source = SOURCE[language]
  return {
    version: DISCLOSURE_VERSION,
    variant: 'ai_no_recording',
    length,
    language,
    full: substitute(length === 'short' ? source.short : source.full, options.locationName),
    material: source.material,
    replay: source.replay,
  }
}

export function getPrivacyScripts(language: LanguageCode): PrivacyScripts {
  const source = SOURCE[language]
  return {
    privacyDetails: source.privacyDetails,
    refusesTranscription: source.refusesTranscription,
  }
}

/** Every script, for the drift test and for a future approval workflow. */
export function allDisclosures(): DisclosureScript[] {
  const out: DisclosureScript[] = []
  for (const language of Object.keys(SOURCE) as LanguageCode[]) {
    for (const length of ['full', 'short'] as DisclosureLength[]) {
      for (const recordingEnabled of [false, true]) {
        out.push(
          getDisclosure(language, {
            locationName: language === 'it' ? PLACEHOLDER_IT : PLACEHOLDER_EN,
            recordingEnabled,
            length,
          }),
        )
      }
    }
  }
  return out
}

/**
 * Milestone 4A gate: only the no-stored-audio scripts may be used.
 * Returns the reason when refused, so a caller cannot ignore a bare false.
 */
export function assertDisclosurePermitted(script: DisclosureScript): string | null {
  if (script.variant === 'ai_with_recording') {
    return 'The recorded-call disclosure is not permitted in Milestone 4A: no audio is stored (TECHNICAL_PRIVACY_REQUIREMENTS.md, hard defaults).'
  }
  return null
}

/**
 * Fragments that must BOTH appear in a spoken turn for it to count as the
 * disclosure. Two independent parts rather than one long string, because speech
 * synthesis and transcription both perturb punctuation and word order, and
 * because "named the AI" and "said it is transcribed" are the two things the AI
 * Act checklist actually requires (compliance/12).
 */
export function disclosureFragments(language: LanguageCode): readonly string[] {
  return language === 'it' ? ['astra', 'trascri'] : ['astra', 'transcri']
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
