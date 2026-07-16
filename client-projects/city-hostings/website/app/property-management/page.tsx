import type { Metadata } from 'next'
import Link from 'next/link'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { services, processSteps } from '@/data/services'
import { landlordFaqs } from '@/data/faqs'
import OwnerCTA from '@/components/home/OwnerCTA'

export const metadata: Metadata = {
  title: 'Property Management | Holiday Let Management Galway',
  description:
    'Professional holiday let and short-term rental management in Galway and the West of Ireland. Full management service for property owners — from listing to ongoing guest care.',
  alternates: { canonical: 'https://cityhostings.com/property-management' },
}

export default function PropertyManagementPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-charcoal pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="container-editorial">
          <AnimatedSection>
            <p className="label-light mb-5">Property Management</p>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <h1 className="font-serif text-ivory text-display mb-8 max-w-2xl">
              Professional management
              <br />
              for your holiday let.
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.25}>
            <p className="font-sans text-base text-ivory/65 leading-relaxed max-w-xl mb-10">
              City Hosting handles the full management of your holiday let or short-term
              rental in Galway and the West of Ireland — guests, pricing, cleaning,
              maintenance and everything in between.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.35}>
            <Link
              href="/property-owners#enquiry"
              className="inline-flex items-center gap-3 font-sans text-xs uppercase tracking-widest px-7 py-4 border border-gold text-gold hover:bg-gold hover:text-graphite transition-all duration-300 group"
            >
              <span>Discuss your property</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* What we handle */}
      <section className="bg-ivory section-pad" aria-labelledby="services-full-heading">
        <div className="container-editorial">
          <AnimatedSection className="mb-14">
            <p className="label mb-4">What's included</p>
            <h2 id="services-full-heading" className="font-serif text-charcoal text-headline max-w-xl">
              Everything your property needs to perform.
            </h2>
          </AnimatedSection>
          <div>
            {services.map((s, i) => (
              <AnimatedSection
                key={s.id}
                delay={i * 0.04}
                className="flex items-start gap-6 md:gap-10 py-7 border-b border-stone/50 last:border-0"
              >
                <span className="font-serif text-2xl text-stone/60 flex-shrink-0 w-10 mt-1">{s.number}</span>
                <div>
                  <h3 className="font-serif text-xl text-charcoal mb-1.5">{s.title}</h3>
                  <p className="font-sans text-sm text-taupe leading-relaxed mb-2">{s.description}</p>
                  <p className="font-sans text-xs text-gold">{s.benefit}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-porcelain section-pad" aria-labelledby="pm-process-heading">
        <div className="container-editorial">
          <AnimatedSection className="mb-14">
            <p className="label mb-4">The process</p>
            <h2 id="pm-process-heading" className="font-serif text-charcoal text-headline">
              How we work together.
            </h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {processSteps.map((step, i) => (
              <AnimatedSection key={step.number} delay={i * 0.1} className="border-t border-stone pt-8">
                <span className="font-serif text-3xl text-stone/50 block mb-5">{step.number}</span>
                <h3 className="font-serif text-xl text-charcoal mb-3">{step.title}</h3>
                <p className="font-sans text-sm text-taupe leading-relaxed">{step.description}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Property types */}
      <section className="bg-ivory section-pad" aria-labelledby="property-types-heading">
        <div className="container-editorial max-w-3xl">
          <AnimatedSection>
            <p className="label mb-4">Who this is for</p>
            <h2 id="property-types-heading" className="font-serif text-charcoal text-headline mb-8">
              Suitable properties.
            </h2>
            <div className="space-y-5">
              {[
                'Apartments and houses in Galway City',
                'Properties in Salthill and surrounding areas',
                'Coastal and rural properties in County Galway',
                'Cottages and holiday homes in Connemara and the West',
                'Properties currently listed on short-term rental platforms',
                'Properties transitioning from long-term to short-term let',
              ].map((item) => (
                <div key={item} className="flex items-center gap-4">
                  <span className="gold-line" aria-hidden />
                  <p className="font-sans text-base text-charcoal">{item}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-porcelain section-pad" aria-labelledby="pm-faq-heading">
        <div className="container-editorial max-w-3xl">
          <AnimatedSection className="mb-12">
            <p className="label mb-4">Common questions</p>
            <h2 id="pm-faq-heading" className="font-serif text-charcoal text-headline">
              What landlords ask.
            </h2>
          </AnimatedSection>
          <div>
            {landlordFaqs.slice(0, 6).map((faq, i) => (
              <AnimatedSection
                key={faq.id}
                delay={i * 0.05}
                className="py-7 border-b border-stone/50 last:border-0"
              >
                <h3 className="font-serif text-xl text-charcoal mb-3">{faq.question}</h3>
                <p className="font-sans text-sm text-taupe leading-relaxed">{faq.answer}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <OwnerCTA />
    </>
  )
}
