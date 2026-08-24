import { err, ok, type Result } from '@/lib/result'

/**
 * Commercial / live activation gate — fail closed.
 *
 * Retell's standard Terms, reviewed 24 August 2026, restrict resale and use as a
 * substitute or intermediary layer. Astra Voice sold to restaurants would be
 * exactly that, so the voice adapter is permitted to activate only for an
 * internal, non-paying technical evaluation. See RETELL_VENDOR_CONSTRAINTS.md.
 *
 * The rules that make this a gate rather than a comment:
 *   * the ONLY permitted value is the exact string 'internal_evaluation';
 *   * absent, empty, misspelled or anything else denies;
 *   * there is no override parameter and no way to set it from a browser;
 *   * it is checked before agent sync, before a tool answers, and before a
 *     webhook is turned into domain data.
 *
 * Deliberately NOT marked 'server-only'. The value is read from a variable with
 * no NEXT_PUBLIC_ prefix, so in a browser bundle it is simply undefined and the
 * gate denies — fail-closed by construction rather than by an import guard. The
 * benefit is that the denial paths are unit-testable, which for a control like
 * this matters more than the import boundary.
 */

export const INTERNAL_EVALUATION = 'internal_evaluation' as const

export type ActivationMode = typeof INTERNAL_EVALUATION | 'denied'

export interface ActivationDecision {
  readonly mode: ActivationMode
  readonly isInternalEvaluation: boolean
  readonly reason: string
}

/**
 * Resolve the activation decision from a raw environment value.
 * Pure, so the denial paths are unit-testable without touching process.env.
 */
export function resolveActivation(raw: string | undefined | null): ActivationDecision {
  if (raw === undefined || raw === null || raw.trim() === '') {
    return {
      mode: 'denied',
      isInternalEvaluation: false,
      reason: 'ASTRA_VOICE_ACTIVATION_MODE is not set. Voice activation is denied by default.',
    }
  }

  // Exact match only. No trimming of the compared value, no case folding, no
  // prefix match: "Internal_Evaluation " must not open the gate by accident.
  if (raw === INTERNAL_EVALUATION) {
    return {
      mode: INTERNAL_EVALUATION,
      isInternalEvaluation: true,
      reason: 'Internal, non-paying technical evaluation.',
    }
  }

  return {
    mode: 'denied',
    isInternalEvaluation: false,
    reason:
      'ASTRA_VOICE_ACTIVATION_MODE is set to an unrecognised value. Only "internal_evaluation" is permitted in Milestone 4A.',
  }
}

export function currentActivation(): ActivationDecision {
  return resolveActivation(process.env.ASTRA_VOICE_ACTIVATION_MODE)
}

/**
 * Guard for every voice code path. Returns a Result rather than throwing so a
 * caller cannot accidentally swallow the denial and continue.
 */
export function assertInternalEvaluation(): Result<ActivationDecision> {
  const decision = currentActivation()
  if (!decision.isInternalEvaluation) {
    return err('unauthorised', `Voice activation denied: ${decision.reason}`, { retryable: false })
  }
  return ok(decision)
}
