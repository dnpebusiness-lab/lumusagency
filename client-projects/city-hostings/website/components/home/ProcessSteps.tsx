'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { processSteps } from '@/data/services'

const ease = [0.22, 1, 0.36, 1] as const

function Step({
  number,
  title,
  description,
  index,
  isLast,
}: {
  number: string
  title: string
  description: string
  index: number
  isLast: boolean
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      className="relative border-t border-white/15 pt-8 pb-8 lg:pr-10"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease, delay: 0.1 * index }}
    >
      {/* Connecting line (desktop) */}
      {!isLast && (
        <div className="hidden lg:block absolute right-0 top-[2.75rem] w-10 h-px bg-white/15" aria-hidden />
      )}

      <span className="font-serif text-4xl text-stone/40 block mb-6">{number}</span>
      <h3 className="font-serif text-xl text-ivory mb-3">{title}</h3>
      <p className="font-sans text-sm text-ivory/55 leading-relaxed">{description}</p>
    </motion.div>
  )
}

export default function ProcessSteps() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="bg-charcoal section-pad-lg" aria-labelledby="process-heading">
      <div className="container-editorial">
        <div ref={ref} className="mb-16 md:mb-20">
          <motion.p
            className="label-light mb-4"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, ease }}
          >
            How it works
          </motion.p>
          <motion.h2
            id="process-heading"
            className="font-serif text-ivory text-headline"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.75, ease, delay: 0.1 }}
          >
            From first conversation
            <br />
            to ongoing management.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {processSteps.map((step, i) => (
            <Step
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
              index={i}
              isLast={i === processSteps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
