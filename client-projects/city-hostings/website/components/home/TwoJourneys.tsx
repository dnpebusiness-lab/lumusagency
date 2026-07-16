'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const ease = [0.22, 1, 0.36, 1] as const

function JourneyPanel({
  type,
  label,
  headline,
  body,
  cta,
  ctaHref,
  delay = 0,
}: {
  type: 'owners' | 'guests'
  label: string
  headline: string
  body: string
  cta: string
  ctaHref: string
  delay?: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const isDark = type === 'owners'

  return (
    <motion.div
      ref={ref}
      className="relative flex-1 min-h-[60vh] md:min-h-[80vh] flex items-end overflow-hidden group"
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.9, ease, delay }}
    >
      {/* Background image placeholder */}
      {/* TODO_CLIENT_INPUT: Replace with actual property/Galway photography */}
      <div
        className={`absolute inset-0 transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] ${
          isDark
            ? 'bg-gradient-to-br from-graphite to-charcoal'
            : 'bg-gradient-to-br from-charcoal to-[#4A4540]'
        }`}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-graphite/90 via-graphite/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10 p-8 md:p-12 lg:p-16 w-full">
        <p className="label-light mb-4">{label}</p>

        <h2 className="font-serif text-ivory text-headline mb-5 max-w-sm">
          {headline}
        </h2>

        <p className="font-sans text-sm text-ivory/65 leading-relaxed mb-8 max-w-xs">
          {body}
        </p>

        <Link
          href={ctaHref}
          className="inline-flex items-center gap-3 font-sans text-xs uppercase tracking-widest text-ivory border-b border-ivory/30 pb-0.5 hover:border-gold hover:text-gold transition-all duration-300 group/link"
        >
          <span>{cta}</span>
          <span className="transition-transform duration-300 group-hover/link:translate-x-1" aria-hidden>→</span>
        </Link>
      </div>
    </motion.div>
  )
}

export default function TwoJourneys() {
  return (
    <section aria-label="Two ways to work with City Hosting">
      <div className="flex flex-col md:flex-row">
        <JourneyPanel
          type="owners"
          label="For Property Owners"
          headline="Your property, professionally managed."
          body="From guest communication to pricing, cleaning and ongoing property care, City Hosting provides a complete management service designed to make hosting simpler."
          cta="Explore Property Management"
          ctaHref="/property-management"
          delay={0.1}
        />
        <JourneyPanel
          type="guests"
          label="For Guests"
          headline="Stay somewhere worth remembering."
          body="Discover professionally managed accommodation across Galway and the West of Ireland and book directly with the local hosting team."
          cta="Find a Stay"
          ctaHref="/book-direct"
          delay={0.25}
        />
      </div>
    </section>
  )
}
