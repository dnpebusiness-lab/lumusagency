import * as React from 'react'
import { cn } from '@/lib/utils'

type Tone = 'info' | 'success' | 'warning' | 'danger'

const TONES: Record<Tone, string> = {
  info: 'border-[var(--color-info)]/35 bg-[var(--color-info)]/8 text-[var(--color-info)]',
  success:
    'border-[var(--color-success)]/35 bg-[var(--color-success)]/8 text-[var(--color-success)]',
  warning:
    'border-[var(--color-warning)]/35 bg-[var(--color-warning)]/8 text-[var(--color-warning)]',
  danger: 'border-[var(--color-danger)]/35 bg-[var(--color-danger)]/8 text-[var(--color-danger)]',
}

export function Alert({
  tone = 'info',
  title,
  children,
  className,
}: {
  tone?: Tone
  title?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('rounded-md border px-4 py-3 text-sm', TONES[tone], className)}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      {children ? (
        <div className={cn(title && 'mt-1', 'text-ink-700 dark:text-ink-200')}>{children}</div>
      ) : null}
    </div>
  )
}
