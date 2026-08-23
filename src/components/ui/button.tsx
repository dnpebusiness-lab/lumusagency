import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-copper-600 text-white hover:bg-copper-700 dark:bg-copper-500 dark:hover:bg-copper-400 dark:text-ink-950',
        secondary:
          'bg-ink-100 text-ink-900 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-50 dark:hover:bg-ink-700',
        outline:
          'border border-ink-300 bg-transparent hover:bg-ink-100 dark:border-ink-700 dark:hover:bg-ink-800',
        ghost: 'bg-transparent hover:bg-ink-100 dark:hover:bg-ink-800',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-11 px-6',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

export { buttonVariants }
