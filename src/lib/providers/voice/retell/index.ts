import 'server-only'

import { verify as verifyRetellSignature } from 'retell-sdk'
import Retell from 'retell-sdk'
import { attempt, err, ok, type Result } from '@/lib/result'
import { assertInternalEvaluation } from '@/lib/security/gate'
import { logSafe } from '@/lib/security/redact'
import { buildAgentPrompt } from '@/lib/agent/prompt'
import type { VoiceAgentConfig, VoiceAgentRef, VoiceCallEvent, VoiceProvider } from '../types'
import { mapRetellEvent } from './mapper'

/**
 * Retell adapter — INTERNAL TECHNICAL EVALUATION ONLY.
 *
 * This is the only file in the repository permitted to import retell-sdk.
 * Everything above it speaks the vendor-neutral VoiceProvider vocabulary, so
 * replacing the vendor means writing a sibling folder and changing one registry
 * line. See RETELL_VENDOR_CONSTRAINTS.md for why that insurance matters here.
 *
 * Vendor facts, recorded rather than assumed (retell-sdk@5.64.0, 24 Aug 2026):
 *   * signature header  X-Retell-Signature
 *   * signature format  v={unix_ms},d={hex hmac-sha256 over body + timestamp}
 *   * signing secret    the Retell API key
 *   * replay window     ±5 minutes, enforced inside the SDK verifier
 *   * lifecycle events  call_started, call_ended, call_analyzed
 */

export const RETELL_SIGNATURE_HEADER = 'x-retell-signature'
export const RETELL_SDK_VERSION = '5.64.0'

export interface RetellCredentials {
  readonly apiKey: string
  /**
   * Retell signs webhooks with the API key. A separate value is accepted so a
   * deployment can rotate them independently if Retell ever splits them; when
   * unset it falls back to the API key, which is the documented behaviour.
   */
  readonly webhookSecret?: string | undefined
}

export class RetellVoiceProvider implements VoiceProvider {
  readonly id = 'retell' as const

  constructor(private readonly credentials: RetellCredentials) {}

  private get signingSecret(): string {
    return this.credentials.webhookSecret ?? this.credentials.apiKey
  }

  async syncAgent(config: VoiceAgentConfig): Promise<Result<VoiceAgentRef>> {
    const gate = assertInternalEvaluation()
    if (!gate.ok) return gate

    if (config.recordingEnabled) {
      // Milestone 4A stores no audio. Refusing here means a misconfiguration
      // cannot reach the vendor, rather than being caught later at the database.
      return err(
        'rejected',
        'Agent synchronisation refused: audio recording must be disabled in Milestone 4A (TPR-1.1).',
        { retryable: false },
      )
    }

    if (!config.voiceId) {
      return err('invalid_input', 'Agent synchronisation refused: no voice selected.', {
        retryable: false,
      })
    }

    const prompt = buildAgentPrompt(config)
    const client = new Retell({ apiKey: this.credentials.apiKey })

    return attempt(async () => {
      const payload = {
        agent_name: `astra-${config.locationId}`,
        voice_id: config.voiceId as string,
        language: config.defaultLanguage === 'it' ? ('it-IT' as const) : ('en-GB' as const),
        response_engine: {
          type: 'retell-llm' as const,
          llm_id: prompt.promptId,
        },
        // Audio storage stays off at the vendor as well as in our database.
        opt_out_sensitive_data_storage: true,
      }

      const agent = config.providerAgentId
        ? await client.agent.update(config.providerAgentId, payload)
        : await client.agent.create(payload)

      logSafe('info', 'retell.agent.synced', {
        location_id: config.locationId,
        prompt_version: config.promptVersion,
        prompt_id: prompt.promptId,
      })

      return {
        providerAgentId: agent.agent_id,
        syncedAt: new Date().toISOString(),
      }
    }, 'unavailable')
  }

  /**
   * Verify against the RAW body. The caller must not have parsed it: JSON
   * round-tripping changes bytes, and the signature is over bytes.
   */
  async verifyWebhook(rawBody: string, headers: Headers): Promise<Result<VoiceCallEvent>> {
    const signature = headers.get(RETELL_SIGNATURE_HEADER)
    if (!signature) {
      return err('unauthorised', 'Missing X-Retell-Signature header.', { retryable: false })
    }

    const verified = await attempt(
      () => verifyRetellSignature(rawBody, this.signingSecret, signature),
      'unauthorised',
    )
    if (!verified.ok) return verified

    if (verified.data !== true) {
      // The SDK verifier returns false both for a bad digest and for a
      // timestamp outside its ±5 minute window, so a replay lands here too.
      return err('unauthorised', 'Signature verification failed or timestamp outside the window.', {
        retryable: false,
      })
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(rawBody)
    } catch {
      return err('invalid_input', 'Webhook body is not valid JSON.', { retryable: false })
    }

    const event = mapRetellEvent(parsed)
    if (!event) {
      return err('invalid_input', 'Unrecognised Retell webhook payload.', { retryable: false })
    }

    return ok(event)
  }

  async transferCall(): Promise<Result<void>> {
    // Deliberately unimplemented. Milestone 5 owns transfer, and an adapter that
    // silently "succeeded" here would be exactly the false confirmation the
    // whole Result contract exists to prevent.
    return err(
      'rejected',
      'Call transfer is not implemented in Milestone 4A. The agent must not claim a transfer succeeded.',
      { retryable: false },
    )
  }
}
