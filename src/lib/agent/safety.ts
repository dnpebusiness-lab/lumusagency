import type { LanguageCode } from '@/lib/db/enums'

/**
 * Allergen answer shaping (TECHNICAL_PRIVACY_REQUIREMENTS.md TPR-4).
 *
 * This is the most safety-critical code in the repository. Getting a booking
 * wrong costs a table; getting an allergen wrong can put somebody in hospital.
 *
 * Three rules, enforced here in code rather than hoped for in a prompt:
 *
 *   1. Only an item-specific, approved "contains" declaration may be stated as
 *      fact. Everything else is reported as uncertainty.
 *   2. The absence of a declaration is "not confirmed", never "does not
 *      contain". A missing row means nobody checked, not that the dish is safe.
 *   3. A severe allergy produces no dish claim at all. It produces a transfer.
 *
 * The function deliberately returns a structured verdict rather than a sentence,
 * so the caller cannot accidentally build a reassurance out of it and the tests
 * can assert on the verdict rather than on prose.
 */

export type AllergenVerdict =
  | 'contains'
  | 'may_contain'
  | 'declared_free_from'
  | 'not_confirmed'
  | 'escalate_severe_allergy'
  | 'escalate_no_approved_data'

export interface AllergenDeclaration {
  readonly code: string
  readonly nameEn: string
  readonly nameIt: string
  readonly crossContaminationNotes?: string | null
}

export interface AllergenFacts {
  readonly menuItemId: string | null
  readonly nameEn: string | null
  readonly nameIt: string | null
  readonly contains: readonly AllergenDeclaration[]
  readonly mayContain: readonly AllergenDeclaration[]
  readonly declaredFreeFrom: readonly AllergenDeclaration[]
  readonly undeclared: readonly AllergenDeclaration[]
  readonly crossContaminationNotes?: string | null
}

export interface AllergenQuestion {
  /** The allergen the caller asked about, if they named one. */
  readonly allergenCode: string | null
  /** True when the caller signalled severity: "severe", "anaphylactic", "EpiPen", "grave". */
  readonly severe: boolean
}

export interface AllergenAnswer {
  readonly verdict: AllergenVerdict
  /** Facts that may be spoken. Empty for every escalation verdict. */
  readonly speakableFacts: readonly string[]
  /** True only when the agent must hand the call to a human. */
  readonly mustEscalate: boolean
  readonly escalationReason: 'severe_allergy' | 'outside_approved_information' | null
  /** Machine-readable reminder carried alongside every answer. */
  readonly safetyDirective: string
}

const SAFETY_DIRECTIVE =
  'Report declared facts only. Never state or imply that a dish is safe for an allergy. ' +
  'An allergen with no approved declaration is NOT CONFIRMED, never absent. ' +
  'Transfer any severe allergy enquiry to a human.'

/** Words that mark an allergy as severe in either supported language. */
const SEVERITY_MARKERS: readonly RegExp[] = [
  /\bsevere(ly)?\b/i,
  /\banaphyla/i,
  /\bepi\s?-?pen\b/i,
  /\blife[-\s]?threatening\b/i,
  /\bserious(ly)?\s+allergic\b/i,
  /\bcoeliac\b/i,
  /\bceliac\b/i,
  /\bgrave\b/i,
  /\bforte(mente)?\s+allergic/i,
  /\banafila/i,
  /\bshock\s+anafilattico\b/i,
]

/** Detect severity from free caller speech. Errs towards treating it as severe. */
export function detectSeverity(utterance: string): boolean {
  return SEVERITY_MARKERS.some((pattern) => pattern.test(utterance))
}

function name(declaration: AllergenDeclaration, language: LanguageCode): string {
  return language === 'it' ? declaration.nameIt : declaration.nameEn
}

/**
 * Decide what may be said about a dish and an allergen.
 *
 * Order of checks matters and is deliberate: severity is evaluated before any
 * data is consulted, so a severe allergy escalates even when we happen to hold
 * a complete and reassuring set of declarations for the dish.
 */
