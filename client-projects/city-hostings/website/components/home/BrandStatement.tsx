'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

type BezierEase = [number, number, number, number]
const ease: BezierEase = [0.22, 1, 0.36, 1]

export default function BrandStatement() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section aria-label="About City Hosting" className="bg-porcelain">
      <div className="h-px w-full bg-stone/60" aria-hidden />

      <div ref={ref} className="container-editorial py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] items-start gap-14 lg:gap-24">

          {/* Left: heading — clip-path reveal from bottom */}
          <div>
            <motion.span
              aria-hidden
              className="block w-7 h-px bg-gold mb-10"
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              style={{ transformOrigin: 'left' }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            />

            <div style={{ overflow: 'hidden' }}>
              <motion.h2
                className="font-serif font-normal text-charcoal"
                style={{
                  fontSize: 'clamp(1.875rem, 3.2vw, 3.125rem)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                  textWrap: 'balance',
                } as React.CSSProperties}
                initial={{ y: '106%' }}
                animate={inView ? { y: 0 } : {}}
                transition={{ duration: 0.9, ease }}
              >
                We manage holiday lets so property
                owners can focus on ownership —
                not operations.
              </motion.h2>
            </div>
          </div>

          {/* Right: body — fades in with editorial offset */}
          <motion.div
            className="lg:pt-[4.5rem]"
            style={{ borderLeft: '1px solid var(--color-stone)', paddingLeft: 'clamp(1.5rem, 3vw, 3rem)' }}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.75, ease, delay: 0.5 }}
          >
            <p className="font-sans text-sm text-taupe leading-relaxed mb-7">
              City Hosting is a Galway-based management company working with
              holiday-let owners across the West of Ireland. We handle the
              day-to-day — guests, pricing, cleaning, maintenance — so
              owners can earn from their property without being consumed by it.
            </p>
            <p
              className="font-sans text-ivory/0 uppercase tracking-[0.14em]"
              style={{ fontSize: '0.65rem', color: 'var(--color-taupe)', opacity: 0.55 }}
            >
              Based in Galway &nbsp;·&nbsp; West of Ireland
            </p>
          </motion.div>
        </div>
      </div>

      <div className="h-px w-full bg-stone/60" aria-hidden />
    </section>
  )
}
