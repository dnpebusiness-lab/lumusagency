import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ROLE_LABELS } from '@/lib/auth/rbac'
import { switchOrganisation } from '@/app/(dashboard)/actions'
import type { Membership, SessionContext } from '@/lib/auth/session'

/**
 * Navigation.
 *
 * Milestone 4A ships Overview, Calls and Settings. The Milestone 3 areas are
 * shown but not linked: a dead link that 404s is worse than an honest "not built
 * yet", and hiding them entirely would lose the shape of the product.
 */
const NAV = [
  { href: '/dashboard', label: 'Overview', ready: true },
  { href: '/dashboard/calls', label: 'Calls', ready: true },
  { href: '/dashboard/reservations', label: 'Reservations', ready: false },
  { href: '/dashboard/knowledge', label: 'Knowledge', ready: false },
  { href: '/dashboard/agent', label: 'Agent', ready: false },
  { href: '/settings', label: 'Settings', ready: true },
] as const

export function DashboardShell({
  context,
  activeMembership,
  children,
}: {
  context: SessionContext
  activeMembership: Membership | null
  children: React.ReactNode
}) {
  return (
    <div className="min-h-dvh">
      <header className="border-ink-200 dark:border-ink-800 dark:bg-ink-900 border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
          <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
            Astra&nbsp;Voice
          </Link>

          {activeMembership ? (
            <div className="flex items-center gap-2">
              {context.memberships.length > 1 ? (
                <form action={switchOrganisation}>
                  <label htmlFor="org-switcher" className="sr-only">
                    Choose organisation
                  </label>
                  <select
                    id="org-switcher"
                    name="organisationId"
                    defaultValue={activeMembership.organisationId}
                    className="border-ink-300 dark:border-ink-700 h-8 rounded-md border bg-transparent px-2 text-xs"
                    // Progressive enhancement: submits on change with JS, and
                    // the adjacent button works without it.
                  >
                    {context.memberships.map((membership) => (
                      <option key={membership.organisationId} value={membership.organisationId}>
                        {membership.organisationName}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="ml-1 text-xs underline underline-offset-4">
                    Switch
                  </button>
                </form>
              ) : (
                <span className="text-ink-600 dark:text-ink-300 text-sm">
                  {activeMembership.organisationName}
                </span>
              )}

              <Badge tone="neutral">{ROLE_LABELS[activeMembership.role].en}</Badge>
              {activeMembership.isDemo ? <Badge tone="warning">Demo data</Badge> : null}
            </div>
          ) : null}

          <div className="ml-auto flex items-center gap-3">
            <span className="text-ink-500 dark:text-ink-400 hidden text-xs sm:inline">
              {context.email}
            </span>
            <form action="/auth/sign-out" method="post">
              <button
                type="submit"
                className="border-ink-300 hover:bg-ink-100 dark:border-ink-700 dark:hover:bg-ink-800 rounded-md border px-3 py-1.5 text-xs font-medium"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {activeMembership ? (
          <nav aria-label="Sections" className="mx-auto max-w-6xl overflow-x-auto px-4 sm:px-6">
            <ul className="flex gap-1 pb-2">
              {NAV.map((item) =>
                item.ready ? (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-ink-50 inline-block rounded-md px-3 py-1.5 text-sm"
                    >
                      {item.label}
                    </Link>
                  </li>
                ) : (
                  <li key={item.href}>
                    <span
                      aria-disabled="true"
                      title="Arrives in Milestone 3"
                      className="text-ink-500 dark:text-ink-400 inline-block cursor-not-allowed rounded-md px-3 py-1.5 text-sm"
                    >
                      {item.label}
                      <span className="sr-only"> — not available yet, arrives in Milestone 3</span>
                    </span>
                  </li>
                ),
              )}
            </ul>
          </nav>
        ) : null}
      </header>

      <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  )
}
