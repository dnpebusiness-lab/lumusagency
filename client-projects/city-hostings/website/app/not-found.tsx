import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found | City Hosting',
}

export default function NotFound() {
  return (
    <div className="bg-graphite min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <span className="font-serif text-8xl text-stone/20 block mb-6" aria-hidden>
          404
        </span>
        <h1 className="font-serif text-ivory text-3xl mb-5">
          This page doesn't exist.
        </h1>
        <p className="font-sans text-sm text-ivory/55 leading-relaxed mb-10">
          The page you're looking for may have moved, or the address may be
          incorrect. Return to the homepage or get in touch if you need help.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-3 font-sans text-xs uppercase tracking-widest px-7 py-4 border border-ivory/30 text-ivory hover:border-ivory hover:bg-ivory/8 transition-all duration-300 group"
          >
            <span>Return home</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
          </Link>
          <Link
            href="/contact"
            className="font-sans text-xs uppercase tracking-widest text-ivory/50 hover:text-ivory transition-colors duration-200"
          >
            Contact us
          </Link>
        </div>
      </div>
    </div>
  )
}
