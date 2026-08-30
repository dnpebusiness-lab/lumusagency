'use client'

import { useActionState } from 'react'
import { syncVoiceAgent, type ActionState } from '@/app/(dashboard)/actions'
import { Alert } from '@/components/ui/alert'
import { SubmitButton } from '@/components/auth/submit-button'

export function SyncAgentForm({
  organisationId,
  locationId,
  locationName,
}: {
  organisationId: string
  locationId: string
  locationName: string
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(syncVoiceAgent, {})

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="organisationId" value={organisationId} />
      <input type="hidden" name="locationId" value={locationId} />

      {/* The vendor's own words, unedited. A synchronisation that half-worked
          and reported success is exactly what this button exists to end. */}
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      {state.message ? <Alert tone="success">{state.message}</Alert> : null}

      <div className="sm:max-w-xs">
        <SubmitButton pendingLabel="Sending…">{`Sync ${locationName}`}</SubmitButton>
      </div>
    </form>
  )
}
