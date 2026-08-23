import * as React from 'react'
import { cn } from '@/lib/utils'

interface FieldProps {
  id: string
  label: string
  hint?: string
  errors?: string[]
  children: React.ReactNode
  className?: string
}

/**
 * One labelled form control with its hint and its errors, wired together with
 * the aria attributes a screen reader needs: the label points at the control,
 * the control points back at its description and its error.
 */
export function Field({ id, label, hint, errors, children, className }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = errors?.length ? `${id}-error` : undefined

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="text-ink-800 dark:text-ink-100 block text-sm font-medium">
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="text-ink-500 dark:text-ink-400 text-xs">
          {hint}
        </p>
      ) : null}
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
            id,
            'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
            'aria-invalid': errors?.length ? true : undefined,
          })
        : children}
      {errors?.length ? (
        <p id={errorId} role="alert" className="text-xs text-[var(--color-danger)]">
          {errors.join('. ')}
        </p>
      ) : null}
    </div>
  )
}
