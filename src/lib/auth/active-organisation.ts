import 'server-only'

import { cookies } from 'next/headers'
import type { Membership, SessionContext } from './session'

export const ACTIVE_ORG_COOKIE = 'astra_active_org'

/**
 * Which organisation the dashboard is currently showing.
 *
 * The cookie is a *preference*, never an authorisation input: the value is only
 * honoured if it appears in the user's own membership list, which was itself
 * read through RLS. Setting the cookie by hand therefore achieves nothing.
 */
export async function resolveActiveOrganisation(
  context: SessionContext,
): Promise<Membership | null> {
  if (context.memberships.length === 0) return null

  const cookieStore = await cookies()
  const requested = cookieStore.get(ACTIVE_ORG_COOKIE)?.value

  return context.memberships.find((m) => m.organisationId === requested) ?? context.memberships[0]!
}
