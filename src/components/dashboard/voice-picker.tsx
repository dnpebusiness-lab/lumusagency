'use client'

import { useActionState } from 'react'
import { updateAgentVoice, type ActionState } from '@/app/(dashboard)/actions'
import type { VoiceOption } from '@/lib/providers/voice/types'
import { Alert } from '@/components/ui/alert'
import { Field } from '@/components/ui/field'
import { Select } from '@/components/ui/input'
import { SubmitButton } from '@/components/auth/submit-button'

export function VoicePicker({
  organisationId,
  locationId,
  voices,
  currentVoiceId,
}: {
  organisationId: string
  locationId: string
  voices: readonly VoiceOption[]
  currentVoiceId: string | null
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(updateAgentVoice, {})

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="organisationId" value={organisationId} />
      <input type="hidden" name="locationId" value={locationId} />

      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      {state.message ? <Alert tone="success">{state.message}</Alert> : null}

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <Field id={`voice-${locationId}`} label="Voice">
            <Select
              id={`voice-${locationId}`}
              name="voiceId"
              defaultValue={currentVoiceId ?? ''}
              required
            >
              <option value="" disabled>
                Choose a voice…
              </option>
              {voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {[voice.name, voice.accent, voice.gender].filter(Boolean).join(' · ')}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="sm:max-w-40">
          <SubmitButton pendingLabel="Saving…">Save voice</SubmitButton>
        </div>
      </div>
    </form>
  )
}
