'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'

export function SubmitButton({
  children,
  pendingLabel,
}: {
  children: string
  pendingLabel: string
}) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {/* aria-live so a screen-reader user hears the state change, not just sees it */}
      <span aria-live="polite">{pending ? pendingLabel : children}</span>
    </Button>
  )
}
