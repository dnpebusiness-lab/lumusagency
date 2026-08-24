import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Per-call, per-tool rate limiting.
 *
 * A runaway agent is not only a correctness problem, it is an invoice. The
 * limiter is scoped to (call, tool) rather than to an IP: every request comes
 * from the same vendor, so an IP limit would either be useless or would take the
 * whole tenant down when one call misbehaves.
 *
 * The counter is `call_events`, which already records every tool call. Reusing
 * it avoids a second source of truth that could disagree with the audit trail,
 * and it survives a serverless cold start, which an in-memory counter would not.
 */

export interface RateLimitDecision {
  readonly allowed: boolean
  readonly used: number
  readonly limit: number
  readonly windowSeconds: number
}

/** Per-tool ceilings for one call. Generous enough for a real conversation. */
const LIMITS: Record<string, { calls: number; windowSeconds: number }> = {
  get_business_info: { calls: 12, windowSeconds: 600 },
  search_menu: { calls: 20, windowSeconds: 600 },
  get_allergen_info: { calls: 20, windowSeconds: 600 },
}

const DEFAULT_LIMIT = { calls: 10, windowSeconds: 600 }

export async function checkToolRateLimit(
  supabase: SupabaseClient,
  callSessionId: string,
  toolName: string,
): Promise<RateLimitDecision> {
  const limit = LIMITS[toolName] ?? DEFAULT_LIMIT
  const since = new Date(Date.now() - limit.windowSeconds * 1000).toISOString()

  const { count, error } = await supabase
    .from('call_events')
    .select('id', { count: 'exact', head: true })
    .eq('call_session_id', callSessionId)
    .eq('tool_name', toolName)
    .eq('event_type', 'tool_called')
    .gte('occurred_at', since)

  if (error) {
    // Fail closed. If we cannot tell how many times a tool has been called, the
    // safe answer is to stop, not to keep spending.
    return { allowed: false, used: -1, limit: limit.calls, windowSeconds: limit.windowSeconds }
  }

  const used = count ?? 0
  return {
    allowed: used < limit.calls,
    used,
    limit: limit.calls,
    windowSeconds: limit.windowSeconds,
  }
}

export function rateLimitForTool(toolName: string): { calls: number; windowSeconds: number } {
  return LIMITS[toolName] ?? DEFAULT_LIMIT
}
