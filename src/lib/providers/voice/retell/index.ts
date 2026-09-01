import 'server-only'

import { verify as verifyRetellSignature } from 'retell-sdk'
import Retell from 'retell-sdk'
import { attempt, err, ok, type Result } from '@/lib/result'
import { assertInternalEvaluation } from '@/lib/security/gate'
import { logSafe } from '@/lib/security/redact'
import type {
  VoiceAgentConfig,
  VoiceAgentRef,
  VoiceCallEvent,
  VoiceOption,
  VoiceProvider,
} from '../types'
import { buildRetellAgentPayload, buildRetellLlmPayload } from './definition'
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
  /** Public origin of this deployment. The vendor calls back to it, so it must be reachable. */
  readonly appUrl?: string | undefined
  /** Shared secret the tool endpoints require. Written into every tool header. */
  readonly toolSecret?: string | undefined
}

export class RetellVoiceProvider implements VoiceProvider {
  readonly id = 'retell' as const

  constructor(private readonly credentials: RetellCredentials) {}

  private get signingSecret(): string {
    return this.credentials.webhookSecret ?? this.credentials.apiKey
  }

  /**
   * Push the whole configuration to the vendor.
   *
   * "Whole" is the point. An earlier version of this method wrote four fields
   * and left the other twenty to be typed into a dashboard, which is how an
   * agent ended up with a two-minute tool timeout, a header in the wrong box
   * and an id that no longer existed. Everything the agent needs now comes
   * from ./definition.ts, and a sync overwrites all of it.
   *
   * Two vendor objects are involved: a Retell LLM holds the prompt and the
   * tools, and an agent holds the voice, the language and the webhook and
   * points at that LLM. So the order is LLM first, agent second.
   */
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

    if (!this.credentials.appUrl) {
      return err(
        'invalid_input',
        'Agent synchronisation refused: NEXT_PUBLIC_APP_URL is not set, so the agent would be given no address to call back to.',
        { retryable: false },
      )
    }

    if (!this.credentials.toolSecret) {
      return err(
        'invalid_input',
        'Agent synchronisation refused: ASTRA_TOOL_SHARED_SECRET is not set, so the tools would be published without the header that protects them.',
        { retryable: false },
      )
    }

    const input = {
      config,
      appUrl: this.credentials.appUrl,
      toolSecret: this.credentials.toolSecret,
    }
    const client = new Retell({ apiKey: this.credentials.apiKey })

    return attempt(async () => {
      // A stored agent id can be stale — pointing at an agent that was deleted,
      // or a placeholder that was never real. Ask the vendor rather than
      // trusting it, and fall through to creating a fresh agent if it is gone.
      const existing = config.providerAgentId
        ? await client.agent.retrieve(config.providerAgentId).catch(() => null)
        : null

      const engine = existing?.response_engine
      const existingLlmId =
        engine && engine.type === 'retell-llm' ? (engine.llm_id as string) : null

      const llmPayload = buildRetellLlmPayload(input)
      const llm = existingLlmId
        ? await client.llm.update(existingLlmId, llmPayload)
        : await client.llm.create(llmPayload)

      const agentPayload = buildRetellAgentPayload(input, llm.llm_id)
      const agent = existing
        ? await client.agent.update(existing.agent_id, agentPayload)
        : await client.agent.create(
            agentPayload as unknown as Parameters<typeof client.agent.create>[0],
          )

      logSafe('info', 'retell.agent.synced', {
        location_id: config.locationId,
        prompt_version: config.promptVersion,
        created: existing === null,
        tool_count: (llmPayload['general_tools'] as unknown[]).length,
      })

      return {
        providerAgentId: agent.agent_id,
        syncedAt: new Date().toISOString(),
        created: existing === null,
      }
    }, 'unavailable')
  }

  async listVoices(): Promise<Result<readonly VoiceOption[]>> {
    const gate = assertInternalEvaluation()
    if (!gate.ok) return gate

    const client = new Retell({ apiKey: this.credentials.apiKey })

    return attempt(async () => {
      const voices = await client.voice.list()
      return voices
        .map((voice) => ({
          id: voice.voice_id,
          name: voice.voice_name,
          gender: voice.gender,
          accent: voice.accent ?? null,
          previewUrl: voice.preview_audio_url ?? null,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
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
