import type { Metadata } from 'next'
import Link from 'next/link'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { landlordFaqs } from '@/data/faqs'
import LandlordForm from '@/components/forms/LandlordForm'

export const metadata: Metadata = {
  title: 'For Property Owners | City Hosting Galway',
  description:
    'Thinking about professional management for your holiday let or short-term rental in Galway? City Hosting handles everything — request a free property consultation.',
  alternates: { canonical: 'https://cityhostings.com/property-owners' },
}

export default function PropertyOwnersPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-graphite pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="container-editorial">
          <AnimatedSection>
            <p className="label-light mb-5">For Property Owners</p>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <h1 className="font-serif text-ivory text-display mb-8 max-w-2xl">
              Professional hosting,
              <br />
              without the day-to-day work.
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.25}>
            <p className="font-sans text-base text-ivory/65 leading-relaxed max-w-xl">
              Whether your property is currently listed or you're exploring short-term
              rental for the first time, City Hosting provides a complete management
              service so you can benefit from your property without managing it yourself.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Who we work with */}
      <section className="bg-ivory section-pad" aria-labelledby="who-heading">
        <div className="container-editorial">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <AnimatedSection>
              <p className="label mb-5">Who we work with</p>
              <h2 id="who-heading" className="font-serif text-charcoal text-headline mb-8">
                City Hosting is suited to property owners who want a fully managed service.
              </h2>
              <p className="font-sans text-base text-taupe leading-relaxed">
                We work with owners who want their property managed professionally — not
                those looking to manage guests themselves with occasional support. If you
                want to be hands-off, this is built for you.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.15} className="space-y-6 pt-2">
              {[
                {
                  title: 'New to short-term letting',
                  text: 'Setting up a holiday let for the first time and want it done properly from the start.',
                },
                {
                  title: 'Currently self-managing',
                  text: 'Managing your own listing and looking to hand it over to a professional team.',
                },
                {
                  title: 'Transitioning from long-term rental',
                  text: 'Moving a property from long-term tenancy to holiday let and need full setup support.',
                },
                {
                  title: 'Owner of multiple properties',
                  text: 'Looking for consistent professional management across more than one property.',
                },
              ].map((item) => (
                <div key={item.title} className="border-l-2 border-stone pl-6">
                  <h3 className="font-serif text-lg text-charcoal mb-1.5">{item.title}</h3>
                  <p className="font-sans text-sm text-taupe leading-relaxed">{item.text}</p>
                </div>
              ))}
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* What to expect */}
      <section className="bg-porcelain section-pad" aria-labelledby="expect-heading">
        <div className="container-editorial max-w-3xl">
          <AnimatedSection className="mb-12">
            <p className="label mb-4">What to expect</p>
            <h2 id="expect-heading" className="font-serif text-charcoal text-headline">
              How working with us looks.
            </h2>
          </AnimatedSection>
          <div className="space-y-0">
            {[
              {
                title: 'An initial conversation about your property',
                text: 'We start with a straightforward consultation — no pressure, no obligations. We want to understand your property and your goals before suggesting anything.',
              },
              {
                title: 'A clear management proposal',
                text: "We'll outline exactly how we'd manage your property, what's included and what the fee arrangement looks like.",
              },
              {
                title: 'Property preparation and listing',
                text: "Once you're ready to proceed, we handle everything — photography direction, listing creation, pricing strategy and platform setup.",
              },
              {
                title: 'Ongoing management with regular updates',
                text: "From that point, we manage your property day to day. You'll receive regular reporting and can always reach us directly with any questions.",
              },
            ].map((item, i) => (
              <AnimatedSection
                key={item.title}
                delay={i * 0.07}
                className="flex gap-6 py-8 border-b border-stone/50 last:border-0"
              >
                <span className="font-serif text-2xl text-stone/50 flex-shrink-0 w-8 mt-1">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-serif text-xl text-charcoal mb-2">{item.title}</h3>
                  <p className="font-sans text-sm text-taupe leading-relaxed">{item.text}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-ivory section-pad" aria-labelledby="owners-faq-heading">
        <div className="container-editorial max-w-3xl">
          <AnimatedSection className="mb-12">
            <p className="label mb-4">Questions</p>
            <h2 id="owners-faq-heading" className="font-serif text-charcoal text-headline">
              Frequently asked.
            </h2>
          </AnimatedSection>
          <div>
            {landlordFaqs.map((faq, i) => (
              <AnimatedSection
                key={faq.id}
                delay={i * 0.04}
                className="py-7 border-b border-stone/50 last:border-0"
              >
                <h3 className="font-serif text-xl text-charcoal mb-3">{faq.question}</h3>
                <p className="font-sans text-sm text-taupe leading-relaxed">{faq.answer}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry form */}
      <section
        id="enquiry"
        className="bg-porcelain section-pad"
        aria-labelledby="enquiry-heading"
      >
        <div className="container-editorial max-w-3xl">
          <AnimatedSection className="mb-12">
            <p className="label mb-5">Get started</p>
            <h2 id="enquiry-heading" className="font-serif text-charcoal text-headline mb-5">
              Request a Property Consultation.
            </h2>
            <p className="font-sans text-base text-taupe leading-relaxed max-w-xl">
              Tell us about your property and what you're looking for. We'll be in touch
              to arrange a call at a time that suits you.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.15}>
            <LandlordForm />
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
