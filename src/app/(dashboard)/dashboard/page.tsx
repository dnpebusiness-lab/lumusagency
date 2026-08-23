import type { Metadata } from 'next'
import { requireSession } from '@/lib/auth/session'
import { resolveActiveOrganisation } from '@/lib/auth/active-organisation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'

export const metadata: Metadata = { title: 'Overview' }

interface CallRow {
  outcome: string | null
  transfer_status: string
  primary_intent: string | null
  escalation_reason: string | null
}

export default async function OverviewPage() {
  const context = await requireSession()
  const membership = await resolveActiveOrganisation(context)
  if (!membership) return null

  const supabase = await createServerSupabaseClient()

  // Both queries are filtered by RLS; the explicit organisation filter is for
  // correctness when a user belongs to more than one tenant, not for security.
  const [{ data: calls }, { count: reservationCount }] = await Promise.all([
    supabase
      .from('call_sessions')
      .select('outcome, transfer_status, primary_intent, escalation_reason')
      .eq('organisation_id', membership.organisationId),
    supabase
      .from('reservations')
      .select('id', { count: 'exact', head: true })
      .eq('organisation_id', membership.organisationId)
      .eq('status', 'confirmed'),
  ])

  const rows = (calls ?? []) as unknown as CallRow[]

  const total = rows.length
  const answered = rows.filter(
    (c) => c.outcome && !['abandoned', 'system_failure'].includes(c.outcome),
  ).length
  const failed = rows.filter(
    (c) =>
      c.outcome &&
      ['abandoned', 'system_failure', 'transfer_failed', 'reservation_failed'].includes(c.outcome),
  ).length
  const transfers = rows.filter((c) => c.transfer_status !== 'not_requested').length

  const intentCounts = new Map<string, number>()
  for (const call of rows) {
    const intent = call.primary_intent ?? 'unknown'
    intentCounts.set(intent, (intentCounts.get(intent) ?? 0) + 1)
  }
  const topIntents = [...intentCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
        <p className="text-ink-600 dark:text-ink-300 mt-1 text-sm">{membership.organisationName}</p>
      </div>

      {membership.isDemo ? (
        <Alert tone="warning" title="Demonstration data">
          Everything below is fictional seed data for a restaurant that does not exist. No real
          caller has ever reached this system.
        </Alert>
      ) : null}

      <section aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="sr-only">
          Key numbers
        </h2>
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Metric label="Total calls" value={total} />
          <Metric label="Answered" value={answered} />
          <Metric label="Failed or abandoned" value={failed} />
          <Metric label="Reservations" value={reservationCount ?? 0} />
          <Metric label="Transfers" value={transfers} />
        </dl>
      </section>

      <section aria-labelledby="intents-heading">
        <h2 id="intents-heading" className="text-sm font-semibold tracking-tight">
          Most common reasons for calling
        </h2>
        {topIntents.length === 0 ? (
          <Card className="mt-3">
            <CardTitle>No calls yet</CardTitle>
            <CardDescription>
              Once a phone number is connected in Milestone 4, calls will appear here.
            </CardDescription>
          </Card>
        ) : (
          <ol className="mt-3 space-y-2">
            {topIntents.map(([intent, count]) => (
              <li
                key={intent}
                className="border-ink-200 dark:border-ink-800 dark:bg-ink-900 flex items-center justify-between rounded-md border bg-white px-4 py-2.5 text-sm"
              >
                <span className="capitalize">{intent.replace(/_/g, ' ')}</span>
                <span className="tabular text-ink-500 dark:text-ink-400">{count}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <Alert tone="info" title="Milestone 2 build">
        Calls, reservations, knowledge and agent settings are wired to the database but their
        screens arrive in Milestone 3. Everything you can see here is real data read through Row
        Level Security.
      </Alert>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <dt className="text-ink-500 dark:text-ink-400 text-xs font-medium tracking-wide uppercase">
        {label}
      </dt>
      <dd className="tabular mt-1 text-2xl font-semibold">{value}</dd>
    </Card>
  )
}
