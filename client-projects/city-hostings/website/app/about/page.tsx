import type { Metadata } from 'next'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { company } from '@/data/company'
import OwnerCTA from '@/components/home/OwnerCTA'

export const metadata: Metadata = {
  title: 'About | City Hosting Galway',
  description:
    'City Hosting is a professional holiday let management company based in Galway, Ireland. Local knowledge, professional management, genuine hospitality.',
  alternates: { canonical: 'https://cityhostings.com/about' },
}

export default function AboutPage() {
  return (
    <>
      <section className="bg-charcoal pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="container-editorial">
          <AnimatedSection>
            <p className="label-light mb-5">About City Hosting</p>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <h1 className="font-serif text-ivory text-display mb-8 max-w-2xl">
              A professional hosting
              <br />
              team, based in Galway.
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="font-sans text-base text-ivory/60 leading-relaxed max-w-xl">
              City Hosting provides professional holiday let and short-term rental
              management for property owners across Galway and the West of Ireland.
              We combine local expertise with the standards guests expect from a
              professionally managed stay.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="bg-ivory section-pad">
        <div className="container-editorial">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <AnimatedSection>
              <p className="label mb-5">What we do</p>
              <h2 className="font-serif text-charcoal text-headline mb-8">
                Local knowledge,
                <br />
                professional standards.
              </h2>
              <div className="space-y-5">
                <p className="font-sans text-base text-taupe leading-relaxed">
                  City Hosting was founded to give property owners in Galway and the
                  West of Ireland access to a genuinely professional management service —
                  one that handles every part of the hosting process with care.
                </p>
                <p className="font-sans text-base text-taupe leading-relaxed">
                  We work with a small number of properties and give each one the
                  attention it deserves. Our team knows Galway well — the neighbourhoods,
                  the guest expectations, the seasonal patterns and the standards that
                  make a stay worth returning for.
                </p>
                <p className="font-sans text-base text-taupe leading-relaxed">
                  {/* TODO_CLIENT_INPUT: Add specific company history, founding story, or team details */}
                  For property owners, this means working with a locally based team
                  who understands their investment and manages it accordingly. For guests,
                  it means a well-prepared, clearly presented property with a real team
                  behind it.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2} className="space-y-10">
              <div>
                {/* TODO_CLIENT_INPUT: Add team information and photos */}
                <p className="label mb-4">The team</p>
                <div className="bg-porcelain p-8">
                  <p className="font-sans text-sm text-taupe leading-relaxed italic">
                    TODO_CLIENT_INPUT: Team information and photographs to be provided
                    by the client before go-live.
                  </p>
                </div>
              </div>

              <div>
                <p className="label mb-5">Based in</p>
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
                <p className="label mb-5">Areas covered</p>
                <ul className="space-y-3">
                  {company.areas.map((area) => (
                    <li key={area} className="flex items-center gap-3">
                      <span className="gold-line" aria-hidden />
                      <span className="font-sans text-sm text-charcoal">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <OwnerCTA />
    </>
  )
}
