import type { Metadata } from 'next'
import { requireSession } from '@/lib/auth/session'
import { resolveActiveOrganisation } from '@/lib/auth/active-organisation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { can, ROLE_LABELS, assignableRoles } from '@/lib/auth/rbac'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { AddLocationForm } from '@/components/dashboard/add-location-form'
import { MemberList } from '@/components/dashboard/member-list'
import type { OrgRole } from '@/lib/db/enums'
import { one } from '@/lib/db/embed'

export const metadata: Metadata = { title: 'Organisation settings' }

interface LocationRow {
  id: string
  name: string
  slug: string
  city: string | null
  phone_e164: string | null
  is_active: boolean
  max_party_size_auto_book: number
}

type ProfileEmbed = { email: string; full_name: string | null }

interface MemberRow {
  id: string
  role: OrgRole
  status: string
  user_id: string
  profiles: ProfileEmbed | ProfileEmbed[] | null
}

export default async function SettingsPage() {
  const context = await requireSession()
  const membership = await resolveActiveOrganisation(context)
  if (!membership) return null

  const supabase = await createServerSupabaseClient()

  const [{ data: organisation }, { data: locations }, { data: members }] = await Promise.all([
    supabase
      .from('organisations')
      .select(
        'name, slug, timezone, country_code, transcript_retention_days, metadata_retention_days, is_demo',
      )
      .eq('id', membership.organisationId)
      .maybeSingle(),
    supabase
      .from('locations')
      .select('id, name, slug, city, phone_e164, is_active, max_party_size_auto_book')
      .eq('organisation_id', membership.organisationId)
      .is('deleted_at', null)
      .order('name'),
    supabase
      .from('organisation_members')
      .select('id, role, status, user_id, profiles(email, full_name)')
      .eq('organisation_id', membership.organisationId)
      .order('role'),
  ])

  const canManageMembers = can(membership.role, 'members:manage')
  const canCreateLocation = can(membership.role, 'locations:create')

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Organisation settings</h1>
        <p className="text-ink-600 dark:text-ink-300 mt-1 text-sm">
          {organisation?.name} · {organisation?.timezone} · {organisation?.country_code}
        </p>
      </div>

      <section aria-labelledby="retention-heading">
        <h2 id="retention-heading" className="text-sm font-semibold tracking-tight">
          Data retention
        </h2>
        <Card className="mt-3">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-ink-500 dark:text-ink-400 text-xs">Transcripts kept for</dt>
              <dd className="tabular mt-0.5 text-sm font-medium">
                {organisation?.transcript_retention_days} days
              </dd>
            </div>
            <div>
              <dt className="text-ink-500 dark:text-ink-400 text-xs">Call metadata kept for</dt>
              <dd className="tabular mt-0.5 text-sm font-medium">
                {organisation?.metadata_retention_days} days
              </dd>
            </div>
          </dl>
          <CardDescription className="mt-4">
            Editing these, and the job that enforces them, arrives in Milestone 6. The database
            already refuses to store a transcript retention longer than 365 days.
          </CardDescription>
        </Card>
      </section>

      <section aria-labelledby="locations-heading">
        <h2 id="locations-heading" className="text-sm font-semibold tracking-tight">
          Locations
        </h2>

        {(locations ?? []).length === 0 ? (
          <Card className="mt-3">
            <CardTitle>No locations yet</CardTitle>
            <CardDescription>Add the restaurant that will answer the phone.</CardDescription>
          </Card>
        ) : (
          <ul className="mt-3 space-y-2">
            {((locations ?? []) as unknown as LocationRow[]).map((location) => (
              <li
                key={location.id}
                className="border-ink-200 dark:border-ink-800 dark:bg-ink-900 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border bg-white px-4 py-3"
              >
                <span className="text-sm font-medium">{location.name}</span>
                <span className="text-ink-500 dark:text-ink-400 text-xs">
                  {[location.city, location.phone_e164].filter(Boolean).join(' · ')}
                </span>
                {!location.is_active ? <Badge tone="warning">Inactive</Badge> : null}
                <span className="text-ink-500 dark:text-ink-400 ml-auto text-xs">
                  Auto-books up to {location.max_party_size_auto_book} guests
                </span>
              </li>
            ))}
          </ul>
        )}

        {canCreateLocation ? (
          <details className="border-ink-200 dark:border-ink-800 dark:bg-ink-900 mt-4 rounded-md border bg-white p-4">
            <summary className="cursor-pointer text-sm font-medium">Add a location</summary>
            <div className="mt-4">
              <AddLocationForm organisationId={membership.organisationId} />
            </div>
          </details>
        ) : null}
      </section>

      <section aria-labelledby="members-heading">
        <h2 id="members-heading" className="text-sm font-semibold tracking-tight">
          Staff access
        </h2>
        <p className="text-ink-500 dark:text-ink-400 mt-1 text-xs">
          Your role: {ROLE_LABELS[membership.role].en} — {ROLE_LABELS[membership.role].description}
        </p>
        <div className="mt-3">
          <MemberList
            organisationId={membership.organisationId}
            currentUserId={context.userId}
            members={((members ?? []) as unknown as MemberRow[]).map((m) => {
              const profile = one(m.profiles)
              return {
                id: m.id,
                role: m.role,
                status: m.status,
                userId: m.user_id,
                email: profile?.email ?? '',
                fullName: profile?.full_name ?? null,
              }
            })}
            canManage={canManageMembers}
            assignableRoles={assignableRoles(membership.role)}
          />
        </div>
      </section>
    </div>
  )
}
