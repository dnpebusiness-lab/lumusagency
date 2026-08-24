import type { VoiceCallEvent, VoiceEventKind, VoiceTranscriptTurn } from '../types'

/**
 * Translates a Retell webhook payload into our own vocabulary.
 *
 * Vendor shape recorded from retell-sdk@5.64.0, inspected 24 August 2026
 * (node_modules/retell-sdk/resources/call.d.ts and lib/webhook_auth.js):
 *
 *   envelope   { event: 'call_started' | 'call_ended' | 'call_analyzed', call: {...} }
 *   call       call_id, agent_id, call_status, from_number, to_number,
 *              start_timestamp / end_timestamp (unix ms), duration_ms,
 *              disconnection_reason, transcript_object[], call_analysis{...},
 *              call_cost{}, recording_url, scrubbed_recording_url
 *   transcript { role: 'agent' | 'user' | 'transfer_target', content, words[] }
 *   analysis   { call_summary, user_sentiment, call_successful, in_voicemail }
 *
 * No field name here was guessed. Anything the SDK does not define is treated as
 * absent rather than invented.
 */

const EVENT_KINDS: Record<string, VoiceEventKind> = {
  call_started: 'call_started',
  call_ended: 'call_ended',
  call_analyzed: 'call_analyzed',
}

export function isKnownRetellEvent(event: string): boolean {
  return event in EVENT_KINDS
}

/** Retell sentiment labels are capitalised; ours are not, and 'Unknown' is not a sentiment. */
function mapSentiment(value: unknown): 'positive' | 'neutral' | 'negative' | null {
  switch (value) {
    case 'Positive':
      return 'positive'
    case 'Negative':
      return 'negative'
    case 'Neutral':
      return 'neutral'
    default:
      return null
  }
}

function mapSpeaker(role: unknown): VoiceTranscriptTurn['speaker'] {
  // 'transfer_target' is a third party on the line, not our agent and not the
  // caller. It is recorded as a system turn rather than mislabelled.
  if (role === 'agent') return 'agent'
  if (role === 'user') return 'caller'
  return 'system'
}

function msToIso(value: unknown): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null
  return new Date(value).toISOString()
}

function secondsToMs(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return Math.round(value * 1000)
}

interface RetellEnvelope {
  event?: unknown
  call?: Record<string, unknown>
}

export function mapRetellEvent(payload: unknown): VoiceCallEvent | null {
  const envelope = payload as RetellEnvelope
  const eventName = typeof envelope?.event === 'string' ? envelope.event : ''
  const kind = EVENT_KINDS[eventName]
  const call = envelope?.call

  if (!kind || !call || typeof call.call_id !== 'string' || call.call_id === '') {
    return null
  }

  const analysis = (call.call_analysis ?? {}) as Record<string, unknown>
  const cost = (call.call_cost ?? {}) as Record<string, unknown>

  const rawTranscript = Array.isArray(call.transcript_object) ? call.transcript_object : []
  const transcript: VoiceTranscriptTurn[] = rawTranscript
    .map((turn, index) => {
      const t = turn as Record<string, unknown>
      const words = Array.isArray(t.words) ? (t.words as Record<string, unknown>[]) : []
      const first = words[0]
      const last = words[words.length - 1]
      return {
        turnIndex: index,
        speaker: mapSpeaker(t.role),
        content: typeof t.content === 'string' ? t.content : '',
        startedAtMs: secondsToMs(first?.start),
        endedAtMs: secondsToMs(last?.end),
      }
    })
    .filter((turn) => turn.content.trim() !== '')

  const startedAt = msToIso(call.start_timestamp)
  const endedAt = msToIso(call.end_timestamp)

  let durationSeconds: number | null = null
  if (typeof call.duration_ms === 'number' && Number.isFinite(call.duration_ms)) {
    durationSeconds = Math.max(0, Math.round(call.duration_ms / 1000))
  }

  // TPR-1.2: a recording URL is noted as discarded and never carried further.
  const recordingUrlDiscarded =
    typeof call.recording_url === 'string' ||
    typeof call.scrubbed_recording_url === 'string' ||
    typeof call.recording_multi_channel_url === 'string'

  return {
    kind,
    // Retell sends three lifecycle events per call, all with the same call_id.
    // event + call_id is the documented idempotency key.
    eventId: `${eventName}:${call.call_id}`,
    providerCallId: call.call_id,
    providerAgentId: typeof call.agent_id === 'string' ? call.agent_id : null,
    fromNumberE164: typeof call.from_number === 'string' ? call.from_number : null,
    toNumberE164: typeof call.to_number === 'string' ? call.to_number : null,
    startedAt,
    endedAt,
    durationSeconds,
    disconnectionReason:
      typeof call.disconnection_reason === 'string' ? call.disconnection_reason : null,
    transcript,
    summary: typeof analysis.call_summary === 'string' ? analysis.call_summary : null,
    sentiment: mapSentiment(analysis.user_sentiment),
    successful: typeof analysis.call_successful === 'boolean' ? analysis.call_successful : null,
    inVoicemail: analysis.in_voicemail === true,
    costCents: typeof cost.combined_cost === 'number' ? Math.round(cost.combined_cost) : null,
    metadata: {
      call_status: typeof call.call_status === 'string' ? call.call_status : null,
      call_type: typeof call.call_type === 'string' ? call.call_type : null,
      disconnection_reason:
        typeof call.disconnection_reason === 'string' ? call.disconnection_reason : null,
    },
    recordingUrlDiscarded,
  }
}
