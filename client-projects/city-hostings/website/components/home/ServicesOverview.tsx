'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { services } from '@/data/services'

const ease = [0.22, 1, 0.36, 1] as const

function ServiceRow({
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
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      className="group flex items-start gap-6 md:gap-10 py-6 md:py-8 border-b border-stone/60 last:border-0 cursor-default"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease, delay: 0.05 * index }}
    >
      {/* Number */}
      <span className="font-serif text-2xl md:text-3xl text-stone group-hover:text-gold transition-colors duration-300 flex-shrink-0 leading-none mt-1 w-10">
        {number}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-serif text-xl md:text-2xl text-charcoal mb-2 group-hover:text-graphite transition-colors duration-200">
          {title}
        </h3>
        <p className="font-sans text-sm text-taupe leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  )
}

export default function ServicesOverview() {
  const headRef = useRef(null)
  const headInView = useInView(headRef, { once: true, margin: '-80px' })

  return (
    <section className="bg-ivory section-pad" aria-labelledby="services-heading">
      <div className="container-editorial">

        {/* Header */}
        <div ref={headRef} className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <motion.p
              className="label mb-4"
              initial={{ opacity: 0 }}
              animate={headInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, ease }}
            >
              What we manage
            </motion.p>
            <motion.h2
              id="services-heading"
              className="font-serif text-charcoal text-headline"
              initial={{ opacity: 0, y: 24 }}
              animate={headInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.75, ease, delay: 0.1 }}
            >
              A complete management
              <br />
              service for your property.
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={headInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Link
              href="/services"
              className="font-sans text-xs uppercase tracking-widest text-charcoal border-b border-stone pb-0.5 hover:border-charcoal transition-colors duration-200 inline-flex items-center gap-2 group"
            >
              <span>View all services</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
            </Link>
          </motion.div>
        </div>

        {/* Service rows */}
        <div>
          {services.slice(0, 6).map((service, i) => (
            <ServiceRow
              key={service.id}
              number={service.number}
              title={service.title}
              description={service.description}
              index={i}
            />
          ))}
        </div>

        {/* See all */}
        <div className="mt-10 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-3 font-sans text-xs uppercase tracking-widest px-8 py-4 border border-charcoal text-charcoal hover:bg-charcoal hover:text-ivory transition-all duration-300 group"
          >
            <span>All {services.length} services</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
