'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { primaryCTA, secondaryCTA } from '@/data/navigation'
import { ease, duration, distance } from '@/lib/motion/tokens'

// CSS grain as inline SVG data URI
const GRAIN_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`

// Arch path for 380×534 viewport (3:4.2 ratio)
// right-bottom → up right → arch top → down left → left-bottom
const ARCH_PATH = 'M 380 534 L 380 91 A 190 91 0 0 0 0 91 L 0 534'

type BezierEase = [number, number, number, number]

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })

  const pe = ease.primary as BezierEase
  const se = ease.secondary as BezierEase

  useEffect(() => {
    if (typeof window === 'undefined') return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isCoarse = window.matchMedia('(pointer: coarse)').matches
    if (prefersReduced || isCoarse || window.innerWidth < 900) return

    const hero = heroRef.current
    if (!hero) return

    const handleMove = (e: MouseEvent) => {
      const r = hero.getBoundingClientRect()
      const nx = ((e.clientX - r.left) / r.width - 0.5) * 2
      const ny = ((e.clientY - r.top) / r.height - 0.5) * 2
      setParallax({ x: nx * 4, y: ny * 4 })
    }

    hero.addEventListener('mousemove', handleMove)
    return () => hero.removeEventListener('mousemove', handleMove)
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100svh] flex items-center overflow-hidden"
      style={{
        backgroundColor: '#1A1916',
        backgroundImage: GRAIN_BG,
        backgroundSize: '200px 200px',
      }}
      aria-label="City Hosting — professional holiday let management in Galway"
    >
      <div className="relative z-10 container-editorial w-full">
        {/* Two-column layout: text left, arch right */}
        <div className="flex flex-row items-center gap-12 xl:gap-20 py-28 md:py-36">

          {/* ── Left: text ─────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Eyebrow */}
            <motion.p
              className="label-light mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: duration.standard, ease: pe, delay: 0.15 }}
            >
              Based in Galway &nbsp;·&nbsp; Managing exceptional stays across the West
            </motion.p>

            {/* Headline — each line has its own overflow-hidden mask */}
            <h1 className="font-serif font-normal text-ivory text-hero mb-6">
              <div style={{ overflow: 'hidden' }}>
                <motion.span
                  className="block"
                  initial={{ y: '108%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: duration.slow, ease: pe, delay: 0.25 }}
                >
                  The art of
                </motion.span>
              </div>

              <div style={{ overflow: 'hidden' }}>
                <motion.span
                  className="block"
                  initial={{ y: '108%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: duration.slow, ease: pe, delay: 0.42 }}
                >
                  <em className="not-italic" style={{ color: 'var(--color-gold)' }}>
                    arrival.
                  </em>
                </motion.span>
              </div>

              <div style={{ overflow: 'hidden' }}>
                <motion.span
                  className="block"
                  style={{ color: 'rgba(244,240,232,0.6)' }}
                  initial={{ y: '108%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: duration.slow, ease: pe, delay: 0.58 }}
                >
                  Expertly managed.
                </motion.span>
              </div>
            </h1>

            {/* Subtitle */}
            <motion.p
              className="font-sans text-base md:text-lg leading-relaxed max-w-xl mb-10"
              style={{ color: 'rgba(244,240,232,0.58)' }}
              initial={{ opacity: 0, y: distance.standard }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: duration.slow, ease: pe, delay: 0.8 }}
            >
              City Hosting provides professional holiday-let and short-term rental management
              across Galway and the West of Ireland — helping property owners host with
              confidence while offering guests an exceptional direct-booking experience.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: duration.standard, ease: pe, delay: 0.95 }}
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
                className="inline-flex items-center gap-3 font-sans text-xs uppercase tracking-widest px-7 py-4 border text-ivory transition-all duration-300 group"
                style={{ borderColor: 'rgba(244,240,232,0.35)' }}
              >
                <span>{secondaryCTA.label}</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
              </Link>
            </motion.div>
          </div>

          {/* ── Right: Arch-framed image — desktop only ── */}
          <div
            className="hidden lg:block flex-shrink-0"
            style={{ width: 'clamp(280px, 25vw, 380px)' }}
          >
            <div
              style={{
                position: 'relative',
                paddingBottom: '140%', // 3:4.2 ratio
                transform: `translate(${parallax.x}px, ${parallax.y}px)`,
                transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              {/* Arch-clipped image area */}
              <motion.div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50% 50% 0 0 / 17% 17% 0 0',
                  overflow: 'hidden',
                }}
                initial={{ scale: 1.035, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: duration.cinematic, ease: pe, delay: 0.1 }}
              >
                {/* TODO_CLIENT_INPUT: Replace with real property image */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(160deg, #2E2A24 0%, #221F1B 55%, #2A261F 100%)',
                  }}
                />
                {/* Radial vignette */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'radial-gradient(ellipse at 50% 30%, transparent 35%, rgba(26,25,22,0.55) 100%)',
                  }}
                />
                {/* Bottom fade */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(to top, rgba(26,25,22,0.65) 0%, transparent 50%)',
                  }}
                />
              </motion.div>

              {/* Gold arch stroke SVG — drawn on top, outside overflow:hidden */}
              <svg
                viewBox="0 0 380 534"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  overflow: 'visible',
                }}
                aria-hidden
              >
                <motion.path
                  d={ARCH_PATH}
                  fill="none"
                  stroke="#B99A62"
                  strokeWidth="1.5"
                  strokeLinecap="butt"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: duration.cinematic, ease: se, delay: 0.6 }}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator — bottom right corner */}
      <motion.div
        className="absolute bottom-8 right-12 hidden lg:flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: duration.standard, ease: pe, delay: 1.3 }}
        aria-hidden
      >
        <span
          className="font-sans font-medium uppercase tracking-[0.22em] rotate-90 origin-center mb-4"
          style={{ fontSize: '0.5625rem', color: 'rgba(212,200,176,0.4)' }}
        >
          Scroll
        </span>
        <div
          className="relative overflow-hidden"
          style={{ width: 1, height: 64, backgroundColor: 'rgba(244,240,232,0.15)' }}
        >
          <motion.div
            style={{
              position: 'absolute',
              inset: '0 0 auto 0',
              height: '50%',
              backgroundColor: 'var(--color-gold)',
            }}
            animate={{ y: ['0%', '200%'] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  )
}
