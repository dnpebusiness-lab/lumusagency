import { verifiedTestimonials } from '@/data/testimonials'
import { AnimatedSection } from '@/components/ui/AnimatedSection'

export default function Testimonials() {
  // Only renders when verified testimonials exist
  if (verifiedTestimonials.length === 0) return null

  return (
    <section className="bg-porcelain section-pad" aria-labelledby="testimonials-heading">
      <div className="container-editorial">
        <AnimatedSection className="text-center mb-14">
          <p className="label mb-4">What people say</p>
          <h2
            id="testimonials-heading"
            className="font-serif text-charcoal text-headline"
          >
            From property owners
            <br />
            and guests.
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {verifiedTestimonials.map((t, i) => (
            <AnimatedSection key={t.id} delay={i * 0.1} className="bg-ivory p-8 md:p-10">
              <p className="font-sans text-xs uppercase tracking-widest text-gold mb-6">
                {t.type === 'landlord' ? 'Property Owner' : 'Guest'}
              </p>
              <blockquote className="font-serif text-xl text-charcoal leading-relaxed mb-8">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <footer>
                <p className="font-sans text-sm font-medium text-charcoal">{t.name}</p>
                <p className="font-sans text-xs text-taupe mt-1">{t.context}</p>
              </footer>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
