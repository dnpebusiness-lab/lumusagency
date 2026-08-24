import { describe, expect, it } from 'vitest'
import { redactForLog, toPublicError } from '@/lib/security/redact'

/** TECHNICAL_PRIVACY_REQUIREMENTS.md TPR-3. */
describe('log redaction', () => {
  it('drops transcript content rather than truncating it', () => {
    const out = redactForLog({ transcript: 'I have a severe peanut allergy' }) as Record<
      string,
      unknown
    >
    expect(JSON.stringify(out)).not.toContain('peanut')
    expect(out.transcript).toBe('[dropped:personal-content]')
  })

  it('drops SMS and message bodies', () => {
    const out = JSON.stringify(redactForLog({ sms_body: 'Booked for 8pm', body: 'secret text' }))
    expect(out).not.toContain('Booked for 8pm')
    expect(out).not.toContain('secret text')
  })

  it('masks phone numbers instead of dropping them, so support can still correlate', () => {
    const out = redactForLog({ from_number: '+353871234567' }) as Record<string, unknown>
    expect(out.from_number).toBe('+353****4567')
  })

  it('masks every phone-shaped key', () => {
    const out = JSON.stringify(
      redactForLog({
        caller_number_e164: '+353871234567',
        to_number: '+353871234567',
        transfer_target_e164: '+353871234567',
      }),
    )
    expect(out).not.toContain('87123456')
  })

  it('redacts secrets at any depth', () => {
    const out = JSON.stringify(
      redactForLog({
        level1: { level2: { api_key: 'sk-live-abc', authorization: 'Bearer xyz' } },
        signature: 'v=1,d=deadbeef',
        service_role_key: 'super-secret',
      }),
    )
    expect(out).not.toContain('sk-live-abc')
    expect(out).not.toContain('Bearer xyz')
    expect(out).not.toContain('deadbeef')
    expect(out).not.toContain('super-secret')
  })

  it('keeps harmless correlation fields', () => {
    const out = redactForLog({ correlation_id: 'abc-123', event: 'call_ended' }) as Record<
      string,
      unknown
    >
    expect(out.correlation_id).toBe('abc-123')
    expect(out.event).toBe('call_ended')
  })

  it('survives a deeply nested payload without hanging', () => {
    let nested: Record<string, unknown> = { transcript: 'deep' }
    for (let i = 0; i < 40; i += 1) nested = { child: nested }
    expect(() => JSON.stringify(redactForLog(nested))).not.toThrow()
    expect(JSON.stringify(redactForLog(nested))).toContain('[truncated:depth]')
  })

  it('caps long arrays so one payload cannot flood the log', () => {
    const out = redactForLog(Array.from({ length: 500 }, (_, i) => i)) as unknown[]
    expect(out.length).toBe(20)
  })

  it('returns a correlation id and nothing else to a client', () => {
    const { body, status } = toPublicError('corr-1', 503)
    expect(status).toBe(503)
    expect(body).toEqual({ error: 'Unable to process request', correlation_id: 'corr-1' })
  })
})
