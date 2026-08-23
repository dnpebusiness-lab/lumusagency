import type { Metadata } from 'next'
import { SignUpForm } from '@/components/auth/sign-up-form'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export const metadata: Metadata = { title: 'Create an account' }

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-ink-600 dark:text-ink-300 mt-1 text-sm">
          You will set up your restaurant in the next step.
        </p>
      </div>
      <SignUpForm disabled={!isSupabaseConfigured()} />
    </div>
  )
}
