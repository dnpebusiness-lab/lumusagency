'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signUp, type FormState } from '@/app/(auth)/actions'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import { SubmitButton } from './submit-button'

export function SignUpForm({ disabled }: { disabled?: boolean }) {
  const [state, formAction] = useActionState<FormState, FormData>(signUp, {})

  if (state.message) {
    return (
      <Alert tone="success" title="Almost there">
        {state.message}
      </Alert>
    )
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}

      <Field id="fullName" label="Your name" errors={state.fieldErrors?.fullName}>
        <Input name="fullName" autoComplete="name" required disabled={disabled} />
      </Field>

      <Field id="email" label="Email address" errors={state.fieldErrors?.email}>
        <Input name="email" type="email" autoComplete="email" required disabled={disabled} />
      </Field>

      <Field
        id="password"
        label="Password"
        hint="At least 12 characters. Length matters more than symbols."
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

      <SubmitButton pendingLabel="Creating your account…">Create account</SubmitButton>

      <p className="text-ink-500 dark:text-ink-400 text-xs">
        Already have an account?{' '}
        <Link href="/sign-in" className="hover:text-copper-600 underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  )
}
