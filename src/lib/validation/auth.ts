import { z } from 'zod'

/**
 * Server-side validation schemas.
 *
 * These run on the server before anything touches the database. Client-side
 * validation is a convenience; this is the boundary that actually matters.
 */

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Enter your email address')
  .email('Enter a valid email address')
  .max(254)

/**
 * Twelve characters minimum with no composition rules, following NIST 800-63B:
 * length beats forced symbols, which mostly produce "Password1!".
 */
export const passwordSchema = z
  .string()
  .min(12, 'Use at least 12 characters')
  .max(128, 'That is too long')

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password'),
  next: z.string().startsWith('/').max(512).optional(),
})

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().trim().min(2, 'Enter your name').max(120),
})

export const forgotPasswordSchema = z.object({ email: emailSchema })

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'The two passwords do not match',
    path: ['confirmPassword'],
  })

export const organisationSchema = z.object({
  name: z.string().trim().min(2, 'Enter a name').max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/, 'Use lowercase letters, numbers and hyphens'),
  timezone: z.string().trim().min(1).max(64).default('Europe/Dublin'),
  countryCode: z.string().trim().length(2).toUpperCase().default('IE'),
})

export const locationSchema = z.object({
  organisationId: z.string().uuid(),
  name: z.string().trim().min(2, 'Enter a name').max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/, 'Use lowercase letters, numbers and hyphens'),
  addressLine1: z.string().trim().max(200).optional().or(z.literal('')),
  city: z.string().trim().max(120).optional().or(z.literal('')),
  postalCode: z.string().trim().max(20).optional().or(z.literal('')),
  phoneE164: z
    .string()
    .trim()
    .regex(/^\+[1-9][0-9]{6,14}$/, 'Use international format, for example +35315550140')
    .optional()
    .or(z.literal('')),
  timezone: z.string().trim().min(1).max(64).default('Europe/Dublin'),
  maxPartySizeAutoBook: z.coerce.number().int().min(1).max(50).default(8),
})

export const memberInviteSchema = z.object({
  organisationId: z.string().uuid(),
  email: emailSchema,
  role: z.enum(['organisation_owner', 'organisation_admin', 'location_manager', 'staff', 'viewer']),
})

/**
 * Only same-origin, absolute-path redirects are ever followed. Blocks the open
 * redirect that "?next=https://evil.example" would otherwise give an attacker.
 */
export function safeRedirectPath(
  candidate: string | null | undefined,
  fallback = '/dashboard',
): string {
  if (!candidate) return fallback
  if (!candidate.startsWith('/')) return fallback
  if (candidate.startsWith('//')) return fallback
  if (candidate.includes('\\')) return fallback
  return candidate
}
