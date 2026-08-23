import 'server-only'

import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import type { OrgRole, PlatformRole } from '@/lib/db/enums'
import { can, type Permission } from './rbac'
import { many, one } from '@/lib/db/embed'

export interface Membership {
  organisationId: string
  organisationName: string
  organisationSlug: string
  isDemo: boolean
  role: OrgRole
  assignedLocationIds: string[]
}

export interface SessionContext {
  userId: string
  email: string
  fullName: string | null
  platformRole: PlatformRole
  memberships: Membership[]
}

/**
 * The signed-in user, or null.
 *
 * getUser() re-validates the token with Supabase rather than trusting the
 * cookie, so a tampered cookie cannot manufacture a session. Wrapped in React's
 * cache() so a page that checks auth in a layout and again in a component pays
 * for one round trip, not two.
 */
export const getCurrentUser = cache(async () => {
  if (!isSupabaseConfigured()) return null

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
})

export const getSessionContext = cache(async (): Promise<SessionContext | null> => {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createServerSupabaseClient()

  // Both queries are filtered by RLS: a user physically cannot read a
  // membership or an organisation that is not theirs.
  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase
      .from('profiles')
      .select('email, full_name, platform_role')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('organisation_members')
      .select(
        'id, role, organisation_id, organisations(name, slug, is_demo), organisation_member_locations(location_id)',
      )
      .eq('user_id', user.id)
      .eq('status', 'active'),
  ])

  type OrganisationEmbed = { name: string; slug: string; is_demo: boolean }
  type MembershipRow = {
    id: string
    role: OrgRole
    organisation_id: string
    organisations: OrganisationEmbed | OrganisationEmbed[] | null
    organisation_member_locations: { location_id: string }[] | null
  }

  return {
    userId: user.id,
    email: profile?.email ?? user.email ?? '',
    fullName: profile?.full_name ?? null,
    platformRole: (profile?.platform_role as PlatformRole | undefined) ?? 'member',
    memberships: ((memberships ?? []) as unknown as MembershipRow[]).map((row) => {
      const organisation = one(row.organisations)
      return {
        organisationId: row.organisation_id,
        organisationName: organisation?.name ?? 'Unknown organisation',
        organisationSlug: organisation?.slug ?? '',
        isDemo: organisation?.is_demo ?? false,
        role: row.role,
        assignedLocationIds: many(row.organisation_member_locations).map((l) => l.location_id),
      }
    }),
  }
})

/** Redirects to sign-in when there is no session. Use at the top of a protected page. */
export async function requireSession(): Promise<SessionContext> {
  const context = await getSessionContext()
  if (!context) redirect('/sign-in')
  return context
}

export function membershipFor(context: SessionContext, organisationId: string): Membership | null {
  return context.memberships.find((m) => m.organisationId === organisationId) ?? null
}

/**
 * Fail fast on a permission the user does not have.
 *
 * This produces a readable error instead of an opaque RLS denial. It is not the
 * security boundary — the database is — so it never grants anything on its own.
 */
export function assertPermission(
  context: SessionContext,
  organisationId: string,
  permission: Permission,
): Membership {
  const membership = membershipFor(context, organisationId)
  if (!membership || !can(membership.role, permission)) {
    throw new Error('You do not have permission to do that.')
  }
  return membership
}
