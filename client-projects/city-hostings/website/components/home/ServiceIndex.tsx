'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { services } from '@/data/services'
import { ease, duration } from '@/lib/motion/tokens'

type BezierEase = [number, number, number, number]
const pe = ease.primary as BezierEase

const svcList = [...services] // mutable copy from const

function ServiceDetail({ idx }: { idx: number }) {
  const svc = svcList[idx]
  return (
    <motion.div
      key={idx}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: pe }}
    >
      {/* Visual — architectural grid pattern as placeholder */}
      <div
        className="relative w-full overflow-hidden mb-8"
        style={{ aspectRatio: '4/3' }}
        aria-hidden
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(145deg, hsl(${45 + idx * 12} 18% 14%) 0%, hsl(${40 + idx * 10} 15% 10%) 100%)`,
          }}
        />
        {/* Grid lines as "architectural drawing" */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(185,154,98,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(185,154,98,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Service number as large typographic element */}
        <div
          className="absolute inset-0 flex items-center justify-center font-serif font-normal"
          style={{ fontSize: 'clamp(6rem, 12vw, 10rem)', color: 'rgba(185,154,98,0.07)', lineHeight: 1 }}
        >
          {svc.number}
        </div>
        {/* Bottom rule */}
        <div
          style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '1.5rem',
            right: '1.5rem',
            height: 1,
            background: 'rgba(185,154,98,0.15)',
          }}
        />
      </div>

      <p className="font-sans font-medium uppercase tracking-[0.14em] text-gold mb-3" style={{ fontSize: '0.68rem' }}>
        {svc.number} — {svc.title}
      </p>
      <p className="font-sans leading-relaxed text-taupe mb-5" style={{ fontSize: '0.9rem', maxWidth: '46ch' }}>
        {svc.description}
      </p>
      <div
        className="font-sans font-medium text-gold"
        style={{ fontSize: '0.78rem', letterSpacing: '0.04em', paddingTop: '1.25rem', borderTop: '1px solid var(--color-stone)' }}
      >
        {svc.benefit}
      </div>
    </motion.div>
  )
}

function ServiceRow({
  svc,
  idx,
  active,
  onSelect,
}: {
  svc: (typeof svcList)[number]
  idx: number
  active: boolean
  onSelect: (i: number) => void
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-20px' })

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onSelect(idx)
      }
    },
    [idx, onSelect]
  )

  return (
    <motion.li
      ref={ref}
      role="option"
      aria-selected={active}
      tabIndex={0}
      onClick={() => onSelect(idx)}
      onKeyDown={handleKey}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: duration.slow, ease: pe, delay: idx * 0.04 }}
      style={{
        display: 'grid',
        gridTemplateColumns: '2.5rem 1fr auto',
        gap: '0 1rem',
        alignItems: 'center',
        padding: '1.1rem 0',
        borderBottom: '1px solid var(--color-stone)',
        cursor: 'pointer',
        outline: 'none',
        background: active ? 'rgba(185,154,98,0.04)' : 'transparent',
        transition: `background ${duration.fast}s`,
        position: 'relative',
      }}
    >
      {/* Active indicator — left border */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 2,
          background: active ? 'var(--color-gold)' : 'transparent',
          transition: `background ${duration.fast}s`,
        }}
      />

      <span
        className="font-serif font-normal"
        style={{
          fontSize: '0.82rem',
          color: active ? 'var(--color-gold)' : 'var(--color-taupe)',
          transition: `color ${duration.fast}s`,
        }}
      >
        {svc.number}
      </span>

      <span
        className="font-serif font-normal"
        style={{
          fontSize: '0.98rem',
          color: 'var(--color-charcoal)',
          lineHeight: 1.3,
        }}
      >
        {svc.title}
      </span>

      <span
        aria-hidden
        style={{
          fontSize: '0.85rem',
          color: 'var(--color-taupe)',
          opacity: active ? 1 : 0,
          transform: active ? 'translateX(0)' : 'translateX(-4px)',
          transition: `opacity ${duration.fast}s, transform ${duration.standard}s cubic-bezier(0.22,1,0.36,1)`,
        }}
      >
        →
      </span>
    </motion.li>
  )
}

export default function ServiceIndex() {
  const [active, setActive] = useState(0)
  const headRef = useRef(null)
  const headInView = useInView(headRef, { once: true, margin: '-60px' })

  return (
    <section className="bg-ivory section-pad">
      <div className="container-editorial">

        {/* Header */}
        <div ref={headRef} className="mb-14">
          <motion.p
            className="label mb-4"
            initial={{ opacity: 0 }}
            animate={headInView ? { opacity: 1 } : {}}
            transition={{ duration: duration.standard, ease: pe }}
          >
            What we do
          </motion.p>
          <div style={{ overflow: 'hidden' }}>
            <motion.h2
              className="font-serif font-normal text-charcoal"
              style={{ fontSize: 'clamp(2rem,3.8vw,3.25rem)', lineHeight: 1.1, textWrap: 'balance' }}
              initial={{ y: '108%', opacity: 0 }}
              animate={headInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: duration.slow, ease: pe, delay: 0.15 }}
            >
              A complete service.<br />Nothing outsourced.
            </motion.h2>
          </div>
        </div>

        {/* Index layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'clamp(3rem, 6vw, 6rem)',
            alignItems: 'start',
          }}
          className="max-md:block"
        >
          {/* Left: numbered list */}
          <ul
            role="listbox"
            aria-label="Services"
            style={{ borderTop: '1px solid var(--color-stone)' }}
          >
            {svcList.map((svc, idx) => (
              <ServiceRow
                key={svc.id}
                svc={svc}
                idx={idx}
                active={active === idx}
                onSelect={setActive}
              />
            ))}
          </ul>

          {/* Right: sticky detail panel */}
          <div className="hidden md:block" style={{ position: 'sticky', top: '7rem' }}>
            <AnimatePresence mode="wait" initial={false}>
              <ServiceDetail key={active} idx={active} />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
