import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { safeRedirectPath } from '@/lib/validation/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Exchanges the one-time code from a confirmation, magic-link or
 * password-reset email for a session cookie.
 *
 * This is also the entry point magic-link sign-in will use when it is switched
 * on (ASSUMPTIONS A-50) — no additional route is needed, only the setting.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = safeRedirectPath(searchParams.get('next'))

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=missing_code`)
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/sign-in?error=invalid_link`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
