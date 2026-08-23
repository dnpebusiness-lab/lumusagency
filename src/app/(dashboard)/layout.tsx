import { redirect } from 'next/navigation'
import { requireSession } from '@/lib/auth/session'
import { resolveActiveOrganisation } from '@/lib/auth/active-organisation'
import { DashboardShell } from '@/components/dashboard/shell'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { Alert } from '@/components/ui/alert'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <main id="main" className="mx-auto max-w-xl px-6 py-16">
        <h1 className="text-xl font-semibold tracking-tight">Not connected yet</h1>
        <Alert tone="warning" className="mt-4">
          This build has no Supabase credentials, so there is no database to read. Follow
          <span className="font-mono"> SUPABASE_SETUP.md</span>, add the keys, and reload.
        </Alert>
      </main>
    )
  }

  const context = await requireSession()
  const activeMembership = await resolveActiveOrganisation(context)

  // A signed-in user with no organisation has nothing to show. /onboarding
  // lives outside this route group precisely so this redirect cannot loop.
  if (!activeMembership) redirect('/onboarding')

  return (
    <DashboardShell context={context} activeMembership={activeMembership}>
      {children}
    </DashboardShell>
  )
}
