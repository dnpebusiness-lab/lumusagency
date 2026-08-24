import { maskPhoneNumber } from '@/lib/utils'

/**
 * Log redaction (TECHNICAL_PRIVACY_REQUIREMENTS.md TPR-3).
 *
 * A transcript is personal data and a caller's allergy disclosure is health
 * data. Neither belongs in an application log, where it is copied into a
 * retention regime nobody designed and read by people with no reason to see it.
 *
 * The approach is deny-by-key rather than scrub-by-pattern: pattern scrubbing
 * always misses a case, whereas a key that is not on the allow path is dropped
 * whatever it contains.
 */

/** Keys whose value is replaced with a placeholder, at any nesting depth. */
const SECRET_KEYS = [
  'apikey',
  'api_key',
  'authorization',
  'auth_token',
  'authtoken',
  'password',
  'secret',
  'servicerolekey',
  'service_role_key',
  'signature',
  'token',
  'webhooksecret',
  'webhook_secret',
]

/** Keys carrying free personal content: dropped entirely, never truncated. */
const CONTENT_KEYS = [
  'body',
  'content',
  'message_body',
  'smsbody',
  'sms_body',
  'summary',
  'transcript',
  'transcript_object',
  'utterance',
]

/** Keys carrying a phone number: masked rather than dropped, so support can correlate. */
const PHONE_KEYS = [
  'callernumber',
  'caller_number',
  'caller_number_e164',
  'from_number',
  'phone',
  'phone_e164',
  'to_number',
  'to_number_e164',
  'transfer_target_e164',
]

const REDACTED = '[redacted]'
const DROPPED = '[dropped:personal-content]'

/**
 * Normalise a key for matching. Digits and separators are stripped so that
 * caller_number_e164, callerNumberE164 and caller-number all collapse to the
 * same thing.
 *
 * Both the incoming key and the pattern lists go through this, which is the
 * bug this function originally had: normalising only one side meant
 * `caller_number_e164` never matched its own entry in PHONE_KEYS and a full
 * phone number was written to the log. tests/unit/redaction.test.ts keeps it
 * honest by asserting on every phone-shaped key, not just one.
 */
function normalise(key: string): string {
  return key.toLowerCase().replace(/[^a-z]/g, '')
}

const SECRET_PATTERNS = SECRET_KEYS.map(normalise)
const CONTENT_PATTERNS = CONTENT_KEYS.map(normalise)
const PHONE_PATTERNS = PHONE_KEYS.map(normalise)

function classify(key: string): 'secret' | 'content' | 'phone' | 'keep' {
  const k = normalise(key)
  if (SECRET_PATTERNS.some((s) => k === s || k.endsWith(s))) return 'secret'
  if (CONTENT_PATTERNS.some((c) => k === c || (c !== '' && k.endsWith(c)))) return 'content'
  if (PHONE_PATTERNS.some((p) => k === p || k.endsWith(p))) return 'phone'
  return 'keep'
}

/**
 * Produce a value safe to write to a structured log.
 * Recurses into objects and arrays; depth-limited so a cyclic or hostile
 * payload cannot turn logging into a denial of service.
 */
export function redactForLog(value: unknown, depth = 0): unknown {
  if (depth > 6) return '[truncated:depth]'
  if (value === null || value === undefined) return value

  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => redactForLog(item, depth + 1))
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      switch (classify(key)) {
        case 'secret':
          result[key] = REDACTED
          break
        case 'content':
          result[key] = DROPPED
          break
        case 'phone':
          result[key] = typeof item === 'string' ? maskPhoneNumber(item) : REDACTED
          break
        default:
          result[key] = redactForLog(item, depth + 1)
      }
    }
    return result
  }

  return value
}

/** Structured log line. The only logging helper voice and webhook code should use. */
export function logSafe(
  level: 'info' | 'warn' | 'error',
  event: string,
  context: Record<string, unknown> = {},
): void {
  const line = JSON.stringify({
    level,
    event,
    at: new Date().toISOString(),
    ...(redactForLog(context) as Record<string, unknown>),
  })

  if (level === 'error') console.error(line)
  else console.warn(line)
}

/**
 * The only shape an error may take on its way to a client: a correlation id the
 * operator can search for, and nothing else. Vendor messages and stack traces
 * stay server-side.
 */
export function toPublicError(correlationId: string, status = 500) {
  return {
    body: { error: 'Unable to process request', correlation_id: correlationId },
    status,
  }
}

export function newCorrelationId(): string {
  return crypto.randomUUID()
}
