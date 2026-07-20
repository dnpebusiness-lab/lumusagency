export const ease = {
  primary: [0.22, 1, 0.36, 1] as const,
  secondary: [0.16, 1, 0.3, 1] as const,
  fast: [0.4, 0, 0.2, 1] as const,
} as const

export const duration = {
  fast: 0.28,
  standard: 0.55,
  slow: 0.9,
  cinematic: 1.25,
} as const

export const distance = {
  micro: 4,
  standard: 18,
  editorial: 36,
} as const

export const variants = {
  lineReveal: {
    hidden: { y: '108%', opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: duration.slow, ease: ease.primary },
    },
  },
  fadeUp: {
    hidden: { opacity: 0, y: distance.standard },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: duration.slow, ease: ease.primary },
    },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: duration.standard, ease: ease.primary },
    },
  },
  archDraw: {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: duration.cinematic, ease: ease.secondary, delay: 0.6 },
    },
  },
  imageSettle: {
    hidden: { scale: 1.035, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: duration.cinematic, ease: ease.primary },
    },
  },
  stagger: (staggerChildren = 0.15, delayChildren = 0) => ({
    visible: { transition: { staggerChildren, delayChildren } },
    hidden: {},
  }),
} as const
