import { describe, expect, it } from 'vitest'
import { parsePublicEnv, parseServerEnv } from '@/lib/env'

describe('environment validation', () => {
  it('accepts an empty environment at Milestone 1 so the app boots without credentials', () => {
    expect(() => parsePublicEnv({})).not.toThrow()
    expect(parseServerEnv({}).NODE_ENV).toBe('development')
  })

  it('rejects a malformed Supabase URL rather than failing later at runtime', () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_SUPABASE_URL: 'not-a-url' })).toThrow(
      /Invalid public environment/,
    )
  })

  it('rejects an unknown NODE_ENV', () => {
    expect(() => parseServerEnv({ NODE_ENV: 'staging' })).toThrow(/Invalid server environment/)
  })

  it('accepts a fully configured environment', () => {
    const parsed = parseServerEnv({
      NODE_ENV: 'production',
      SUPABASE_SERVICE_ROLE_KEY: 'test-key',
      RETELL_API_KEY: 'test-key',
    })
    expect(parsed.NODE_ENV).toBe('production')
    expect(parsed.RETELL_API_KEY).toBe('test-key')
  })

  it('does not expose server secrets through the public schema', () => {
    const parsed = parsePublicEnv({ SUPABASE_SERVICE_ROLE_KEY: 'super-secret' })
    expect(Object.values(parsed)).not.toContain('super-secret')
  })
})
