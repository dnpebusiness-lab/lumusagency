import type { Metadata } from 'next'
import { SignInForm } from '@/components/auth/sign-in-form'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { safeRedirectPath } from '@/lib/validation/auth'

export const metadata: Metadata = { title: 'Sign in' }

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const params = await searchParams
  const next = params.next ? safeRedirectPath(params.next) : undefined

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-ink-600 dark:text-ink-300 mt-1 text-sm">
          Manage your restaurant&rsquo;s calls, reservations and knowledge base.
        </p>
      </div>

      {params.error === 'invalid_link' ? (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          That link has expired or has already been used. Request a new one.
        </p>
      ) : null}

      <SignInForm next={next} disabled={!isSupabaseConfigured()} />
    </div>
  )
}
