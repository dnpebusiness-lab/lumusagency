import type { CallOutcome, CallStatus, LanguageCode } from '@/lib/db/enums'

/**
 * Presentation helpers for the Calls dashboard.
 *
 * Kept out of the components so they can be unit-tested without rendering, and
 * so the masking rule in particular has one implementation rather than three.
 */

export function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds < 0) return '—'
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  if (minutes === 0) return `${rest}s`
  return `${minutes}m ${String(rest).padStart(2, '0')}s`
}

export const OUTCOME_LABELS: Record<CallOutcome, string> = {
  resolved_information: 'Information given',
  reservation_created: 'Reservation created',
  reservation_failed: 'Reservation failed',
  transferred: 'Transferred',
  transfer_failed: 'Transfer failed',
  voicemail: 'Voicemail',
  abandoned: 'Abandoned',
  system_failure: 'System failure',
  spam: 'Spam',
}

/**
 * Tone for the outcome badge.
 *
 * Anything that failed reads as a failure, including a failed reservation and a
 * failed transfer: those are the outcomes a manager most needs to notice, and
 * colouring them neutrally would bury exactly the wrong thing.
 */
export function outcomeTone(
  outcome: CallOutcome | null,
): 'neutral' | 'success' | 'warning' | 'danger' {
  switch (outcome) {
    case 'resolved_information':
    case 'reservation_created':
      return 'success'
    case 'transferred':
    case 'voicemail':
      return 'warning'
    case 'reservation_failed':
    case 'transfer_failed':
    case 'system_failure':
      return 'danger'
    default:
      return 'neutral'
  }
}

export const STATUS_LABELS: Record<CallStatus, string> = {
  in_progress: 'In progress',
  completed: 'Completed',
  failed: 'Failed',
}

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: 'English',
  it: 'Italiano',
}

export function formatIntent(intent: string | null): string {
  if (!intent) return 'Unclassified'
  return intent.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
}

/**
 * Format an ISO timestamp for display in the location's timezone.
 * Deterministic locale and timezone so a server render and a client render agree.
 */
export function formatCallTime(iso: string | null, timezone = 'Europe/Dublin'): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-IE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timezone,
  }).format(date)
}

export function formatTranscriptOffset(ms: number | null): string {
  if (ms === null || ms < 0) return ''
  const total = Math.floor(ms / 1000)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}
