'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { company } from '@/data/company'

type BezierEase = [number, number, number, number]
const ease: BezierEase = [0.22, 1, 0.36, 1]

export default function OwnerCTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      className="bg-graphite overflow-hidden"
      aria-labelledby="owner-cta-heading"
    >
      <div className="h-px w-full bg-white/8" aria-hidden />

      <div ref={ref} className="container-editorial py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-16 lg:gap-24 items-start">

          {/* Left: heading */}
          <div>
            <motion.p
              className="label-light mb-6"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, ease }}
            >
              For property owners
            </motion.p>

            <div style={{ overflow: 'hidden' }} className="mb-8">
              <motion.h2
                id="owner-cta-heading"
                className="font-serif font-normal text-ivory"
                style={{
                  fontSize: 'clamp(1.875rem, 3.2vw, 3.125rem)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                  textWrap: 'balance',
                } as React.CSSProperties}
                initial={{ y: '106%' }}
                animate={inView ? { y: 0 } : {}}
                transition={{ duration: 0.85, ease, delay: 0.1 }}
              >
                Holiday let management
                <br />
                in Galway. Talk to us
                <br />
                about your property.
              </motion.h2>
            </div>

            <motion.p
              className="font-sans text-sm text-ivory/50 leading-relaxed max-w-md mb-10"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.7, ease, delay: 0.3 }}
            >
              We assess each property individually. Tell us where your property
              is and what you're currently doing with it — we'll take it from there.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, ease, delay: 0.45 }}
            >
              <Link
                href="/property-owners#enquiry"
                className="inline-flex items-center gap-3 font-sans text-[0.65rem] uppercase tracking-[0.13em] px-6 py-3.5 border border-gold/60 text-gold hover:bg-gold hover:text-graphite transition-all duration-300 group"
              >
                <span>Enquire about management</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
              </Link>
            </motion.div>
          </div>

          {/* Right: contact details as primary action */}
          <motion.div
            className="lg:pt-[5.5rem]"
            style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 'clamp(1.5rem, 3vw, 3rem)' }}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, ease, delay: 0.5 }}
          >
            <p className="font-sans text-[0.62rem] uppercase tracking-[0.14em] text-ivory/30 mb-5">
              Get in touch directly
            </p>

            <address className="not-italic">
              <div className="mb-6">
                <a
                  href={company.contact.phoneHref}
                  className="font-serif text-ivory/85 hover:text-gold transition-colors duration-300 block leading-tight"
                  style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)' }}
                >
                  {company.contact.phoneInternational}
                </a>
                <span className="font-sans text-[0.62rem] text-ivory/30 tracking-wide mt-1 block">
                  Phone &amp; WhatsApp
                </span>
              </div>

              <div className="pt-5 border-t border-white/8">
                <a
                  href={company.contact.emailHref}
                  className="font-sans text-sm text-ivory/50 hover:text-ivory/80 transition-colors duration-200"
                >
                  {company.contact.email}
                </a>
              </div>
            </address>
          </motion.div>

        </div>
      </div>

      <div className="h-px w-full bg-white/8" aria-hidden />
    </section>
  )
}
