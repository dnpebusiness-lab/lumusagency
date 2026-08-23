import * as React from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'border-ink-300 text-ink-900 placeholder:text-ink-400 h-10 w-full rounded-md border bg-white px-3 text-sm',
        'focus:border-copper-500 focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'aria-[invalid=true]:border-[var(--color-danger)]',
        'dark:border-ink-700 dark:bg-ink-900 dark:text-ink-50',
        className,
      )}
      {...props}
    />
  )
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'border-ink-300 text-ink-900 placeholder:text-ink-400 w-full rounded-md border bg-white p-3 text-sm',
        'focus:border-copper-500 focus:outline-none',
        'dark:border-ink-700 dark:bg-ink-900 dark:text-ink-50',
        className,
      )}
      {...props}
    />
  )
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'border-ink-300 text-ink-900 h-10 w-full rounded-md border bg-white px-3 text-sm',
        'focus:border-copper-500 focus:outline-none',
        'dark:border-ink-700 dark:bg-ink-900 dark:text-ink-50',
        className,
      )}
      {...props}
    />
  )
}
