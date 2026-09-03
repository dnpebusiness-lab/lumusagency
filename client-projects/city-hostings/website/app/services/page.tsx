import type { Metadata } from 'next'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { services } from '@/data/services'
import OwnerCTA from '@/components/home/OwnerCTA'

export const metadata: Metadata = {
  title: 'Services | City Hosting Galway',
  description:
    'Full range of holiday let management services from City Hosting — listing setup, pricing, guest communication, cleaning, maintenance, reporting and more.',
  alternates: { canonical: 'https://cityhostings.com/services' },
}

export default function ServicesPage() {
  return (
    <>
      <section className="bg-charcoal pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="container-editorial">
          <AnimatedSection>
            <p className="label-light mb-5">Services</p>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <h1 className="font-serif text-ivory text-display mb-6 max-w-2xl">
              Everything included
              <br />
              in full management.
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="font-sans text-base text-ivory/60 leading-relaxed max-w-xl">
              City Hosting provides a complete management service. Below is a full
              overview of what's included when we manage your property.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="bg-ivory section-pad" aria-label="All services">
        <div className="container-editorial">
          <div>
            {services.map((service, i) => (
              <AnimatedSection
                key={service.id}
                delay={i * 0.04}
                className="grid grid-cols-1 md:grid-cols-[80px_1fr_1fr] gap-6 md:gap-12 py-10 border-b border-stone/50 last:border-0"
              >
                <span className="font-serif text-3xl text-stone/50">{service.number}</span>
                <div>
                  <h2 className="font-serif text-2xl text-charcoal mb-3">{service.title}</h2>
                  <p className="font-sans text-sm text-taupe leading-relaxed">{service.description}</p>
                </div>
                <div className="border-l border-stone/40 pl-6 md:pl-10">
                  <p className="label mb-2">Benefit to you</p>
                  <p className="font-sans text-sm text-charcoal leading-relaxed">{service.benefit}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <OwnerCTA />
    </>
  )
}
