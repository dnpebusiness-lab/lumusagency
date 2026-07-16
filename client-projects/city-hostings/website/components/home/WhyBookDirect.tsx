'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'

const ease = [0.22, 1, 0.36, 1] as const

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
  const inView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      className="flex gap-7 py-7 border-b border-stone/50 last:border-0"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease, delay: 0.1 * index }}
    >
      <span className="font-serif text-xl text-stone flex-shrink-0 w-8 mt-1">{number}</span>
      <div>
        <h3 className="font-serif text-xl text-charcoal mb-2">{title}</h3>
        <p className="font-sans text-sm text-taupe leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

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

export default function WhyBookDirect() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="bg-ivory section-pad" aria-labelledby="book-direct-heading">
      <div className="container-editorial">

        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left: heading */}
          <div className="lg:sticky lg:top-28">
            <motion.p
              className="label mb-5"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, ease }}
            >
              For guests
            </motion.p>
            <motion.h2
              id="book-direct-heading"
              className="font-serif text-charcoal text-headline mb-7"
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease, delay: 0.1 }}
            >
              Book directly
              <br />
              with us.
            </motion.h2>
            <motion.p
              className="font-sans text-base text-taupe leading-relaxed mb-10 max-w-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.75, ease, delay: 0.25 }}
            >
              When you book directly with City Hosting, you're connecting
              with the team that manages the property — not a booking
              platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Link
                href="/book-direct"
                className="inline-flex items-center gap-3 font-sans text-xs uppercase tracking-widest px-7 py-4 bg-charcoal text-ivory hover:bg-graphite transition-colors duration-300 group"
              >
                <span>Browse stays</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
              </Link>
            </motion.div>
          </div>

          {/* Right: benefit list */}
          <div>
            {benefits.map((b, i) => (
              <BenefitRow key={b.number} {...b} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
