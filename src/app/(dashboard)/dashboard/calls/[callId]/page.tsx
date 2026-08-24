import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireSession } from '@/lib/auth/session'
import { resolveActiveOrganisation } from '@/lib/auth/active-organisation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { maskPhoneNumber } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { Card, CardTitle } from '@/components/ui/card'
import {
  LANGUAGE_LABELS,
  OUTCOME_LABELS,
  STATUS_LABELS,
  formatCallTime,
  formatDuration,
  formatIntent,
  formatTranscriptOffset,
  outcomeTone,
} from '@/lib/calls/format'
import type { CallOutcome, CallStatus, LanguageCode, Speaker } from '@/lib/db/enums'

export const metadata: Metadata = { title: 'Call detail' }

interface CallDetail {
  id: string
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  status: CallStatus
  outcome: CallOutcome | null
  detected_language: LanguageCode | null
  caller_number_e164: string | null
  primary_intent: string | null
  intents: string[]
  escalation_reason: string | null
  escalation_notes: string | null
  transfer_status: string
  disclosure_version: string | null
  disclosure_language: LanguageCode | null
  disclosure_completed_at: string | null
  recording_url: string | null
  is_internal_evaluation: boolean
  retention_expires_at: string | null
}

interface TranscriptTurn {
  turn_index: number
  speaker: Speaker
  content: string
  started_at_ms: number | null
}

interface CallEventRow {
  sequence: number
  event_type: string
  tool_name: string | null
  error_code: string | null
  error_message: string | null
  occurred_at: string
}

