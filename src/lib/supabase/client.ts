'use client'

import { createBrowserClient } from '@supabase/ssr'
import { requireSupabasePublicConfig } from './config'

/**
 * Browser client. Uses the anon key only — which is public by design, because
 * Row Level Security, not key secrecy, is what protects the data.
 * The service-role key must never appear in anything this file can reach.
 */
export function createClient() {
  const { url, anonKey } = requireSupabasePublicConfig()
  return createBrowserClient(url, anonKey)
}
