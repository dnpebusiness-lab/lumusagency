'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { ease, duration } from '@/lib/motion/tokens'

type BezierEase = [number, number, number, number]
const pe = ease.primary as BezierEase

function Panel({
  side,
  label,
  heading,
  body,
  href,
  linkText,
  gradientFrom,
  gradientTo,
  hovered,
  onHover,
}: {
  side: 'owner' | 'guest'
  label: string
  heading: React.ReactNode
  body: string
  href: string
  linkText: string
  gradientFrom: string
  gradientTo: string
  hovered: 'owner' | 'guest' | null
  onHover: (v: 'owner' | 'guest' | null) => void
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const flexGrow = hovered === side ? 1.2 : hovered !== null ? 0.85 : 1
  const isActive = hovered === side

  return (
    <div
      ref={ref}
      style={{
        flexGrow,
        transition: `flex-grow 0.9s cubic-bezier(0.22,1,0.36,1)`,
        minHeight: 'clamp(480px, 60vh, 640px)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
      }}
      onMouseEnter={() => onHover(side)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(side)}
      onBlur={() => onHover(null)}
      tabIndex={0}
      role="region"
      aria-label={label}
    >
      {/* Background */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(158deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
        }}
        initial={{ scale: 1.035 }}
        animate={inView ? { scale: isActive ? 1.02 : 1 } : { scale: 1.035 }}
        transition={{ duration: duration.cinematic, ease: pe }}
      />

      {/* Gradient overlay — lifts on hover */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(14,13,10,0.94) 0%, rgba(14,13,10,0.2) 55%, transparent 100%)',
        }}
        animate={{ opacity: isActive ? 0.85 : 1 }}
        transition={{ duration: duration.standard, ease: pe }}
      />

      {/* Panel divider: thin gold line on right edge of landlord panel */}
      {side === 'owner' && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: 1,
            background: 'linear-gradient(to bottom, transparent, rgba(185,154,98,0.2), transparent)',
            zIndex: 2,
          }}
        />
      )}

      {/* Content — pinned to bottom */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 'clamp(1.75rem, 4vw, 3rem)',
        }}
      >
        <motion.p
          className="font-sans font-medium uppercase tracking-[0.14em] text-gold mb-3"
          style={{ fontSize: '0.68rem' }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: duration.standard, ease: pe, delay: 0.2 }}
        >
          {label}
        </motion.p>

        <motion.h2
          className="font-serif font-normal text-ivory leading-[1.1] mb-3"
          style={{
            fontSize: 'clamp(1.75rem, 2.8vw, 2.5rem)',
            textWrap: 'balance',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: isActive ? -3 : 0 } : {}}
          transition={{ duration: duration.slow, ease: pe, delay: 0.35 }}
        >
          {heading}
        </motion.h2>

        <motion.p
          className="font-sans text-stone leading-relaxed mb-6"
          style={{ fontSize: '0.875rem', maxWidth: '36ch', opacity: isActive ? 0.9 : 0.78 }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: isActive ? 0.9 : 0.78 } : {}}
          transition={{ duration: duration.slow, ease: pe, delay: 0.5 }}
        >
          {body}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: duration.standard, ease: pe, delay: 0.65 }}
        >
          <Link
            href={href}
            className="inline-flex items-center gap-2 font-sans font-medium uppercase text-ivory group"
            style={{
              fontSize: '0.72rem',
              letterSpacing: '0.1em',
              borderBottom: '1px solid rgba(244,240,232,0.22)',
              paddingBottom: '0.2rem',
              transition: `border-color ${duration.standard}s cubic-bezier(0.22,1,0.36,1), gap ${duration.standard}s cubic-bezier(0.22,1,0.36,1)`,
            }}
          >
            <span>{linkText}</span>
            <span
              aria-hidden
              style={{ transition: `transform ${duration.fast}s cubic-bezier(0.22,1,0.36,1)` }}
              className="group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default function OwnerGuestSplit() {
  const [hovered, setHovered] = useState<'owner' | 'guest' | null>(null)

  return (
    <div
      className="flex flex-col lg:flex-row"
      aria-label="Choose your path"
    >
      <Panel
        side="owner"
        label="For Property Owners"
        heading={<>Let us manage it.<br />You just collect.</>}
        body="From onboarding your property to managing every guest interaction — we handle the operational complexity of short-term letting so you don't have to think about it."
        href="/property-owners"
        linkText="Explore property management"
        gradientFrom="#252318"
        gradientTo="#1A1714"
        hovered={hovered}
        onHover={setHovered}
      />
      <Panel
        side="guest"
        label="For Guests"
        heading={<>Book directly<br />with us.</>}
        body="When you book with City Hosting, you're speaking to the team that manages the property — not a platform. Real people, real local knowledge."
        href="/book-direct"
        linkText="Browse our properties"
        gradientFrom="#2B2822"
        gradientTo="#1F1C16"
        hovered={hovered}
        onHover={setHovered}
      />
    </div>
  )
}
