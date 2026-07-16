import type { Metadata } from 'next'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { company } from '@/data/company'

export const metadata: Metadata = {
  title: 'Contact | City Hosting Galway',
  description:
    'Get in touch with City Hosting — property management enquiries, guest support, or general questions. Based in Galway, Ireland.',
  alternates: { canonical: 'https://cityhostings.com/contact' },
}

export default function ContactPage() {
  return (
    <>
      <section className="bg-graphite pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="container-editorial">
          <AnimatedSection>
            <p className="label-light mb-5">Contact</p>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <h1 className="font-serif text-ivory text-display mb-8 max-w-xl">
              We're easy to reach.
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="font-sans text-base text-ivory/60 leading-relaxed max-w-md">
              Whether you're a property owner exploring management or a guest with a
              question, get in touch directly — we respond promptly.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="bg-ivory section-pad">
        <div className="container-editorial">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* Contact details */}
            <AnimatedSection>
              <div className="space-y-10">
                <div>
                  <p className="label mb-4">Phone</p>
                  <a
                    href={company.contact.phoneHref}
                    className="font-serif text-3xl text-charcoal hover:text-gold transition-colors duration-200"
                  >
                    {company.contact.phoneInternational}
                  </a>
                  <p className="font-sans text-sm text-taupe mt-2">
                    Call or text — we respond to both.
                  </p>
                </div>

                <div>
                  <p className="label mb-4">Email</p>
                  <a
                    href={company.contact.emailHref}
                    className="font-serif text-2xl text-charcoal hover:text-gold transition-colors duration-200"
                  >
                    {company.contact.email}
                  </a>
                  <p className="font-sans text-sm text-taupe mt-2">
                    For property enquiries and general questions.
                  </p>
                </div>

                <div>
                  <p className="label mb-4">Address</p>
                  <address className="not-italic">
                    <p className="font-sans text-base text-charcoal leading-relaxed">
                      {company.address.line1}<br />
                      {company.address.city}<br />
                      {company.address.eircode}<br />
                      {company.address.country}
                    </p>
                  </address>
                </div>

                <div>
                  <p className="label mb-4">Operating area</p>
                  <ul className="space-y-2">
                    {company.areas.map((area) => (
                      <li key={area} className="flex items-center gap-3">
                        <span className="gold-line" aria-hidden />
                        <span className="font-sans text-sm text-charcoal">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimatedSection>

            {/* Quick note */}
            <AnimatedSection delay={0.2} className="lg:border-l lg:border-stone lg:pl-16">
              <h2 className="font-serif text-2xl text-charcoal mb-6">
                Property owners
              </h2>
              <p className="font-sans text-sm text-taupe leading-relaxed mb-8">
                If you're interested in professional management for your holiday let or
                short-term rental, the best starting point is our detailed enquiry form
                — it helps us understand your property before we speak.
              </p>
              <a
                href="/property-owners#enquiry"
                className="inline-flex items-center gap-3 font-sans text-xs uppercase tracking-widest px-7 py-4 bg-charcoal text-ivory hover:bg-graphite transition-colors duration-300 group"
              >
                <span>Property enquiry form</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
              </a>

              <h2 className="font-serif text-2xl text-charcoal mt-12 mb-6">
                Guests
              </h2>
              <p className="font-sans text-sm text-taupe leading-relaxed mb-8">
                For questions about a booking or stay, contact us directly by phone or
                email — we're the local team behind every property we manage.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  )
}
