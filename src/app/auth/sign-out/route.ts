import { NextResponse, type NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

/**
 * Sign-out is POST-only on purpose: a GET would let any page log the user out
 * with an <img> tag, which is a small but real CSRF.
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/sign-in', request.nextUrl.origin), { status: 303 })
}
