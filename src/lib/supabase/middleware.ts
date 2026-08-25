import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isSupabaseConfigured, requireSupabasePublicConfig } from './config'

const PUBLIC_PATHS = ['/', '/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/auth']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

/**
 * Whether a request may be answered with a redirect to the sign-in page.
 *
 * Only a browser can act on that redirect. Everything under /api is called by a
 * machine that carries its own credential — a vendor webhook signature, the
 * voice tools' shared secret — and has no session cookie to present, so
 * redirecting it hands back an HTML login page where JSON was expected.
 *
 * That is not a hypothetical: it is what happened on the first real call. The
 * voice agent received the sign-in page as the answer to "what time do you
 * close", and the webhook never reached its handler at all, so no call was ever
 * recorded. One misplaced guard, every symptom.
 *
 * These endpoints are not left unprotected by this: each one authenticates
 * itself, and refuses by default when its secret is missing.
 */
function acceptsSignInRedirect(pathname: string): boolean {
  return pathname !== '/api' && !pathname.startsWith('/api/')
}

/** Exported for tests: the paths a signed-out visitor is redirected away from. */
export function redirectsSignedOutVisitor(pathname: string): boolean {
  return !isPublicPath(pathname) && acceptsSignInRedirect(pathname)
}

/**
 * Refreshes the Supabase session on every request and guards the dashboard.
 *
 * Two rules that matter:
 *   1. The response object returned here is the one whose cookies carry the
 *      refreshed session. Creating a different response later would drop the
 *      refresh and log the user out at random.
 *   2. getUser() is used rather than getSession(): it re-validates the token
 *      with Supabase instead of trusting a cookie the browser could have
 *      tampered with.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request })

  if (!isSupabaseConfigured()) {
    // No credentials yet: let everything through so the app still boots and the
    // sign-in page can explain what is missing.
    return response
  }

  const { url, anonKey } = requireSupabasePublicConfig()

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (!user && redirectsSignedOutVisitor(pathname)) {
    const signInUrl = request.nextUrl.clone()
    signInUrl.pathname = '/sign-in'
    signInUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(signInUrl)
  }

  if (user && (pathname === '/sign-in' || pathname === '/sign-up')) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    dashboardUrl.search = ''
    return NextResponse.redirect(dashboardUrl)
  }

  return response
}
