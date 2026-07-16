import Link from 'next/link'
import { featuredProperties } from '@/data/properties'
import { PropertyCard } from '@/components/ui/PropertyCard'
import { AnimatedSection } from '@/components/ui/AnimatedSection'

export default function FeaturedProperties() {
  return (
    <section className="bg-ivory section-pad" aria-labelledby="properties-heading">
      <div className="container-editorial">

        {/* Header */}
        <AnimatedSection className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <p className="label mb-4">Available stays</p>
            <h2
              id="properties-heading"
              className="font-serif text-charcoal text-headline"
            >
              Professionally managed
              <br />
              properties.
            </h2>
          </div>
          <Link
            href="/book-direct"
            className="font-sans text-xs uppercase tracking-widest text-charcoal border-b border-stone pb-0.5 hover:border-charcoal transition-colors duration-200 inline-flex items-center gap-2 group self-start md:self-auto"
          >
            <span>Browse all properties</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
          </Link>
        </AnimatedSection>

        {/* Properties grid */}
        {featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-8 lg:gap-12">
            {featuredProperties.map((property, i) => (
              <PropertyCard key={property.id} property={property} index={i} />
            ))}
          </div>
        ) : (
          <AnimatedSection className="py-20 text-center">
            <p className="label mb-3">Coming soon</p>
            <p className="font-serif text-2xl text-charcoal mb-6">
              Properties launching shortly.
            </p>
            <p className="font-sans text-sm text-taupe max-w-sm mx-auto leading-relaxed">
              Our first managed properties are being prepared. Get in touch to
              be notified when direct bookings open.
            </p>
            <div className="mt-8">
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 font-sans text-xs uppercase tracking-widest px-7 py-4 border border-charcoal text-charcoal hover:bg-charcoal hover:text-ivory transition-all duration-300 group"
              >
                <span>Get notified</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
              </Link>
            </div>
          </AnimatedSection>
        )}
      </div>
    </section>
  )
}