export function assessAllergenQuestion(
  question: AllergenQuestion,
  facts: AllergenFacts | null,
  language: LanguageCode = 'en',
): AllergenAnswer {
  // Rule 3, first and unconditional.
  if (question.severe) {
    return {
      verdict: 'escalate_severe_allergy',
      speakableFacts: [],
      mustEscalate: true,
      escalationReason: 'severe_allergy',
      safetyDirective: SAFETY_DIRECTIVE,
    }
  }

  // No approved record for the dish at all: the agent knows nothing about it.
  if (!facts || facts.menuItemId === null) {
    return {
      verdict: 'escalate_no_approved_data',
      speakableFacts: [],
      mustEscalate: true,
      escalationReason: 'outside_approved_information',
      safetyDirective: SAFETY_DIRECTIVE,
    }
  }

  const asked = question.allergenCode

  // Caller did not name an allergen: list only what the dish is declared to
  // contain, plus any cross-contamination note, verbatim.
  if (!asked) {
    const facts_ = facts.contains.map((d) => `contains ${name(d, language)}`)
    for (const d of facts.mayContain) {
      facts_.push(`may contain ${name(d, language)} (cross-contamination)`)
    }
    return {
      verdict: facts.contains.length > 0 ? 'contains' : 'not_confirmed',
      speakableFacts: facts_,
      mustEscalate: false,
      escalationReason: null,
      safetyDirective: SAFETY_DIRECTIVE,
    }
  }

  const inContains = facts.contains.find((d) => d.code === asked)
  if (inContains) {
    return {
      verdict: 'contains',
      speakableFacts: [`contains ${name(inContains, language)}`],
      mustEscalate: false,
      escalationReason: null,
      safetyDirective: SAFETY_DIRECTIVE,
    }
  }

  const inMayContain = facts.mayContain.find((d) => d.code === asked)
  if (inMayContain) {
    const note = inMayContain.crossContaminationNotes ?? facts.crossContaminationNotes ?? null
    return {
      verdict: 'may_contain',
      speakableFacts: [
        `may contain ${name(inMayContain, language)} through cross-contamination`,
        ...(note ? [note] : []),
      ],
      mustEscalate: false,
      escalationReason: null,
      safetyDirective: SAFETY_DIRECTIVE,
    }
  }

  const inFreeFrom = facts.declaredFreeFrom.find((d) => d.code === asked)
  if (inFreeFrom) {
    // Even a declared "free from" is reported as the restaurant's declaration,
    // never as our assurance, and always with its cross-contamination note.
    const note = inFreeFrom.crossContaminationNotes ?? facts.crossContaminationNotes ?? null
    return {
      verdict: 'declared_free_from',
      speakableFacts: [
        `the restaurant has declared this dish free from ${name(inFreeFrom, language)}`,
        ...(note ? [note] : []),
      ],
      mustEscalate: false,
      escalationReason: null,
      safetyDirective: SAFETY_DIRECTIVE,
    }
  }

  // Rule 2. Nobody has checked this combination. Say exactly that.
  return {
    verdict: 'not_confirmed',
    speakableFacts: [],
    mustEscalate: false,
    escalationReason: null,
    safetyDirective: SAFETY_DIRECTIVE,
  }
}

/**
 * True when an answer may be presented to the caller as a positive statement
 * about a dish. Used by the tool layer as a last assertion before responding.
 */
export function isSpeakableAsFact(answer: AllergenAnswer): boolean {
  return answer.verdict === 'contains' && !answer.mustEscalate
}

/**
 * A dietary attribute is a preference label, never a safety claim. This exists
 * so the rule is a named, testable function rather than a comment somebody
 * deletes: nothing may map "vegan" onto "safe for a milk allergy".
 */
export function mayAnswerAllergenFromDietaryAttribute(): false {
  return false
}
