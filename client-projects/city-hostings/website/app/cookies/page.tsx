import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy | City Hosting',
  alternates: { canonical: 'https://cityhostings.com/cookies' },
}

export default function CookiesPage() {
  return (
    <div className="bg-ivory pt-32 pb-24 md:pt-40">
      <div className="container-narrow">
        <p className="label mb-5">Legal</p>
        <h1 className="font-serif text-charcoal text-display mb-12">Cookie Policy</h1>
        <div className="bg-porcelain border border-stone p-6 max-w-xl">
          <p className="font-sans text-sm text-taupe italic">
            TODO_CLIENT_INPUT: Cookie policy required before go-live. Must cover
            cookies used, their purpose, duration and how users can manage preferences.
          </p>
        </div>
      </div>
    </div>
  )
}
