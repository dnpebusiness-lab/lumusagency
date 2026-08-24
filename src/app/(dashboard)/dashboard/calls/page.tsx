import type { Metadata } from 'next'
import Link from 'next/link'
import { requireSession } from '@/lib/auth/session'
import { resolveActiveOrganisation } from '@/lib/auth/active-organisation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { maskPhoneNumber } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { CallFilters } from '@/components/calls/call-filters'
import { DeployedDisclosure } from '@/components/calls/deployed-disclosure'
import {
  LANGUAGE_LABELS,
  OUTCOME_LABELS,
  STATUS_LABELS,
  formatCallTime,
  formatDuration,
  formatIntent,
  outcomeTone,
} from '@/lib/calls/format'
import type { CallOutcome, CallStatus, LanguageCode } from '@/lib/db/enums'
import { one } from '@/lib/db/embed'

export const metadata: Metadata = { title: 'Calls' }

const PAGE_SIZE = 50

interface CallRow {
  id: string
  started_at: string
  duration_seconds: number | null
  status: CallStatus
  outcome: CallOutcome | null
  detected_language: LanguageCode | null
  caller_number_e164: string | null
  primary_intent: string | null
  disclosure_completed_at: string | null
  recording_url: string | null
  is_internal_evaluation: boolean
}

type SearchParams = {
  from?: string
  to?: string
  language?: string
  outcome?: string
  status?: string
}

export default async function CallsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const context = await requireSession()
  const membership = await resolveActiveOrganisation(context)
  if (!membership) return null

  const filters = await searchParams
  const supabase = await createServerSupabaseClient()

  // The restaurant is the controller and must be able to see the exact wording
  // its callers hear (compliance/12). Read through the user's client, so RLS
  // still decides what is visible.
  const { data: agentConfig } = await supabase
    .from('agent_configurations')
    .select('supported_languages, recording_enabled, locations(name)')
    .eq('organisation_id', membership.organisationId)
    .limit(1)
    .maybeSingle()

  const configRow = agentConfig as {
    supported_languages: LanguageCode[]
    recording_enabled: boolean
    locations: { name: string } | { name: string }[] | null
  } | null
  const configLocation = one(configRow?.locations ?? null)

  // The authenticated user's client, so RLS decides which rows exist at all.
  // The organisation filter below is for correctness when somebody belongs to
  // more than one tenant, never for security.
  let query = supabase
    .from('call_sessions')
    .select(
      'id, started_at, duration_seconds, status, outcome, detected_language, caller_number_e164, primary_intent, disclosure_completed_at, recording_url, is_internal_evaluation',
    )
    .eq('organisation_id', membership.organisationId)
    .order('started_at', { ascending: false })
    .limit(PAGE_SIZE)

  if (filters.from) query = query.gte('started_at', `${filters.from}T00:00:00Z`)
  if (filters.to) query = query.lte('started_at', `${filters.to}T23:59:59Z`)
  if (filters.language === 'en' || filters.language === 'it') {
    query = query.eq('detected_language', filters.language)
  }
  if (filters.outcome && filters.outcome in OUTCOME_LABELS) {
    query = query.eq('outcome', filters.outcome)
  }
  if (filters.status && filters.status in STATUS_LABELS) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  const calls = (data ?? []) as unknown as CallRow[]

  const hasFilters = Boolean(
    filters.from || filters.to || filters.language || filters.outcome || filters.status,
  )

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Calls</h1>
        <p className="text-ink-600 dark:text-ink-300 mt-1 text-sm">{membership.organisationName}</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {membership.isDemo ? <Badge tone="warning">Demonstration data</Badge> : null}
        <Badge tone="neutral">Audio recording off</Badge>
        <Badge tone="neutral">Internal evaluation</Badge>
      </div>

      {configRow ? (
        <DeployedDisclosure
          locationName={configLocation?.name ?? membership.organisationName}
          languages={configRow.supported_languages ?? ['en']}
          recordingEnabled={configRow.recording_enabled}
        />
      ) : null}

      <CallFilters />

      {error ? (
        <Alert tone="danger" title="We could not load your calls">
          Reload the page. If it keeps happening, the call history is still safe — this is a display
          problem, not a data problem.
        </Alert>
      ) : calls.length === 0 ? (
        <Card>
          <CardTitle>{hasFilters ? 'No calls match those filters' : 'No calls yet'}</CardTitle>
          <CardDescription>
            {hasFilters
              ? 'Try widening the date range, or clear the filters.'
              : 'Calls appear here as soon as the phone number is connected and a call completes.'}
          </CardDescription>
        </Card>
      ) : (
        <section aria-labelledby="calls-heading">
          <h2 id="calls-heading" className="sr-only">
            Call history
          </h2>

          {/* Wide table scrolls inside its own container so the page never
              scrolls sideways on a phone. */}
          <div className="rounded-card border-ink-200 dark:border-ink-800 overflow-x-auto border">
            <table className="w-full min-w-[52rem] border-collapse text-sm">
              <caption className="sr-only">
                Calls for {membership.organisationName}, newest first. Caller numbers are masked.
              </caption>
              <thead>
                <tr className="border-ink-200 bg-ink-50 dark:border-ink-800 dark:bg-ink-950 border-b text-left">
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Started
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Caller
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Language
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Reason
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Outcome
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    Duration
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Disclosure
                  </th>
                </tr>
              </thead>
              <tbody>
                {calls.map((call) => (
                  <tr
                    key={call.id}
                    className="border-ink-200 hover:bg-ink-50 dark:border-ink-800 dark:hover:bg-ink-800/40 border-b last:border-0"
                  >
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <Link
                        href={`/dashboard/calls/${call.id}`}
                        className="underline-offset-4 hover:underline focus-visible:underline"
                      >
                        {formatCallTime(call.started_at)}
                        <span className="sr-only"> — open call details</span>
                      </Link>
                    </td>
                    <td className="tabular px-4 py-2.5 whitespace-nowrap">
                      {call.caller_number_e164 ? maskPhoneNumber(call.caller_number_e164) : '—'}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {call.detected_language ? LANGUAGE_LABELS[call.detected_language] : '—'}
                    </td>
                    <td className="px-4 py-2.5">{formatIntent(call.primary_intent)}</td>
                    <td className="px-4 py-2.5">
                      {call.outcome ? (
                        <Badge tone={outcomeTone(call.outcome)}>
                          {OUTCOME_LABELS[call.outcome]}
                        </Badge>
                      ) : (
                        <Badge tone="neutral">{STATUS_LABELS[call.status]}</Badge>
                      )}
                    </td>
                    <td className="tabular px-4 py-2.5 text-right whitespace-nowrap">
                      {formatDuration(call.duration_seconds)}
                    </td>
                    <td className="px-4 py-2.5">
                      {call.disclosure_completed_at ? (
                        <Badge tone="success">Given</Badge>
                      ) : (
                        <Badge tone="danger">Not recorded</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-ink-500 dark:text-ink-400 mt-3 text-xs">
            Showing the {calls.length} most recent calls. Caller numbers are masked for everyone in
            Milestone 4A; revealing a full number requires an audited action, which arrives in
            Milestone 6.
          </p>
        </section>
      )}
    </div>
  )
}
