import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isSupabaseConfigured, requireSupabasePublicConfig } from './config'

const PUBLIC_PATHS = ['/', '/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/auth']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
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

  if (!user && !isPublicPath(pathname)) {
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
