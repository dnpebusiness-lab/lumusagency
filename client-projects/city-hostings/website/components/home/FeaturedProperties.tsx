'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { featuredProperties } from '@/data/properties'
import { PropertyCard } from '@/components/ui/PropertyCard'

type BezierEase = [number, number, number, number]
const ease: BezierEase = [0.22, 1, 0.36, 1]

// Only render properties that have real content
const ready = featuredProperties.filter(
  (p) => !p.name.startsWith('TODO') && p.images.length > 0
)

export default function FeaturedProperties() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="bg-ivory section-pad" aria-labelledby="properties-heading">
      <div className="container-editorial">

        {/* Header row */}
        <div ref={ref} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 pb-6 border-b border-stone/50">
          <div>
            <motion.p
              className="label mb-3"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, ease }}
            >
              Available stays
            </motion.p>
            <div style={{ overflow: 'hidden' }}>
              <motion.h2
                id="properties-heading"
                className="font-serif font-normal text-charcoal"
                style={{ fontSize: 'clamp(1.75rem, 2.5vw, 2.75rem)', lineHeight: 1.1 }}
                initial={{ y: '106%' }}
                animate={inView ? { y: 0 } : {}}
                transition={{ duration: 0.8, ease, delay: 0.1 }}
              >
                Professionally managed
                <br />
                properties.
              </motion.h2>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, ease, delay: 0.25 }}
          >
            <Link
              href="/book-direct"
              className="inline-flex items-center gap-2 font-sans text-[0.65rem] uppercase tracking-[0.13em] text-charcoal/65 hover:text-charcoal transition-colors duration-200 group"
            >
              <span>Browse all properties</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
            </Link>
          </motion.div>
        </div>

        {/* Properties or empty state */}
        {ready.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-8 lg:gap-12">
            {ready.map((property, i) => (
              <PropertyCard key={property.id} property={property} index={i} />
            ))}
          </div>
        ) : (
          <PropertiesLaunching />
        )}
      </div>
    </section>
  )
}

function PropertiesLaunching() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      className="py-12 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:gap-16 items-center"
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.65, ease }}
    >
      <div>
        <p className="font-serif text-xl text-charcoal mb-2">
          Properties launching shortly.
        </p>
        <p className="font-sans text-sm text-taupe leading-relaxed max-w-md">
          Our first managed properties are being prepared for direct booking.
          Get in touch to be notified when they open.
        </p>
      </div>
      <Link
        href="/contact"
        className="inline-flex items-center gap-3 font-sans text-[0.65rem] uppercase tracking-[0.13em] px-6 py-3.5 border border-charcoal/50 text-charcoal hover:bg-charcoal hover:text-ivory transition-all duration-300 group flex-shrink-0"
      >
        <span>Get in touch</span>
        <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
      </Link>
    </motion.div>
  )
}
