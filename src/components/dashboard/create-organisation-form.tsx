'use client'

import { useActionState, useState } from 'react'
import { createOrganisation, type ActionState } from '@/app/(dashboard)/actions'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import { SubmitButton } from '@/components/auth/submit-button'

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

export function CreateOrganisationForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(createOrganisation, {})
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}

      <Field id="name" label="Restaurant or company name" errors={state.fieldErrors?.name}>
        <Input
          name="name"
          required
          onChange={(event) => {
            if (!slugTouched) setSlug(slugify(event.target.value))
          }}
        />
      </Field>

      <Field
        id="slug"
        label="Web address"
        hint="Lowercase letters, numbers and hyphens. You can change this later."
        errors={state.fieldErrors?.slug}
      >
        <Input
          name="slug"
          value={slug}
          required
          onChange={(event) => {
            setSlugTouched(true)
            setSlug(event.target.value)
          }}
        />
      </Field>

      <Field id="timezone" label="Time zone" errors={state.fieldErrors?.timezone}>
        <Input name="timezone" defaultValue="Europe/Dublin" required />
      </Field>

      <SubmitButton pendingLabel="Creating…">Create organisation</SubmitButton>
    </form>
  )
}
