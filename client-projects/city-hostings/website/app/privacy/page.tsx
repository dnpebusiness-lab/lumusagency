import type { Metadata } from 'next'
import { company } from '@/data/company'

export const metadata: Metadata = {
  title: 'Privacy Policy | City Hosting',
  alternates: { canonical: 'https://cityhostings.com/privacy' },
}

export default function PrivacyPage() {
  return (
    <div className="bg-ivory pt-32 pb-24 md:pt-40">
      <div className="container-narrow">
        <p className="label mb-5">Legal</p>
        <h1 className="font-serif text-charcoal text-display mb-12">Privacy Policy</h1>

        {/* TODO_CLIENT_INPUT: Full privacy policy required before go-live.
            Must comply with GDPR and Irish data protection law.
            Contact details below are confirmed. */}

        <div className="prose font-sans text-base text-taupe leading-relaxed space-y-8">
          <div>
            <h2 className="font-serif text-2xl text-charcoal mb-4">Data Controller</h2>
            <p>
              City Hosting<br />
              {company.address.line1}<br />
              {company.address.city}<br />
              {company.address.eircode}<br />
              {company.address.country}
            </p>
            <p className="mt-3">
              Email: <a href={company.contact.emailHref} className="text-charcoal underline">{company.contact.email}</a><br />
              Phone: {company.contact.phoneInternational}
            </p>
          </div>

          <div className="bg-porcelain border border-stone p-6">
            <p className="font-sans text-sm text-taupe italic">
              TODO_CLIENT_INPUT: Full privacy policy text to be provided and reviewed
              by legal counsel before this website goes live. This must cover: data
              collected, purpose, legal basis, retention, third-party sharing, subject
              rights and how to contact the data controller.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
