'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { company } from '@/data/company'

type BezierEase = [number, number, number, number]
const ease: BezierEase = [0.22, 1, 0.36, 1]

export default function LocalExpertise() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      className="bg-porcelain overflow-hidden"
      aria-labelledby="local-expertise-heading"
    >
      <div className="h-px w-full bg-stone/60" aria-hidden />

      <div ref={ref} className="container-editorial py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">

          {/* Image column */}
          <motion.div
            className="relative overflow-hidden order-2 lg:order-1"
            style={{ aspectRatio: '3/4' }}
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.95, ease }}
          >
            {/* Image placeholder — client replaces with Galway photography */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(165deg, #3A3630 0%, #252219 55%, #302C24 100%)',
              }}
              role="img"
              aria-label="Galway, West of Ireland — placeholder for photography"
            />

            {/* Geographic caption */}
            <div
              className="absolute bottom-0 left-0 right-0 px-5 py-4 flex items-end justify-between"
              style={{
                background: 'linear-gradient(to top, rgba(30,27,22,0.72) 0%, transparent 100%)',
              }}
              aria-hidden
            >
              <span
                className="font-sans uppercase tracking-[0.14em] text-ivory/55"
                style={{ fontSize: '0.62rem' }}
              >
                Galway
              </span>
              <span
                className="font-sans uppercase tracking-[0.1em] text-ivory/30"
                style={{ fontSize: '0.6rem', fontVariantNumeric: 'lining-nums' }}
              >
                53°16′N &nbsp;9°3′W
              </span>
            </div>
          </motion.div>

          {/* Text column */}
          <div className="order-1 lg:order-2 lg:pt-6">
            <motion.p
              className="label mb-6"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, ease, delay: 0.1 }}
            >
              Our home ground
            </motion.p>

            <div style={{ overflow: 'hidden' }} className="mb-8">
              <motion.h2
                id="local-expertise-heading"
                className="font-serif font-normal text-charcoal"
                style={{
                  fontSize: 'clamp(1.875rem, 3vw, 2.875rem)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                }}
                initial={{ y: '106%' }}
                animate={inView ? { y: 0 } : {}}
                transition={{ duration: 0.85, ease, delay: 0.15 }}
              >
                Rooted in Galway.
                <br />
                Connected to the West.
              </motion.h2>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.7, ease, delay: 0.35 }}
            >
              <p className="font-sans text-sm text-taupe leading-relaxed mb-4">
                City Hosting is a locally based management company. We know
                Galway — the neighbourhoods, the guest expectations, the
                seasonal patterns and the standards that make a stay worth
                returning for.
              </p>
              <p className="font-sans text-sm text-taupe leading-relaxed mb-10">
                That local knowledge shapes every decision we make — from
                how we position a property to how we respond to guests at
                any hour of the day.
              </p>
            </motion.div>

            {/* Areas — ruled register */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, ease, delay: 0.5 }}
            >
              <p className="label mb-3">Areas we cover</p>
              <ul className="divide-y divide-stone/50">
                {company.areas.map((area) => (
                  <li
                    key={area}
                    className="flex items-center justify-between py-3"
                  >
                    <span className="font-sans text-sm text-charcoal">{area}</span>
                    <span className="font-serif text-xs text-taupe/40" aria-hidden>→</span>
                  </li>
                ))}
              </ul>
              {company.areaNote && (
                <p className="font-sans text-xs text-taupe/50 mt-5 leading-relaxed border-t border-stone/40 pt-4">
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
