import { describe, expect, it } from 'vitest'
import { cn, maskPhoneNumber } from '@/lib/utils'

describe('cn', () => {
  it('merges conflicting tailwind utilities, last one winning', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('drops falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b')
  })
})

describe('maskPhoneNumber', () => {
  it('keeps the country prefix and the last four digits', () => {
    expect(maskPhoneNumber('+353871234567')).toBe('+353****4567')
  })

  it('handles numbers without a plus prefix', () => {
    expect(maskPhoneNumber('00353871234567')).toBe('003****4567')
  })

  it('never leaks a short or malformed value', () => {
    expect(maskPhoneNumber('12345')).toBe('****')
    expect(maskPhoneNumber('')).toBe('****')
  })

  it('trims surrounding whitespace before masking', () => {
    expect(maskPhoneNumber('  +353871234567  ')).toBe('+353****4567')
  })
})
