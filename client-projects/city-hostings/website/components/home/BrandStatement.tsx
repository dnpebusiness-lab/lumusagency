'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const ease = [0.22, 1, 0.36, 1] as const

export default function BrandStatement() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      ref={ref}
      className="bg-porcelain section-pad-lg"
      aria-label="Brand statement"
    >
      <div className="container-narrow text-center">

        {/* Gold line */}
        <motion.div
          className="flex justify-center mb-10"
          initial={{ scaleX: 0, originX: 0.5 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="block w-12 h-px bg-gold" />
        </motion.div>

        {/* Statement */}
        <motion.h2
          className="font-serif font-normal text-charcoal text-display mb-8 leading-tight"
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, ease, delay: 0.15 }}
        >
          Local knowledge.
          <br />
          Professional management.
          <br />
          <em className="not-italic text-taupe">Genuine hospitality.</em>
        </motion.h2>

        <motion.p
          className="font-sans text-base text-taupe leading-relaxed max-w-lg mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, ease, delay: 0.35 }}
        >
          City Hosting combines deep knowledge of Galway and the West of Ireland
          with the professional standards guests and property owners expect from
          a dedicated, locally based management team.
        </motion.p>
      </div>
    </section>
  )
}
