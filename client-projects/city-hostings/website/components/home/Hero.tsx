'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { primaryCTA, secondaryCTA } from '@/data/navigation'

const ease = [0.22, 1, 0.36, 1] as const

export default function Hero() {
  return (
    <section
      className="relative min-h-[100svh] flex items-end pb-16 md:pb-24 overflow-hidden"
      aria-label="City Hosting — professional holiday let management in Galway"
    >
      {/* Background — TODO_CLIENT_INPUT: Replace with cinematic property/Galway coastal image */}
      <motion.div
        className="absolute inset-0 img-placeholder"
        initial={{ scale: 1.04 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-graphite/92 via-graphite/40 to-graphite/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-graphite/60 to-transparent" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 container-editorial w-full">
        <div className="max-w-3xl">

          {/* Label */}
          <motion.p
            className="label-light mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.2 }}
          >
            Based in Galway &nbsp;·&nbsp; Managing exceptional stays across the West
          </motion.p>

          {/* Headline */}
          <div className="overflow-hidden mb-6">
            <motion.h1
              className="font-serif font-normal text-ivory text-hero"
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.35 }}
            >
              Exceptional stays.
              <br />
              <em className="not-italic text-ivory/75">Expertly managed.</em>
            </motion.h1>
          </div>

          {/* Body */}
          <motion.p
            className="font-sans text-base md:text-lg text-ivory/70 leading-relaxed max-w-xl mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease, delay: 0.6 }}
          >
            City Hosting provides professional holiday-let and short-term rental management
            across Galway and the West of Ireland — helping property owners host with
            confidence while offering guests an exceptional direct-booking experience.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.75 }}
          >
            <Link
              href={primaryCTA.href}
              className="inline-flex items-center gap-3 font-sans text-xs uppercase tracking-widest px-7 py-4 bg-ivory text-charcoal hover:bg-stone transition-colors duration-300 group"
            >
              <span>{primaryCTA.label}</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
            </Link>
            <Link
              href={secondaryCTA.href}
              className="inline-flex items-center gap-3 font-sans text-xs uppercase tracking-widest px-7 py-4 border border-ivory/50 text-ivory hover:border-ivory hover:bg-ivory/8 transition-all duration-300 group"
            >
              <span>{secondaryCTA.label}</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-0 right-0 hidden lg:flex flex-col items-center gap-3 pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          aria-hidden
        >
          <span className="label-light text-[9px] rotate-90 origin-center tracking-[0.22em] mb-4">
            Scroll
          </span>
          <div className="w-px h-16 bg-ivory/20 relative overflow-hidden">
            <motion.div
              className="absolute inset-x-0 top-0 h-1/2 bg-gold"
              animate={{ y: ['0%', '200%'] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
