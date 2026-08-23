import 'server-only'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { requireSupabasePublicConfig } from './config'
import { serverEnv } from '@/lib/env'

/**
 * Server client scoped to the signed-in user.
 *
 * Every dashboard read and write goes through this, which means every query is
 * subject to Row Level Security. Server components cannot set cookies, so the
 * setAll failure is swallowed there; session refresh happens in middleware.
 */
export async function createServerSupabaseClient() {
  const { url, anonKey } = requireSupabasePublicConfig()
  const cookieStore = await cookies()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Called from a Server Component: middleware refreshes the session instead.
        }
      },
    },
  })
}

/**
 * Service-role client. Bypasses RLS completely.
 *
 * Allowed ONLY in webhook handlers, voice-tool endpoints and cron routes.
 * Never in a page, a layout, or a server action reachable from the browser.
 * The guard below is a tripwire, not a substitute for review.
 */
export function createServiceRoleClient() {
  const { url } = requireSupabasePublicConfig()
  const key = serverEnv().SUPABASE_SERVICE_ROLE_KEY

  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set (see SUPABASE_SETUP.md).')
  }

  // The 'server-only' import at the top of this file is what keeps the
  // service-role path out of any browser bundle: importing this module from a
  // client component is a build error, not a runtime surprise.
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
