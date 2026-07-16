import type { Metadata } from 'next'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { faqs } from '@/data/faqs'
import OwnerCTA from '@/components/home/OwnerCTA'

export const metadata: Metadata = {
  title: 'FAQ | City Hosting Galway',
  description:
    'Frequently asked questions for property owners and guests — City Hosting Galway.',
  alternates: { canonical: 'https://cityhostings.com/faq' },
}

export default function FAQPage() {
  const landlordFaqs = faqs.filter((f) => f.category === 'landlord')
  const guestFaqs = faqs.filter((f) => f.category === 'guest')

  return (
    <>
      <section className="bg-charcoal pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="container-editorial">
          <AnimatedSection>
            <p className="label-light mb-5">Frequently Asked Questions</p>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <h1 className="font-serif text-ivory text-display max-w-2xl">
              Common questions,
              <br />
              clear answers.
            </h1>
          </AnimatedSection>
        </div>
      </section>

      <section className="bg-ivory section-pad" aria-labelledby="landlord-faq-heading">
        <div className="container-editorial max-w-3xl">
          <AnimatedSection className="mb-12">
            <p className="label mb-4">For Property Owners</p>
            <h2 id="landlord-faq-heading" className="font-serif text-charcoal text-headline">
              Property management questions.
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

      <section className="bg-porcelain section-pad" aria-labelledby="guest-faq-heading">
        <div className="container-editorial max-w-3xl">
          <AnimatedSection className="mb-12">
            <p className="label mb-4">For Guests</p>
            <h2 id="guest-faq-heading" className="font-serif text-charcoal text-headline">
              Booking and stay questions.
            </h2>
          </AnimatedSection>
          <div>
            {guestFaqs.map((faq, i) => (
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

      <OwnerCTA />
    </>
  )
}
