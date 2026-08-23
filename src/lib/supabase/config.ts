import { publicEnv } from '@/lib/env'

/**
 * Whether this deployment has Supabase credentials at all.
 *
 * Milestone 1 shipped an app that boots with no credentials, and that stays
 * true: instead of crashing at import time, the auth screens render an
 * explicit "not configured yet" state and point at SUPABASE_SETUP.md. This is
 * what lets the whole database layer be built and tested before the founder has
 * created the hosted project.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(publicEnv.NEXT_PUBLIC_SUPABASE_URL && publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export function requireSupabasePublicConfig(): { url: string; anonKey: string } {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see SUPABASE_SETUP.md).',
    )
  }

  return { url, anonKey }
}
