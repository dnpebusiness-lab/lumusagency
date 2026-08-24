import { describe, expect, it } from 'vitest'
import { INTERNAL_EVALUATION, resolveActivation } from '@/lib/security/gate'

/**
 * The commercial gate exists because Retell's Terms restrict resale and use as
 * an intermediary layer (RETELL_VENDOR_CONSTRAINTS.md). Every one of these
 * assertions is a way the gate could have been accidentally opened.
 */
describe('voice activation gate', () => {
  it('permits exactly one value', () => {
    const decision = resolveActivation(INTERNAL_EVALUATION)
    expect(decision.mode).toBe('internal_evaluation')
    expect(decision.isInternalEvaluation).toBe(true)
  })

  it('denies when the variable is absent', () => {
    for (const value of [undefined, null]) {
      const decision = resolveActivation(value)
      expect(decision.isInternalEvaluation).toBe(false)
      expect(decision.reason).toMatch(/not set/i)
    }
  })

  it('denies an empty or whitespace value', () => {
    for (const value of ['', '   ', '\t']) {
      expect(resolveActivation(value).isInternalEvaluation).toBe(false)
    }
  })

  it('denies values that merely look right', () => {
    for (const value of [
      'internal evaluation',
      'internal-evaluation',
      'Internal_Evaluation',
      'INTERNAL_EVALUATION',
      ' internal_evaluation',
      'internal_evaluation ',
      'internal_evaluation_v2',
      'not_internal_evaluation',
    ]) {
      expect(resolveActivation(value).isInternalEvaluation, value).toBe(false)
    }
  })

  it('denies obvious attempts to force it open', () => {
    for (const value of ['true', '1', 'yes', 'production', 'live', 'commercial']) {
      expect(resolveActivation(value).isInternalEvaluation, value).toBe(false)
    }
  })

  it('explains why it denied, so a misconfiguration is diagnosable', () => {
    expect(resolveActivation('live').reason).toMatch(/only "internal_evaluation" is permitted/i)
  })
})
