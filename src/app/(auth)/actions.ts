'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  safeRedirectPath,
  signInSchema,
  signUpSchema,
} from '@/lib/validation/auth'

export interface FormState {
  error?: string
  message?: string
  fieldErrors?: Record<string, string[]>
}

function fieldErrorsOf(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const result: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '_')
    result[key] = [...(result[key] ?? []), issue.message]
  }
  return result
}

async function originUrl(): Promise<string> {
  const requestHeaders = await headers()
  const host =
    requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host') ?? 'localhost:3000'
  const protocol =
    requestHeaders.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${protocol}://${host}`
}

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    next: formData.get('next') || undefined,
  })

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsOf(parsed.error) }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    // Deliberately identical for "no such user" and "wrong password": telling
    // them apart lets an attacker enumerate who has an account.
    return { error: 'Those details did not work. Check the email and password and try again.' }
  }

  revalidatePath('/', 'layout')
  redirect(safeRedirectPath(parsed.data.next))
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
  })

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsOf(parsed.error) }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${await originUrl()}/auth/callback`,
      // Only harmless display data. The profile trigger deliberately ignores
      // anything privilege-related that arrives here.
      data: { full_name: parsed.data.fullName },
    },
  })

  if (error) {
    return {
      error: 'We could not create that account. Try again, or use a different email address.',
    }
  }

  return {
    message:
      'Check your inbox. We have sent you a link to confirm your email address before you can sign in.',
  }
}

export async function requestPasswordReset(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get('email') })

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsOf(parsed.error) }
  }

  const supabase = await createServerSupabaseClient()
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await originUrl()}/auth/callback?next=/reset-password`,
  })

  // Always the same answer, whether or not the address exists: otherwise this
  // form becomes an account-enumeration oracle.
  return { message: 'If that email address has an account, a reset link is on its way.' }
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsOf(parsed.error) }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })

  if (error) {
    return { error: 'That reset link is no longer valid. Request a new one and try again.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
