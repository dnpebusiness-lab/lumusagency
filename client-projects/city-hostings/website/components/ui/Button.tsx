'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  href?: string
  external?: boolean
  showArrow?: boolean
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-charcoal text-ivory border border-charcoal hover:bg-graphite hover:border-graphite',
  secondary:
    'bg-ivory text-charcoal border border-charcoal hover:bg-stone/30',
  outline:
    'bg-transparent text-ivory border border-ivory/60 hover:border-ivory hover:bg-ivory/8',
  ghost:
    'bg-transparent text-charcoal border border-transparent hover:border-stone underline-offset-4',
  gold:
    'bg-transparent text-gold border border-gold hover:bg-gold hover:text-graphite',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-5 py-2.5 text-xs tracking-widest',
  md: 'px-7 py-3.5 text-xs tracking-widest',
  lg: 'px-9 py-4 text-xs tracking-widest',
}

const base =
  'inline-flex items-center gap-3 font-sans font-medium uppercase tracking-widest transition-all duration-300 cursor-pointer select-none whitespace-nowrap'

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', href, external, showArrow = true, className, children, ...props },
    ref
  ) => {
    const classes = cn(base, variantStyles[variant], sizeStyles[size], className)

    const inner = (
      <>
        <span>{children}</span>
        {showArrow && (
          <span
            className="inline-block transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          >
            →
          </span>
        )}
      </>
    )

    if (href) {
      return (
        <Link
          href={href}
          className={cn(classes, 'group')}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {inner}
        </Link>
      )
    }

    return (
      <button ref={ref} className={cn(classes, 'group')} {...props}>
        {inner}
      </button>
    )
  }
)

Button.displayName = 'Button'
