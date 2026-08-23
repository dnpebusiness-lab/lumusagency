import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Runs before every matched request: refreshes the Supabase session cookie and
 * redirects signed-out visitors away from the dashboard.
 *
 * Named `proxy` in a file called proxy.ts — Next 16 renamed the middleware file
 * convention and warns on the old name.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and image files. Auth routes are matched
     * on purpose: the session cookie has to be refreshed there too.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
