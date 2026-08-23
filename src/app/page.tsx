import { Card, CardDescription, CardTitle } from '@/components/ui/card'

const milestones = [
  { id: 'M0', label: 'Repository inspection & assumptions', state: 'done' },
  { id: 'M1', label: 'Documentation & scaffold', state: 'current' },
  { id: 'M2', label: 'Schema, RLS, auth, seed data', state: 'todo' },
  { id: 'M3', label: 'Dashboard & knowledge management', state: 'todo' },
  { id: 'M4', label: 'Retell voice integration & webhooks', state: 'todo' },
  { id: 'M5', label: 'Reservation, SMS & transfer tools', state: 'todo' },
  { id: 'M6', label: 'Analytics, audit, retention', state: 'todo' },
  { id: 'M7', label: 'Stripe test mode & onboarding', state: 'todo' },
  { id: 'M8', label: 'Tests, deployment, final review', state: 'todo' },
] as const

const stateStyles: Record<string, string> = {
  done: 'bg-[var(--color-success)] text-white',
  current: 'bg-copper-600 text-white',
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
                className={`tabular inline-flex h-6 w-8 shrink-0 items-center justify-center rounded text-xs font-semibold ${stateStyles[milestone.state]}`}
              >
                {milestone.id}
              </span>
              <span className="text-ink-700 dark:text-ink-200 text-sm">{milestone.label}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}
