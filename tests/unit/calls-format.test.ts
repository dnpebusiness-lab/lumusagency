import { describe, expect, it } from 'vitest'
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
import { CALL_OUTCOMES, CALL_STATUSES, LANGUAGE_CODES } from '@/lib/db/enums'

describe('call list formatting', () => {
  it('has a label for every outcome, status and language the database can produce', () => {
    for (const outcome of CALL_OUTCOMES) expect(OUTCOME_LABELS[outcome], outcome).toBeTruthy()
    for (const status of CALL_STATUSES) expect(STATUS_LABELS[status], status).toBeTruthy()
    for (const language of LANGUAGE_CODES) expect(LANGUAGE_LABELS[language], language).toBeTruthy()
  })

  it('formats durations for a human, not a machine', () => {
    expect(formatDuration(0)).toBe('0s')
    expect(formatDuration(9)).toBe('9s')
    expect(formatDuration(41)).toBe('41s')
    expect(formatDuration(60)).toBe('1m 00s')
    expect(formatDuration(155)).toBe('2m 35s')
  })

  it('shows a dash rather than a wrong number when duration is unknown', () => {
    expect(formatDuration(null)).toBe('—')
    expect(formatDuration(-5)).toBe('—')
  })

  it('colours every failure outcome as a failure', () => {
    expect(outcomeTone('reservation_failed')).toBe('danger')
    expect(outcomeTone('transfer_failed')).toBe('danger')
    expect(outcomeTone('system_failure')).toBe('danger')
  })

  it('colours a resolved call as a success and an escalation as a warning', () => {
    expect(outcomeTone('resolved_information')).toBe('success')
    expect(outcomeTone('transferred')).toBe('warning')
    expect(outcomeTone(null)).toBe('neutral')
  })

  it('says unclassified rather than inventing an intent', () => {
    expect(formatIntent(null)).toBe('Unclassified')
    expect(formatIntent('human_request')).toBe('Human request')
  })

  it('renders a stable time regardless of the machine timezone', () => {
    const formatted = formatCallTime('2026-08-24T19:30:00Z', 'Europe/Dublin')
    expect(formatted).toMatch(/24 Aug 2026/)
    expect(formatted).toMatch(/20:30/)
  })

  it('shows a dash for a missing or invalid timestamp', () => {
    expect(formatCallTime(null)).toBe('—')
    expect(formatCallTime('not-a-date')).toBe('—')
  })

  it('formats transcript offsets as minutes and seconds', () => {
    expect(formatTranscriptOffset(0)).toBe('0:00')
    expect(formatTranscriptOffset(75_000)).toBe('1:15')
    expect(formatTranscriptOffset(null)).toBe('')
  })
})
