import Link from 'next/link'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'

/**
 * Build state, in the order the work actually happened rather than the order the
 * plan proposed. M3 was deliberately deferred so that Milestone 4A could prove
 * one narrow vertical slice — a real inbound call reaching a real dashboard —
 * before the broader management screens were built.
 *
 * "In progress" on M4A means exactly what it says: the implementation is
 * complete and its automated evidence is green, but no live call has been made
 * yet. This page must not imply otherwise.
 */
const milestones = [
  { id: 'M0', label: 'Repository inspection & assumptions', state: 'done', note: null },
  { id: 'M1', label: 'Documentation & scaffold', state: 'done', note: null },
  { id: 'M2', label: 'Schema, RLS, auth, seed data', state: 'done', note: null },
  {
    id: 'M3',
    label: 'Dashboard & knowledge management',
    state: 'deferred',
    note: 'Deferred on purpose, to prove one call end to end first',
  },
  {
    id: 'M4A',
    label: 'Retell voice integration & webhooks',
    state: 'current',
    note: 'Implementation complete; live proof pending',
  },
  { id: 'M5', label: 'Reservation, SMS & transfer tools', state: 'todo', note: null },
  { id: 'M6', label: 'Analytics, audit, retention', state: 'todo', note: null },
  { id: 'M7', label: 'Stripe test mode & onboarding', state: 'todo', note: null },
  { id: 'M8', label: 'Tests, deployment, final review', state: 'todo', note: null },
] as const

const stateStyles: Record<string, string> = {
  done: 'bg-[var(--color-success)] text-white',
  current: 'bg-copper-600 text-white',
  deferred: 'bg-ink-300 text-ink-700 dark:bg-ink-700 dark:text-ink-100',
  todo: 'bg-ink-200 text-ink-600 dark:bg-ink-800 dark:text-ink-300',
}

export default function Home() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
      <p className="text-copper-600 dark:text-copper-400 text-xs font-semibold tracking-[0.18em] uppercase">
        Internal build
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Astra Voice</h1>
      <p className="text-ink-600 dark:text-ink-300 mt-4 max-w-xl text-base leading-relaxed">
        An AI receptionist that answers a restaurant&rsquo;s phone in English and Italian, answers
        only from information the restaurant has approved, takes reservations, and hands the call to
        a person whenever a person is needed.
      </p>

      {/* The deployed app had no way in from its own front page: the only route to
          the dashboard was typing /sign-in by hand. */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/sign-in" className={buttonVariants({ variant: 'primary' })}>
          Sign in
        </Link>
        <Link href="/sign-up" className={buttonVariants({ variant: 'outline' })}>
          Create an account
        </Link>
      </div>

      <Card className="border-copper-200 bg-copper-50 dark:border-copper-800 dark:bg-ink-900 mt-10">
        <CardTitle>Pilot build — not for public use</CardTitle>
        <CardDescription>
          No phone number is connected yet and no legal review has been completed. See
          SECURITY_AND_PRIVACY.md §10 before any real caller reaches this system.
        </CardDescription>
      </Card>

      <section className="mt-12" aria-labelledby="progress-heading">
        <h2 id="progress-heading" className="text-sm font-semibold tracking-tight">
          Build progress
        </h2>
        <ol className="mt-4 space-y-2">
          {milestones.map((milestone) => (
            <li
              key={milestone.id}
              className="border-ink-200 dark:border-ink-800 dark:bg-ink-900 flex items-center gap-3 rounded-md border bg-white px-4 py-3"
            >
              <span
                className={`tabular inline-flex h-6 w-10 shrink-0 items-center justify-center rounded text-xs font-semibold ${stateStyles[milestone.state]}`}
              >
                {milestone.id}
              </span>
              <span className="text-ink-700 dark:text-ink-200 text-sm">
                {milestone.label}
                {milestone.note ? (
                  <span className="text-ink-500 dark:text-ink-400 block text-xs">
                    {milestone.note}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}
