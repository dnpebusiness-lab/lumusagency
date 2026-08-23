import * as React from 'react'
import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

const TONES: Record<Tone, string> = {
  neutral: 'bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200',
  accent: 'bg-copper-100 text-copper-800 dark:bg-copper-900 dark:text-copper-100',
  success: 'bg-[var(--color-success)]/12 text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]/12 text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger)]/12 text-[var(--color-danger)]',
}

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        TONES[tone],
        className,
      )}
      {...props}
    />
  )
}
