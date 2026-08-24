'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Select } from '@/components/ui/input'
import { Input } from '@/components/ui/input'
import { LANGUAGE_LABELS, OUTCOME_LABELS, STATUS_LABELS } from '@/lib/calls/format'

/**
 * Filters for the call list.
 *
 * Written as a real <form> with a submit button rather than change handlers, so
 * it works without JavaScript and so a keyboard user can set three filters and
 * apply them once instead of triggering three navigations. The URL is the state,
 * which also makes a filtered view shareable and back-button friendly.
 */
export function CallFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  const current = {
    from: params.get('from') ?? '',
    to: params.get('to') ?? '',
    language: params.get('language') ?? '',
    outcome: params.get('outcome') ?? '',
    status: params.get('status') ?? '',
  }

  const hasFilters = Object.values(current).some((value) => value !== '')

  function apply(formData: FormData) {
    const next = new URLSearchParams()
    for (const key of ['from', 'to', 'language', 'outcome', 'status'] as const) {
      const value = String(formData.get(key) ?? '').trim()
      if (value) next.set(key, value)
    }
    startTransition(() => {
      router.push(next.toString() ? `/dashboard/calls?${next}` : '/dashboard/calls')
    })
  }

  return (
    <form
      action={apply}
      className="rounded-card border-ink-200 dark:border-ink-800 dark:bg-ink-900 border bg-white p-4"
      aria-label="Filter calls"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-1.5">
          <label htmlFor="filter-from" className="block text-xs font-medium">
            From
          </label>
          <Input id="filter-from" name="from" type="date" defaultValue={current.from} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="filter-to" className="block text-xs font-medium">
            To
          </label>
          <Input id="filter-to" name="to" type="date" defaultValue={current.to} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="filter-language" className="block text-xs font-medium">
            Language
          </label>
          <Select id="filter-language" name="language" defaultValue={current.language}>
            <option value="">Any language</option>
            {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="filter-outcome" className="block text-xs font-medium">
            Outcome
          </label>
          <Select id="filter-outcome" name="outcome" defaultValue={current.outcome}>
            <option value="">Any outcome</option>
            {Object.entries(OUTCOME_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="filter-status" className="block text-xs font-medium">
            Status
          </label>
          <Select id="filter-status" name="status" defaultValue={current.status}>
            <option value="">Any status</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-copper-600 hover:bg-copper-700 dark:bg-copper-500 dark:text-ink-950 dark:hover:bg-copper-400 h-9 rounded-md px-4 text-sm font-medium text-white disabled:opacity-60"
        >
          <span aria-live="polite">{pending ? 'Applying…' : 'Apply filters'}</span>
        </button>

        {hasFilters ? (
          <button
            type="submit"
            name="clear"
            formNoValidate
            onClick={(event) => {
              event.preventDefault()
              startTransition(() => router.push('/dashboard/calls'))
            }}
            className="hover:text-copper-600 text-sm underline underline-offset-4"
          >
            Clear
          </button>
        ) : null}
      </div>
    </form>
  )
}
