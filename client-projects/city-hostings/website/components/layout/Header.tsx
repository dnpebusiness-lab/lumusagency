'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { navLinks, primaryCTA } from '@/data/navigation'
import { cn } from '@/lib/utils'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-ivory/97 backdrop-blur-sm border-b border-stone/30'
            : 'bg-transparent'
        )}
        role="banner"
      >
        <div className="container-editorial flex items-center justify-between h-16 md:h-[4.5rem]">

          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-4"
            aria-label="City Hosting — Home"
          >
            <div className={cn(
              'flex items-center gap-3 transition-colors duration-500',
              scrolled ? 'text-charcoal' : 'text-ivory'
            )}>
              {/* Monogram */}
              <span
                className="font-serif text-sm tracking-widest"
                style={{
                  borderBottom: '1px solid currentColor',
                  paddingBottom: '1px',
                  lineHeight: 1,
                  opacity: scrolled ? 0.7 : 0.55,
                }}
                aria-hidden
              >
                CH
              </span>
              <span className="font-serif text-[1rem] tracking-wide leading-none">
                City Hosting
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center gap-9"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-sans text-[0.65rem] tracking-[0.13em] uppercase transition-colors duration-300 relative group',
                  scrolled ? 'text-charcoal/70 hover:text-charcoal' : 'text-ivory/70 hover:text-ivory'
                )}
              >
                {link.label}
                <span className={cn(
                  'absolute -bottom-0.5 left-0 w-0 h-px group-hover:w-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  scrolled ? 'bg-charcoal' : 'bg-ivory/60'
                )} />
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:block">
            <Link
              href={primaryCTA.href}
              className={cn(
                'font-sans text-[0.65rem] tracking-[0.13em] uppercase px-5 py-2.5 border transition-all duration-300',
                scrolled
                  ? 'border-charcoal/50 text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-ivory'
                  : 'border-ivory/35 text-ivory/85 hover:border-ivory/70 hover:text-ivory'
              )}
            >
              {primaryCTA.label}
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className={cn(
              'lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] transition-colors duration-300',
              scrolled ? 'text-charcoal' : 'text-ivory'
            )}
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            <span className="block w-5 h-px bg-current transition-all duration-300" />
            <span className="block w-3 h-px bg-current transition-all duration-300 self-start" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <MobileNav onClose={() => setMenuOpen(false)} />
        )}
      </AnimatePresence>
    </>
  )
}

function MobileNav({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      id="mobile-nav"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      className="fixed inset-0 z-[60] bg-graphite flex flex-col"
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0% 0)' }}
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 text-ivory"
        >
          <span className="font-serif text-xs tracking-widest text-ivory/50" style={{ borderBottom: '1px solid currentColor', paddingBottom: '1px', lineHeight: 1 }} aria-hidden>CH</span>
          <span className="font-serif text-base tracking-wide">City Hosting</span>
        </Link>
        <button
          onClick={onClose}
          aria-label="Close navigation menu"
          className="w-10 h-10 flex items-center justify-center text-ivory/50 hover:text-ivory transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <line x1="1" y1="1" x2="17" y2="17" stroke="currentColor" strokeWidth="1.2" />
            <line x1="17" y1="1" x2="1" y2="17" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col justify-center px-8" aria-label="Mobile navigation">
        {navLinks.map((link, i) => (
          <motion.div
            key={link.href}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={link.href}
              onClick={onClose}
              className="block font-serif text-[2rem] text-ivory/75 hover:text-ivory py-4 border-b border-white/8 transition-colors duration-200"
            >
              {link.label}
            </Link>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="pt-9"
        >
          <Link
            href={primaryCTA.href}
            onClick={onClose}
            className="inline-block font-sans text-[0.65rem] uppercase tracking-[0.13em] px-6 py-3.5 border border-gold/60 text-gold hover:bg-gold hover:text-graphite transition-all duration-300"
          >
            {primaryCTA.label}
          </Link>
        </motion.div>
      </nav>

      {/* Contact footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="px-8 py-8 border-t border-white/8"
      >
        <p className="label-light mb-3">Get in touch</p>
        <a
          href="tel:+353831723722"
          className="block font-serif text-ivory text-lg mb-1.5 hover:text-gold transition-colors"
        >
          +353 83 172 3722
        </a>
        <a
          href="mailto:info@cityhostings.com"
          className="font-sans text-xs text-ivory/40 hover:text-ivory/65 transition-colors"
        >
          info@cityhostings.com
        </a>
      </motion.div>
    </motion.div>
  )
}
