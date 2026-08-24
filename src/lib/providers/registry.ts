import 'server-only'

import { err, ok, type Result } from '@/lib/result'
import { serverEnv } from '@/lib/env'
import { assertInternalEvaluation } from '@/lib/security/gate'
import type { VoiceProvider } from './voice/types'
import { RetellVoiceProvider } from './voice/retell'

/**
 * Provider resolution.
 *
 * Providers are looked up at runtime rather than imported statically by
 * application code, which is what makes swapping a vendor a folder plus one
 * line here. It is also the single place the activation gate is applied, so
 * there is no way to obtain a voice provider without passing it.
 */
export function getVoiceProvider(): Result<VoiceProvider> {
  const gate = assertInternalEvaluation()
  if (!gate.ok) return gate

  const env = serverEnv()
  if (!env.RETELL_API_KEY) {
    return err('unavailable', 'RETELL_API_KEY is not configured.', { retryable: false })
  }

  return ok(
    new RetellVoiceProvider({
      apiKey: env.RETELL_API_KEY,
      webhookSecret: env.RETELL_WEBHOOK_SECRET,
    }),
  )
}
