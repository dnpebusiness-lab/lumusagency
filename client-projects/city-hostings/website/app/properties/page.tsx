import type { Metadata } from 'next'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { featuredProperties } from '@/data/properties'
import { PropertyCard } from '@/components/ui/PropertyCard'

export const metadata: Metadata = {
  title: 'Properties | City Hosting Galway',
  description:
    'Browse holiday accommodation managed by City Hosting across Galway and the West of Ireland.',
  alternates: { canonical: 'https://cityhostings.com/properties' },
}

export default function PropertiesPage() {
  return (
    <>
      <section className="bg-charcoal pt-32 pb-20 md:pt-40 md:pb-24">
        <div className="container-editorial">
          <AnimatedSection>
            <p className="label-light mb-5">All properties</p>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <h1 className="font-serif text-ivory text-display max-w-xl">
              Managed properties
              <br />
              across the West.
            </h1>
          </AnimatedSection>
        </div>
      </section>

      <section className="bg-ivory section-pad">
        <div className="container-editorial">
          {featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {featuredProperties.map((p, i) => (
                <PropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>
          ) : (
            <AnimatedSection className="py-24 text-center">
              <p className="font-serif text-2xl text-charcoal mb-4">Coming soon.</p>
              <p className="font-sans text-sm text-taupe max-w-xs mx-auto leading-relaxed">
                Properties are being prepared. Check back shortly or contact us directly.
              </p>
            </AnimatedSection>
          )}
        </div>
      </section>
    </>
  )
}
