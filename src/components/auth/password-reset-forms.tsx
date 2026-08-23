'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { requestPasswordReset, updatePassword, type FormState } from '@/app/(auth)/actions'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import { SubmitButton } from './submit-button'

export function ForgotPasswordForm({ disabled }: { disabled?: boolean }) {
  const [state, formAction] = useActionState<FormState, FormData>(requestPasswordReset, {})

  if (state.message) {
    return (
      <div className="space-y-4">
        <Alert tone="success">{state.message}</Alert>
        <Link
          href="/sign-in"
          className="hover:text-copper-600 text-xs underline underline-offset-4"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <Field id="email" label="Email address" errors={state.fieldErrors?.email}>
        <Input name="email" type="email" autoComplete="email" required disabled={disabled} />
      </Field>
      <SubmitButton pendingLabel="Sending…">Send reset link</SubmitButton>
    </form>
  )
}

export function ResetPasswordForm({ disabled }: { disabled?: boolean }) {
  const [state, formAction] = useActionState<FormState, FormData>(updatePassword, {})

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}

      <Field
        id="password"
        label="New password"
        hint="At least 12 characters."
        errors={state.fieldErrors?.password}
      >
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          disabled={disabled}
        />
      </Field>

      <Field
        id="confirmPassword"
        label="Confirm new password"
        errors={state.fieldErrors?.confirmPassword}
      >
        <Input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          disabled={disabled}
        />
      </Field>

      <SubmitButton pendingLabel="Saving…">Set new password</SubmitButton>
    </form>
  )
}
