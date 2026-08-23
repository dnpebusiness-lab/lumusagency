import Link from 'next/link'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { Alert } from '@/components/ui/alert'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-12">
      <Link href="/" className="text-sm font-semibold tracking-tight">
        Astra&nbsp;Voice
      </Link>

      {!isSupabaseConfigured() ? (
        <Alert tone="warning" title="Not connected to a database yet" className="mt-6">
          This build has no Supabase credentials, so signing in cannot work. Follow
          <span className="font-mono"> SUPABASE_SETUP.md</span> to create the free project and add
          the two keys, then reload.
        </Alert>
      ) : null}

      <div className="mt-6">{children}</div>
    </main>
  )
}
