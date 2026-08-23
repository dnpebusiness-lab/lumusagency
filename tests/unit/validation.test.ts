import { describe, expect, it } from 'vitest'
import {
  locationSchema,
  organisationSchema,
  passwordSchema,
  resetPasswordSchema,
  safeRedirectPath,
  signInSchema,
} from '@/lib/validation/auth'

describe('safeRedirectPath', () => {
  it('allows a same-origin absolute path', () => {
    expect(safeRedirectPath('/dashboard/calls')).toBe('/dashboard/calls')
  })

  it('blocks an absolute URL to another site', () => {
    expect(safeRedirectPath('https://evil.example/steal')).toBe('/dashboard')
  })

  it('blocks a protocol-relative URL', () => {
    expect(safeRedirectPath('//evil.example')).toBe('/dashboard')
  })

  it('blocks a backslash-smuggled URL', () => {
    expect(safeRedirectPath('/\\evil.example')).toBe('/dashboard')
  })

  it('falls back when nothing is supplied', () => {
    expect(safeRedirectPath(null)).toBe('/dashboard')
    expect(safeRedirectPath(undefined, '/settings')).toBe('/settings')
  })
})

describe('password rules', () => {
  it('requires at least twelve characters', () => {
    expect(passwordSchema.safeParse('short').success).toBe(false)
    expect(passwordSchema.safeParse('correct horse battery').success).toBe(true)
  })

  it('does not force symbols, which mostly produce Password1!', () => {
    expect(passwordSchema.safeParse('allsimplewords').success).toBe(true)
  })

  it('rejects mismatched confirmation', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'correct horse battery',
      confirmPassword: 'something else entirely',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['confirmPassword'])
    }
  })
})

describe('sign-in schema', () => {
  it('trims and validates the email address', () => {
    const result = signInSchema.safeParse({ email: '  user@example.com ', password: 'x' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.email).toBe('user@example.com')
  })

  it('rejects a next parameter that is not an absolute path', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: 'x',
      next: 'https://evil.example',
    })
    expect(result.success).toBe(false)
  })
})

describe('organisation schema', () => {
  it('accepts a well-formed slug and lowercases it', () => {
    const result = organisationSchema.safeParse({
      name: 'Osteria Vindaro',
      slug: 'Osteria-Vindaro',
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.slug).toBe('osteria-vindaro')
  })

  it('rejects slugs with spaces or symbols', () => {
    for (const slug of ['has space', 'has_underscore', '-leading', 'trailing-', 'a']) {
      expect(organisationSchema.safeParse({ name: 'Valid Name', slug }).success, slug).toBe(false)
    }
  })
})

describe('location schema', () => {
  const base = {
    organisationId: '11111111-1111-4111-8111-111111111111',
    name: 'City Quay',
    slug: 'city-quay',
  }

  it('requires international phone format', () => {
    expect(locationSchema.safeParse({ ...base, phoneE164: '01 555 0140' }).success).toBe(false)
    expect(locationSchema.safeParse({ ...base, phoneE164: '+35315550140' }).success).toBe(true)
    expect(locationSchema.safeParse({ ...base, phoneE164: '' }).success).toBe(true)
  })

  it('bounds the auto-book party size, so the agent cannot be told to book a wedding', () => {
    expect(locationSchema.safeParse({ ...base, maxPartySizeAutoBook: 0 }).success).toBe(false)
    expect(locationSchema.safeParse({ ...base, maxPartySizeAutoBook: 51 }).success).toBe(false)
    expect(locationSchema.safeParse({ ...base, maxPartySizeAutoBook: 8 }).success).toBe(true)
  })

  it('defaults the auto-book threshold to eight guests', () => {
    const result = locationSchema.safeParse(base)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.maxPartySizeAutoBook).toBe(8)
  })
})
