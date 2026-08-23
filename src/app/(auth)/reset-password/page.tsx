import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/password-reset-forms'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export const metadata: Metadata = { title: 'Choose a new password' }

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Choose a new password</h1>
        <p className="text-ink-600 dark:text-ink-300 mt-1 text-sm">
          You arrived here from an email link, so we already know who you are.
        </p>
      </div>
      <ResetPasswordForm disabled={!isSupabaseConfigured()} />
    </div>
  )
}
