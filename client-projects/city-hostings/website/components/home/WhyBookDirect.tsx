'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'

type BezierEase = [number, number, number, number]
const ease: BezierEase = [0.22, 1, 0.36, 1]

const benefits = [
  {
    number: '01',
    title: 'Direct communication',
    description:
      'Book directly with the hosting team — no intermediary, no automated responses. Real people who know every property we manage.',
  },
  {
    number: '02',
    title: 'Clear, accurate information',
    description:
      "Every detail about the property — location, access, what's included — comes directly from us, not a third-party platform.",
  },
  {
    number: '03',
    title: 'Local guest support',
    description:
      "We're based in Galway. If you need anything during your stay, we're reachable and close by.",
  },
  {
    number: '04',
    title: 'Straightforward booking',
    description:
      'A direct, simple booking journey with no platform complexity and a clear record of everything agreed.',
  },
]

function BenefitRow({
  number,
  title,
  description,
  index,
}: {
  number: string
  title: string
  description: string
  index: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-30px' })

  return (
    <motion.div
      ref={ref}
      className="grid border-b border-stone/40 py-6"
      style={{ gridTemplateColumns: '2.5rem 1fr' }}
      initial={{ opacity: 0, x: -12 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease, delay: index * 0.08 }}
    >
      <span
        className="font-serif text-sm text-taupe/50 pt-0.5 flex-shrink-0"
        aria-hidden
      >
        {number}
      </span>
      <div>
        <h3 className="font-serif text-lg text-charcoal mb-1.5">{title}</h3>
        <p className="font-sans text-sm text-taupe leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

export default function WhyBookDirect() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="bg-ivory section-pad" aria-labelledby="book-direct-heading">
      <div className="container-editorial">
        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">

          {/* Left: sticky heading */}
          <div className="lg:sticky lg:top-28">
            <motion.p
              className="label mb-6"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, ease }}
            >
              For guests
            </motion.p>

            <div style={{ overflow: 'hidden' }} className="mb-8">
              <motion.h2
                id="book-direct-heading"
                className="font-serif font-normal text-charcoal"
                style={{
                  fontSize: 'clamp(1.875rem, 3vw, 2.875rem)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                }}
                initial={{ y: '106%' }}
                animate={inView ? { y: 0 } : {}}
                transition={{ duration: 0.85, ease, delay: 0.1 }}
              >
                Book directly
                <br />
                with us.
              </motion.h2>
            </div>

            <motion.p
              className="font-sans text-sm text-taupe leading-relaxed mb-10 max-w-sm"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.7, ease, delay: 0.3 }}
            >
              When you book directly with City Hosting, you're connecting
              with the team that manages the property — not a booking
              platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.45, duration: 0.5 }}
            >
              <Link
                href="/book-direct"
                className="inline-flex items-center gap-3 font-sans text-[0.65rem] uppercase tracking-[0.13em] px-6 py-3.5 bg-charcoal text-ivory hover:bg-graphite transition-colors duration-300 group"
              >
                <span>Browse stays</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
              </Link>
            </motion.div>
          </div>

          {/* Right: benefits register */}
          <div className="border-t border-stone/40">
            {benefits.map((b, i) => (
              <BenefitRow key={b.number} {...b} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
