import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { featuredProperties } from '@/data/properties'
import { company } from '@/data/company'
import { pluralise } from '@/lib/utils'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return featuredProperties.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const property = featuredProperties.find((p) => p.slug === slug)
  if (!property) return {}
  return {
    title: `${property.name} | City Hosting`,
    description: property.shortDescription,
    alternates: { canonical: `https://cityhostings.com/properties/${slug}` },
  }
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params
  const property = featuredProperties.find((p) => p.slug === slug)
  if (!property) notFound()

  return (
    <>
      {/* Hero image */}
      <section className="relative pt-20 md:pt-24">
        <div
          className="img-placeholder w-full"
          style={{ aspectRatio: '16/7' }}
          role="img"
          aria-label={`${property.name} — ${property.location}`}
        >
          {/* TODO_CLIENT_INPUT: Replace with actual property photography */}
        </div>
      </section>

      {/* Property detail */}
      <section className="bg-ivory section-pad">
        <div className="container-editorial">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">

            {/* Main content */}
            <div className="lg:col-span-2">
              <AnimatedSection>
                <p className="label mb-4">{property.location}</p>
                <h1 className="font-serif text-charcoal text-headline mb-3">
                  {property.name}
                </h1>
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-stone">
                  <span className="font-sans text-sm text-taupe">
                    {pluralise(property.guests, 'guest', 'guests')}
                  </span>
                  <span className="text-stone">·</span>
                  <span className="font-sans text-sm text-taupe">
                    {pluralise(property.bedrooms, 'bedroom', 'bedrooms')}
                  </span>
                  <span className="text-stone">·</span>
                  <span className="font-sans text-sm text-taupe">
                    {pluralise(property.bathrooms, 'bathroom', 'bathrooms')}
                  </span>
                </div>
                <p className="font-sans text-base text-taupe leading-relaxed mb-8">
                  {property.description}
                </p>
              </AnimatedSection>

              {/* Amenities */}
              {property.amenities.length > 0 && (
                <AnimatedSection delay={0.1} className="mt-10">
                  <h2 className="font-serif text-2xl text-charcoal mb-6">What's included</h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {property.amenities.map((a) => (
                      <li key={a} className="flex items-center gap-3">
                        <span className="gold-line" aria-hidden />
                        <span className="font-sans text-sm text-charcoal">{a}</span>
                      </li>
                    ))}
                  </ul>
                </AnimatedSection>
              )}
            </div>

            {/* Booking sidebar */}
            <AnimatedSection delay={0.2} className="lg:sticky lg:top-24 self-start">
              <div className="bg-porcelain p-8">
                {property.priceFrom && (
                  <p className="font-serif text-2xl text-charcoal mb-6">
                    From €{property.priceFrom} / night
                  </p>
                )}

                <a
                  href={`/book-direct?property=${property.slug}`}
                  className="flex items-center justify-center gap-3 font-sans text-xs uppercase tracking-widest px-6 py-4 bg-charcoal text-ivory hover:bg-graphite transition-colors duration-300 mb-4 w-full"
                >
                  Book Direct
                </a>

                <div className="border-t border-stone pt-6 mt-6">
                  <p className="label mb-3">Questions about this property?</p>
                  <a
                    href={company.contact.phoneHref}
                    className="font-serif text-lg text-charcoal hover:text-gold transition-colors duration-200 block mb-1"
                  >
                    {company.contact.phoneInternational}
                  </a>
                  <a
                    href={company.contact.emailHref}
                    className="font-sans text-xs text-taupe hover:text-charcoal transition-colors duration-200"
                  >
                    {company.contact.email}
                  </a>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  )
}
