import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions | City Hosting',
  alternates: { canonical: 'https://cityhostings.com/terms' },
}

export default function TermsPage() {
  return (
    <div className="bg-ivory pt-32 pb-24 md:pt-40">
      <div className="container-narrow">
        <p className="label mb-5">Legal</p>
        <h1 className="font-serif text-charcoal text-display mb-12">Terms & Conditions</h1>
        <div className="bg-porcelain border border-stone p-6 max-w-xl">
          <p className="font-sans text-sm text-taupe italic">
            TODO_CLIENT_INPUT: Full terms and conditions required before go-live.
            Must cover booking terms, cancellation policy, property management
            agreement terms, liability and governing law (Republic of Ireland).
          </p>
        </div>
      </div>
    </div>
  )
}
