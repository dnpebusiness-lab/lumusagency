import { describe, expect, it } from 'vitest'
import { attempt, err, isOk, ok } from '@/lib/result'

describe('Result contract', () => {
  it('marks success results as ok and carries the data', () => {
    const result = ok({ reservationId: 'res_123' })
    expect(result.ok).toBe(true)
    expect(isOk(result)).toBe(true)
    if (result.ok) expect(result.data.reservationId).toBe('res_123')
  })

  it('marks failures as not ok so a caller can never be told "confirmed"', () => {
    const result = err('unavailable', 'Booking provider returned 503')
    expect(result.ok).toBe(false)
    expect(isOk(result)).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('unavailable')
      expect(result.error.retryable).toBe(true)
    }
  })

  it('treats rejection and invalid input as non-retryable by default', () => {
    for (const code of ['rejected', 'invalid_input', 'not_found', 'unauthorised'] as const) {
      const result = err(code, 'nope')
      if (!result.ok) expect(result.error.retryable).toBe(false)
    }
  })

  it('lets an explicit retryable flag override the default', () => {
    const result = err('rejected', 'transient rejection', { retryable: true })
    if (!result.ok) expect(result.error.retryable).toBe(true)
  })

  it('converts a thrown vendor error into a failure result instead of propagating', async () => {
    const result = await attempt(async () => {
      throw new Error('socket hang up')
    }, 'timeout')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('timeout')
      expect(result.error.message).toBe('socket hang up')
      expect(result.error.cause).toBeInstanceOf(Error)
    }
  })

  it('passes through a successful async operation', async () => {
    const result = await attempt(async () => 42)
    expect(result).toEqual({ ok: true, data: 42 })
  })
})
