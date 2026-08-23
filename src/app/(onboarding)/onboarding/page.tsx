import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { requireSession } from '@/lib/auth/session'
import { CreateOrganisationForm } from '@/components/dashboard/create-organisation-form'

export const metadata: Metadata = { title: 'Set up your restaurant' }

export default async function OnboardingPage() {
  const context = await requireSession()

  // Already set up: nothing to onboard.
  if (context.memberships.length > 0) redirect('/dashboard')

  return (
    <main id="main" className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-xl font-semibold tracking-tight">Set up your restaurant</h1>
      <p className="text-ink-600 dark:text-ink-300 mt-1 text-sm">
        This creates your organisation and makes you its owner. You can add locations, staff and
        your menu straight afterwards.
      </p>
      <div className="mt-6">
        <CreateOrganisationForm />
      </div>
    </main>
  )
}