export default async function CallDetailPage({ params }: { params: Promise<{ callId: string }> }) {
  const { callId } = await params
  const context = await requireSession()
  const membership = await resolveActiveOrganisation(context)
  if (!membership) return null

  const supabase = await createServerSupabaseClient()

  // Every one of these reads goes through the user's client. A call belonging to
  // another organisation is not "hidden" here — RLS means it does not exist.
  const [{ data: callData }, { data: transcriptData }, { data: summaryData }, { data: eventData }] =
    await Promise.all([
      supabase
        .from('call_sessions')
        .select(
          'id, started_at, ended_at, duration_seconds, status, outcome, detected_language, caller_number_e164, primary_intent, intents, escalation_reason, escalation_notes, transfer_status, disclosure_version, disclosure_language, disclosure_completed_at, recording_url, is_internal_evaluation, retention_expires_at',
        )
        .eq('id', callId)
        .maybeSingle(),
      supabase
        .from('call_transcripts')
        .select('turn_index, speaker, content, started_at_ms')
        .eq('call_session_id', callId)
        .order('turn_index'),
      supabase
        .from('call_summaries')
        .select('summary, detected_intent, sentiment, language')
        .eq('call_session_id', callId)
        .maybeSingle(),
      supabase
        .from('call_events')
        .select('sequence, event_type, tool_name, error_code, error_message, occurred_at')
        .eq('call_session_id', callId)
        .order('sequence'),
    ])

  const call = callData as unknown as CallDetail | null
  if (!call) notFound()

  const transcript = (transcriptData ?? []) as unknown as TranscriptTurn[]
  const events = (eventData ?? []) as unknown as CallEventRow[]
  const summary = summaryData as { summary: string; sentiment: string | null } | null

  return (
    <div className="space-y-8">
      <nav aria-label="Breadcrumb">
        <Link
          href="/dashboard/calls"
          className="hover:text-copper-600 text-sm underline underline-offset-4"
        >
          ← All calls
        </Link>
      </nav>

      <header className="space-y-3">
        <h1 className="text-xl font-semibold tracking-tight">
          Call on {formatCallTime(call.started_at)}
        </h1>
        <div className="flex flex-wrap gap-2">
          {call.outcome ? (
            <Badge tone={outcomeTone(call.outcome)}>{OUTCOME_LABELS[call.outcome]}</Badge>
          ) : (
            <Badge tone="neutral">{STATUS_LABELS[call.status]}</Badge>
          )}
          {membership.isDemo ? <Badge tone="warning">Demonstration data</Badge> : null}
          {call.is_internal_evaluation ? <Badge tone="neutral">Internal evaluation</Badge> : null}
          <Badge tone={call.recording_url ? 'danger' : 'neutral'}>
            {call.recording_url ? 'Recording present — investigate' : 'Audio recording off'}
          </Badge>
        </div>
      </header>

      {!call.disclosure_completed_at ? (
        <Alert tone="danger" title="No AI disclosure recorded for this call">
          We hold no evidence that the caller was told they were speaking to an automated system.
          Treat this as a defect, not a display gap.
        </Alert>
      ) : null}

      <section aria-labelledby="facts-heading">
        <h2 id="facts-heading" className="text-sm font-semibold tracking-tight">
          Call facts
        </h2>
        <Card className="mt-3">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Fact
              label="Caller"
              value={call.caller_number_e164 ? maskPhoneNumber(call.caller_number_e164) : '—'}
            />
            <Fact
              label="Language"
              value={call.detected_language ? LANGUAGE_LABELS[call.detected_language] : '—'}
            />
            <Fact label="Duration" value={formatDuration(call.duration_seconds)} />
            <Fact label="Reason for calling" value={formatIntent(call.primary_intent)} />
            <Fact label="Ended" value={formatCallTime(call.ended_at)} />
            <Fact
              label="AI disclosure"
              value={
                call.disclosure_completed_at
                  ? `${call.disclosure_version ?? '—'} · ${
                      call.disclosure_language ? LANGUAGE_LABELS[call.disclosure_language] : '—'
                    } · ${formatCallTime(call.disclosure_completed_at)}`
                  : 'Not recorded'
              }
            />
            {call.escalation_reason ? (
              <Fact label="Escalation" value={formatIntent(call.escalation_reason)} />
            ) : null}
            <Fact
              label="Transcript deleted after"
              value={call.retention_expires_at ? formatCallTime(call.retention_expires_at) : '—'}
            />
          </dl>
          {call.escalation_notes ? (
            <p className="text-ink-600 dark:text-ink-300 mt-4 text-sm">{call.escalation_notes}</p>
          ) : null}
        </Card>
      </section>

      {summary ? (
        <section aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="text-sm font-semibold tracking-tight">
            Summary
          </h2>
          <Card className="mt-3">
            <p className="text-sm leading-relaxed">{summary.summary}</p>
            {summary.sentiment ? (
              <p className="text-ink-500 dark:text-ink-400 mt-3 text-xs">
                Caller sentiment: {summary.sentiment}
              </p>
            ) : null}
          </Card>
        </section>
      ) : null}

      <section aria-labelledby="transcript-heading">
        <h2 id="transcript-heading" className="text-sm font-semibold tracking-tight">
          Transcript
        </h2>
        {transcript.length === 0 ? (
          <Card className="mt-3">
            <CardTitle>No transcript</CardTitle>
            <p className="text-ink-600 dark:text-ink-300 mt-1.5 text-sm">
              Either the call ended before anyone spoke, or the transcript has passed its retention
              window and been deleted.
            </p>
          </Card>
        ) : (
          <ol className="mt-3 space-y-2">
            {transcript.map((turn) => (
              <li
                key={turn.turn_index}
                className="border-ink-200 dark:border-ink-800 dark:bg-ink-900 rounded-md border bg-white px-4 py-3"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-ink-500 dark:text-ink-400 text-xs font-semibold tracking-wide uppercase">
                    {turn.speaker === 'agent'
                      ? 'Astra'
                      : turn.speaker === 'caller'
                        ? 'Caller'
                        : 'System'}
                  </span>
                  <span className="tabular text-ink-500 dark:text-ink-400 text-xs">
                    {formatTranscriptOffset(turn.started_at_ms)}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed">{turn.content}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="timeline-heading">
        <h2 id="timeline-heading" className="text-sm font-semibold tracking-tight">
          What the agent did
        </h2>
        {events.length === 0 ? (
          <Card className="mt-3">
            <CardTitle>No events recorded</CardTitle>
          </Card>
        ) : (
          <ol className="mt-3 space-y-1.5">
            {events.map((event) => {
              const failed = event.error_code !== null
              return (
                <li
                  key={event.sequence}
                  className="border-ink-200 dark:border-ink-800 dark:bg-ink-900 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-md border bg-white px-4 py-2.5 text-sm"
                >
                  <span className="tabular text-ink-500 dark:text-ink-400 text-xs">
                    {formatCallTime(event.occurred_at)}
                  </span>
                  <span className={failed ? 'text-[var(--color-danger)]' : ''}>
                    {formatIntent(event.event_type)}
                  </span>
                  {event.tool_name ? (
                    <code className="bg-ink-100 dark:bg-ink-800 rounded px-1.5 py-0.5 font-mono text-xs">
                      {event.tool_name}
                    </code>
                  ) : null}
                  {failed ? (
                    <span className="text-xs text-[var(--color-danger)]">{event.error_code}</span>
                  ) : null}
                </li>
              )
            })}
          </ol>
        )}
      </section>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ink-500 dark:text-ink-400 text-xs">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  )
}
