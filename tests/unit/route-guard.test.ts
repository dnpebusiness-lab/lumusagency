import { describe, expect, it } from 'vitest'
import { redirectsSignedOutVisitor } from '@/lib/supabase/middleware'

/**
 * The session guard redirects a signed-out visitor to /sign-in. That is right
 * for a browser and wrong for everything else, and getting it wrong is not a
 * small bug: on the first real call the voice agent asked for the opening hours
 * and was handed the sign-in page's HTML, while the webhook was redirected
 * before it ever reached its handler, so not one call was recorded.
 *
 * These endpoints are called by machines that carry their own credential and
 * have no cookie to present. They must be allowed through to the handler, which
 * then refuses them on its own terms.
 */
describe('who gets redirected to sign-in', () => {
  it('never redirects the endpoints a vendor calls', () => {
    for (const path of [
      '/api/webhooks/retell',
      '/api/voice/tools/get_business_info',
      '/api/voice/tools/search_menu',
      '/api/voice/tools/get_allergen_info',
      '/api/health',
    ]) {
      expect(redirectsSignedOutVisitor(path), path).toBe(false)
    }
  })

  it('still guards the dashboard and settings', () => {
    for (const path of ['/dashboard', '/dashboard/calls', '/dashboard/calls/abc', '/settings']) {
      expect(redirectsSignedOutVisitor(path), path).toBe(true)
    }
  })

  it('leaves the public pages alone', () => {
    for (const path of ['/', '/sign-in', '/sign-up', '/forgot-password', '/auth/callback']) {
      expect(redirectsSignedOutVisitor(path), path).toBe(false)
    }
  })

  it('does not let a lookalike path escape the guard', () => {
    // /apixyz is not an API route; only /api and /api/... are.
    expect(redirectsSignedOutVisitor('/apixyz')).toBe(true)
    expect(redirectsSignedOutVisitor('/dashboard/api')).toBe(true)
  })
})
