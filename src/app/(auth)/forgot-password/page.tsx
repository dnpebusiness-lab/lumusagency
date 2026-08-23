import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/password-reset-forms'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export const metadata: Metadata = { title: 'Reset your password' }

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Reset your password</h1>
        <p className="text-ink-600 dark:text-ink-300 mt-1 text-sm">
          We will email you a link to choose a new one.
        </p>
      </div>
      <ForgotPasswordForm disabled={!isSupabaseConfigured()} />
    </div>
  )
}
