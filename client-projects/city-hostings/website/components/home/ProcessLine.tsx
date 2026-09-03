'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { processSteps } from '@/data/services'
import { ease, duration } from '@/lib/motion/tokens'

type BezierEase = [number, number, number, number]
const pe = ease.primary as BezierEase
const se = ease.secondary as BezierEase

function Stage({
  step,
  index,
}: {
  step: (typeof processSteps)[number]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      style={{ position: 'relative', paddingLeft: '1rem' }}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: duration.slow, ease: pe, delay: index * 0.12 }}
    >
      {/* dot on the vertical line */}
      <motion.div
        aria-hidden
        style={{
          position: 'absolute',
          left: 'calc(-2.375rem)',
          top: '0.4rem',
          width: 7,
          height: 7,
          borderRadius: '50%',
          border: '1px solid',
          transition: `background ${duration.standard}s, border-color ${duration.standard}s`,
        }}
        animate={{
          backgroundColor: inView ? 'var(--color-gold)' : 'transparent',
          borderColor: inView ? 'var(--color-gold)' : 'rgba(185,154,98,0.3)',
        }}
        transition={{ duration: duration.standard, ease: pe, delay: index * 0.12 + 0.3 }}
      />

      <motion.div
        className="font-serif font-normal"
        style={{
          fontSize: '2.5rem',
          lineHeight: 1,
          marginBottom: '0.875rem',
        }}
        animate={{ color: inView ? 'rgba(185,154,98,0.32)' : 'rgba(185,154,98,0.14)' }}
        transition={{ duration: duration.standard, ease: pe, delay: index * 0.12 }}
      >
        {step.number}
      </motion.div>

      <h3
        className="font-serif font-normal text-ivory mb-2"
        style={{ fontSize: '1.1rem' }}
      >
        {step.title}
      </h3>
      <p
        className="font-sans text-stone leading-relaxed"
        style={{ fontSize: '0.865rem', maxWidth: '40ch', opacity: 0.72 }}
      >
        {step.description}
      </p>
    </motion.div>
  )
}

export default function ProcessLine() {
  const lineRef = useRef<HTMLDivElement>(null)
  const lineInView = useInView(lineRef, { once: true, margin: '-80px' })
  const headRef = useRef<HTMLDivElement>(null)
  const headInView = useInView(headRef, { once: true, margin: '-60px' })

  return (
    <section className="bg-charcoal section-pad">
      <div className="container-editorial">

        {/* Header */}
        <div ref={headRef} className="mb-14">
          <motion.p
            className="font-sans font-medium uppercase text-gold mb-4"
            style={{ fontSize: '0.68rem', letterSpacing: '0.14em' }}
            initial={{ opacity: 0 }}
            animate={headInView ? { opacity: 1 } : {}}
            transition={{ duration: duration.standard, ease: pe }}
          >
            How it works
          </motion.p>
          <div style={{ overflow: 'hidden' }}>
            <motion.h2
              className="font-serif font-normal text-ivory"
              style={{ fontSize: 'clamp(2rem,4vw,3.25rem)', lineHeight: 1.1, textWrap: 'balance' }}
              initial={{ y: '108%', opacity: 0 }}
              animate={headInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: duration.slow, ease: pe, delay: 0.15 }}
            >
              From first call<br />to first booking.
            </motion.h2>
          </div>
        </div>

        {/* Body: line + stages */}
        <div style={{ display: 'flex', gap: 0 }}>

          {/* Vertical gold line */}
          <div
            ref={lineRef}
            className="hidden sm:block flex-shrink-0"
            style={{
              width: 1,
              marginRight: '2.5rem',
              backgroundColor: 'rgba(185,154,98,0.12)',
              position: 'relative',
              alignSelf: 'stretch',
            }}
          >
            <motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                background: 'var(--color-gold)',
                transformOrigin: 'top',
              }}
              initial={{ scaleY: 0, height: '100%' }}
              animate={lineInView ? { scaleY: 1 } : { scaleY: 0 }}
              transition={{ duration: 1.4, ease: se, delay: 0.2 }}
            />
          </div>

          {/* Stages */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(2.5rem, 5vw, 4rem)',
              flex: 1,
            }}
          >
            {[...processSteps].map((step, i) => (
              <Stage key={step.number} step={step} index={i} />
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
