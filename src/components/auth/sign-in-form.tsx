'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { signIn, type FormState } from '@/app/(auth)/actions'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import { SubmitButton } from './submit-button'

export function SignInForm({ next, disabled }: { next?: string; disabled?: boolean }) {
  const [state, formAction] = useActionState<FormState, FormData>(signIn, {})

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}

      <Field id="email" label="Email address" errors={state.fieldErrors?.email}>
        <Input name="email" type="email" autoComplete="email" required disabled={disabled} />
      </Field>

      <Field id="password" label="Password" errors={state.fieldErrors?.password}>
        <Input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={disabled}
        />
      </Field>

      <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>

      <div className="text-ink-500 dark:text-ink-400 flex items-center justify-between text-xs">
        <Link
          href="/forgot-password"
          className="hover:text-copper-600 underline underline-offset-4"
        >
          Forgotten your password?
        </Link>
        <Link href="/sign-up" className="hover:text-copper-600 underline underline-offset-4">
          Create an account
        </Link>
      </div>
    </form>
  )
}
