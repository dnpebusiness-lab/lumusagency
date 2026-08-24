import { z } from 'zod'

/**
 * Environment access, validated once and never guessed at.
 *
 * Rules enforced here:
 *  - Server-only secrets are read through `serverEnv()`, which throws if it is
 *    ever evaluated in a browser bundle.
 *  - Only NEXT_PUBLIC_* values may reach the client.
 *  - Milestone 1 keeps every integration variable optional so the app boots
 *    without credentials; each milestone that starts using a variable moves it
 *    to required and documents it in .env.example.
 */

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
})

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  RETELL_API_KEY: z.string().min(1).optional(),
  RETELL_WEBHOOK_SECRET: z.string().min(1).optional(),
  RETELL_AGENT_ID: z.string().min(1).optional(),
  // Fail-closed voice activation gate (Milestone 4A). Any value other than the
  // exact string 'internal_evaluation' denies activation; see
  // src/lib/security/gate.ts and RETELL_VENDOR_CONSTRAINTS.md.
  ASTRA_VOICE_ACTIVATION_MODE: z.string().optional(),
  // Salt for the caller correlation hash. Lets analytics group calls from the
  // same number without the raw number ever being handled downstream.
  ASTRA_CALLER_HASH_SALT: z.string().min(8).optional(),
  // Shared secret required on voice tool requests. Retell's custom-function
  // calls are not covered by the webhook signature scheme, so the tool
  // endpoints require this instead. See src/app/api/voice/tools/[tool]/route.ts.
  ASTRA_TOOL_SHARED_SECRET: z.string().min(16).optional(),
  TWILIO_ACCOUNT_SID: z.string().min(1).optional(),
  TWILIO_AUTH_TOKEN: z.string().min(1).optional(),
  TWILIO_MESSAGING_FROM: z.string().min(1).optional(),
  CALCOM_API_KEY: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(1).optional(),
})

export type PublicEnv = z.infer<typeof publicSchema>
export type ServerEnv = z.infer<typeof serverSchema>

export function parsePublicEnv(source: Record<string, string | undefined>): PublicEnv {
  const result = publicSchema.safeParse(source)
  if (!result.success) {
    throw new Error(`Invalid public environment: ${formatIssues(result.error)}`)
  }
  return result.data
}

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverSchema.safeParse(source)
  if (!result.success) {
    throw new Error(`Invalid server environment: ${formatIssues(result.error)}`)
  }
  return result.data
}

/** Server-only environment. Throws if reached from the browser. */
export function serverEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error('serverEnv() must never be called in the browser')
  }
  return parseServerEnv(process.env)
}

export const publicEnv: PublicEnv = parsePublicEnv({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
})

function formatIssues(error: z.ZodError): string {
  return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')
}
