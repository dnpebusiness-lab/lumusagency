'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { company } from '@/data/company'

const ease = [0.22, 1, 0.36, 1] as const

export default function LocalExpertise() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      className="bg-porcelain section-pad overflow-hidden"
      aria-labelledby="local-expertise-heading"
    >
      <div className="container-editorial">
        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

          {/* Image */}
          <motion.div
            className="relative aspect-[4/3] lg:aspect-[3/4] overflow-hidden order-2 lg:order-1"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease }}
          >
            {/* TODO_CLIENT_INPUT: Replace with authentic Galway or Atlantic coast photography */}
            <div className="img-placeholder absolute inset-0" />
            {/* Decorative border */}
            <div className="absolute inset-0 border border-stone/40 translate-x-4 translate-y-4 -z-10" aria-hidden />
          </motion.div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <motion.p
              className="label mb-5"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, ease, delay: 0.1 }}
            >
              Our home ground
            </motion.p>

            <motion.h2
              id="local-expertise-heading"
              className="font-serif text-charcoal text-headline mb-7"
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease, delay: 0.2 }}
            >
              Rooted in Galway.
              <br />
              Connected to the West.
            </motion.h2>

            <motion.div
              className="space-y-5 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.75, ease, delay: 0.35 }}
            >
              <p className="font-sans text-base text-taupe leading-relaxed">
                City Hosting is a locally based management company. We know
                Galway — the neighbourhoods, the guest expectations, the
                seasonal patterns and the standards that make a stay worth
                returning for.
              </p>
              <p className="font-sans text-base text-taupe leading-relaxed">
                That local knowledge shapes every decision we make — from
                how we position a property to how we respond to guests at
                any hour of the day.
              </p>
            </motion.div>

            {/* Areas */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease, delay: 0.5 }}
            >
              <p className="label mb-4">Areas we cover</p>
              <ul className="space-y-2.5">
                {company.areas.map((area) => (
                  <li key={area} className="flex items-center gap-3">
                    <span className="gold-line" aria-hidden />
                    <span className="font-sans text-sm text-charcoal">{area}</span>
                  </li>
                ))}
              </ul>
              {company.areaNote && (
                <p className="font-sans text-xs text-taupe mt-4 italic">
                  {company.areaNote}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
