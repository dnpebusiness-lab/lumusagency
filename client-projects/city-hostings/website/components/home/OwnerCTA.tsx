'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'

const ease = [0.22, 1, 0.36, 1] as const

export default function OwnerCTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      className="bg-graphite section-pad-lg overflow-hidden"
      aria-labelledby="owner-cta-heading"
    >
      <div ref={ref} className="container-editorial">
        <div className="max-w-3xl">

          {/* Gold accent line */}
          <motion.div
            className="mb-10"
            initial={{ scaleX: 0, originX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="block w-10 h-px bg-gold" aria-hidden />
          </motion.div>

          <motion.p
            className="label-light mb-6"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, ease, delay: 0.15 }}
          >
            For property owners
          </motion.p>

          <div className="overflow-hidden mb-8">
            <motion.h2
              id="owner-cta-heading"
              className="font-serif font-normal text-ivory text-display"
              initial={{ y: '110%' }}
              animate={inView ? { y: 0 } : {}}
              transition={{ duration: 0.85, ease, delay: 0.2 }}
            >
              Let your property work harder,
              <br />
              <em className="not-italic text-ivory/70">without managing it alone.</em>
            </motion.h2>
          </div>

          <motion.p
            className="font-sans text-base text-ivory/60 leading-relaxed max-w-xl mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75, ease, delay: 0.4 }}
          >
            Tell us about your property and we'll discuss how City Hosting can
            support your goals — from listing setup to full ongoing management.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-5"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease, delay: 0.55 }}
          >
            <Link
              href="/property-owners#enquiry"
              className="inline-flex items-center gap-3 font-sans text-xs uppercase tracking-widest px-7 py-4 border border-gold text-gold hover:bg-gold hover:text-graphite transition-all duration-300 group"
            >
              <span>Request a Property Consultation</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center gap-3 font-sans text-xs uppercase tracking-widest px-7 py-4 border border-white/20 text-ivory/70 hover:border-ivory/50 hover:text-ivory transition-all duration-300 group"
            >
              <span>Get in touch</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
