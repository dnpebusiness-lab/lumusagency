/**
 * The contract that keeps the agent honest.
 *
 * Every provider call (booking, SMS, transfer, voice) returns a Result instead
 * of throwing. A vendor outage is then a *value* the caller must handle, not an
 * exception that can be accidentally swallowed and turned into a confirmation
 * the caller never earned.
 *
 * Invariant enforced by tests (PRD AC-04..AC-07):
 *   a confirmation may only be spoken when `result.ok === true`.
 */

export type ProviderErrorCode =
  | 'unavailable'
  | 'timeout'
  | 'rejected'
  | 'not_found'
  | 'invalid_input'
  | 'rate_limited'
  | 'unauthorised'
  | 'unknown'

export interface ProviderError {
  readonly code: ProviderErrorCode
  /** Operator-facing detail. Never spoken to a caller, never returned to a browser. */
  readonly message: string
  /** Whether a retry could plausibly succeed. */
  readonly retryable: boolean
  readonly cause?: unknown
}

export type Result<T> =
  { readonly ok: true; readonly data: T } | { readonly ok: false; readonly error: ProviderError }

export function ok<T>(data: T): Result<T> {
  return { ok: true, data }
}

export function err(
  code: ProviderErrorCode,
  message: string,
  options: { retryable?: boolean; cause?: unknown } = {},
): Result<never> {
  return {
    ok: false,
    error: {
      code,
      message,
      retryable: options.retryable ?? isRetryableByDefault(code),
      cause: options.cause,
    },
  }
}

export function isOk<T>(result: Result<T>): result is { ok: true; data: T } {
  return result.ok
}

/**
 * Run an operation that may throw and convert it into a Result.
 * Used at the edge of every vendor SDK so exceptions never cross a provider boundary.
 */
export async function attempt<T>(
  operation: () => Promise<T>,
  code: ProviderErrorCode = 'unknown',
): Promise<Result<T>> {
  try {
    return ok(await operation())
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Unknown provider failure'
    return err(code, message, { cause })
  }
}

function isRetryableByDefault(code: ProviderErrorCode): boolean {
  return code === 'unavailable' || code === 'timeout' || code === 'rate_limited'
}
