import type { Metadata } from 'next'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { featuredProperties } from '@/data/properties'
import { bookingConfig } from '@/data/booking'
import { PropertyCard } from '@/components/ui/PropertyCard'
import { company } from '@/data/company'

export const metadata: Metadata = {
  title: 'Book Direct | City Hosting Galway',
  description:
    'Book directly with City Hosting — professionally managed holiday accommodation across Galway and the West of Ireland. No platform fees. Direct contact with the hosting team.',
  alternates: { canonical: 'https://cityhostings.com/book-direct' },
}

export default function BookDirectPage() {
  return (
    <>
      <section className="bg-charcoal pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="container-editorial">
          <AnimatedSection>
            <p className="label-light mb-5">Book Direct</p>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <h1 className="font-serif text-ivory text-display mb-8 max-w-2xl">
              Stay somewhere
              <br />
              worth remembering.
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="font-sans text-base text-ivory/60 leading-relaxed max-w-lg">
              Browse professionally managed accommodation across Galway and the
              West of Ireland, and book directly with the local hosting team.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Booking integration placeholder */}
      {!bookingConfig.isLive && (
        <section className="bg-porcelain py-10">
          <div className="container-editorial">
            <div className="border border-stone/60 px-8 py-6 max-w-2xl">
              <p className="label mb-3">Integration pending</p>
              <p className="font-sans text-sm text-taupe leading-relaxed">
                Direct booking is being set up. In the meantime, contact us directly
                to check availability and arrange a booking.
              </p>
              <div className="flex gap-6 mt-5">
                <a
                  href={company.contact.phoneHref}
                  className="font-sans text-xs uppercase tracking-widest text-charcoal underline underline-offset-4 hover:text-gold transition-colors"
                >
                  Call us
                </a>
                <a
                  href={company.contact.emailHref}
                  className="font-sans text-xs uppercase tracking-widest text-charcoal underline underline-offset-4 hover:text-gold transition-colors"
                >
                  Email us
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TODO_CLIENT_INPUT: Wire booking widget when provider is confirmed */}
      {bookingConfig.isLive && bookingConfig.widgetScript && (
        <section className="bg-porcelain py-12">
          <div className="container-editorial">
            <div id="booking-widget" data-provider-url={bookingConfig.providerUrl}>
              {/* Booking widget will mount here */}
            </div>
          </div>
        </section>
      )}

      {/* Properties */}
      <section className="bg-ivory section-pad" aria-labelledby="properties-heading">
        <div className="container-editorial">
          <AnimatedSection className="mb-14">
            <p className="label mb-4">Available properties</p>
            <h2 id="properties-heading" className="font-serif text-charcoal text-headline">
              Managed by City Hosting.
            </h2>
          </AnimatedSection>

          {featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {featuredProperties.map((p, i) => (
                <PropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>
          ) : (
            <AnimatedSection className="py-20 text-center">
              <p className="font-serif text-2xl text-charcoal mb-4">
                Properties coming soon.
              </p>
              <p className="font-sans text-sm text-taupe max-w-sm mx-auto">
                Our managed properties will be listed here shortly. Contact us to
                discuss availability.
              </p>
            </AnimatedSection>
          )}
        </div>
      </section>
    </>
  )
}
