'use client'

import { useActionState } from 'react'
import { createLocation, type ActionState } from '@/app/(dashboard)/actions'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import { SubmitButton } from '@/components/auth/submit-button'

export function AddLocationForm({ organisationId }: { organisationId: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(createLocation, {})

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="organisationId" value={organisationId} />

      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      {state.message ? <Alert tone="success">{state.message}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="location-name" label="Name" errors={state.fieldErrors?.name}>
          <Input name="name" required />
        </Field>
        <Field
          id="location-slug"
          label="Short address"
          hint="Lowercase letters, numbers, hyphens."
          errors={state.fieldErrors?.slug}
        >
          <Input name="slug" required />
        </Field>
        <Field
          id="location-address"
          label="Street address"
          errors={state.fieldErrors?.addressLine1}
        >
          <Input name="addressLine1" autoComplete="street-address" />
        </Field>
        <Field id="location-city" label="City" errors={state.fieldErrors?.city}>
          <Input name="city" />
        </Field>
        <Field
          id="location-phone"
          label="Public phone number"
          hint="International format, e.g. +35315550140"
          errors={state.fieldErrors?.phoneE164}
        >
          <Input name="phoneE164" inputMode="tel" />
        </Field>
        <Field
          id="location-party"
          label="Largest party the agent may book"
          hint="Bigger groups are always passed to a person."
          errors={state.fieldErrors?.maxPartySizeAutoBook}
        >
          <Input name="maxPartySizeAutoBook" type="number" min={1} max={50} defaultValue={8} />
        </Field>
      </div>

      <SubmitButton pendingLabel="Adding…">Add location</SubmitButton>
    </form>
  )
}
