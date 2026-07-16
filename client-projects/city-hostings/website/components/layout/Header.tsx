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

  // Lock body scroll when menu is open
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
            ? 'bg-ivory/95 backdrop-blur-sm border-b border-stone/40 shadow-[0_1px_12px_rgba(36,36,32,0.06)]'
            : 'bg-transparent'
        )}
        role="banner"
      >
        <div className="container-editorial flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0 focus-visible:outline-gold"
            aria-label="City Hosting — Home"
          >
            {/* TODO_CLIENT_INPUT: Replace with actual SVG/PNG logo
                Preserve exact proportions, monogram, arch symbol and gold accent */}
            <div className={cn(
              'flex items-center gap-2 transition-colors duration-500',
              scrolled ? 'text-charcoal' : 'text-ivory'
            )}>
              <div className="w-7 h-7 border flex items-center justify-center border-current opacity-70">
                <span className="font-serif text-xs">CH</span>
              </div>
              <div>
                <p className="font-serif text-base leading-none tracking-wide">
                  City Hosting
                </p>
                <p className="font-sans text-[8px] tracking-[0.2em] uppercase opacity-60 mt-0.5">
                  Guest House
                </p>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center gap-8"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'font-sans text-[11px] tracking-widest uppercase transition-colors duration-300 relative group',
                  scrolled ? 'text-charcoal' : 'text-ivory/90'
                )}
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]" />
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-5">
            <Link
              href={primaryCTA.href}
              className={cn(
                'font-sans text-[11px] tracking-widest uppercase px-6 py-3 border transition-all duration-300',
                scrolled
                  ? 'border-charcoal text-charcoal hover:bg-charcoal hover:text-ivory'
                  : 'border-ivory/60 text-ivory hover:border-ivory hover:bg-ivory/10'
              )}
            >
              {primaryCTA.label}
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className={cn(
              'lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 transition-colors duration-300',
              scrolled ? 'text-charcoal' : 'text-ivory'
            )}
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            <span className="block w-6 h-px bg-current transition-all duration-300" />
            <span className="block w-4 h-px bg-current transition-all duration-300 ml-auto" />
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-2 text-ivory"
        >
          <div className="w-7 h-7 border border-ivory/50 flex items-center justify-center">
            <span className="font-serif text-xs">CH</span>
          </div>
          <span className="font-serif text-base tracking-wide">City Hosting</span>
        </Link>
        <button
          onClick={onClose}
          aria-label="Close navigation menu"
          className="w-10 h-10 flex items-center justify-center text-ivory/70 hover:text-ivory transition-colors"
        >
          <span className="text-2xl leading-none" aria-hidden>×</span>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col justify-center px-8 gap-1" aria-label="Mobile navigation">
        {navLinks.map((link, i) => (
          <motion.div
            key={link.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={link.href}
              onClick={onClose}
              className="block font-serif text-3xl text-ivory/85 hover:text-ivory py-3 border-b border-white/8 transition-colors duration-200"
            >
              {link.label}
            </Link>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="pt-8"
        >
          <Link
            href={primaryCTA.href}
            onClick={onClose}
            className="inline-block font-sans text-xs uppercase tracking-widest px-7 py-4 border border-gold text-gold hover:bg-gold hover:text-graphite transition-all duration-300"
          >
            {primaryCTA.label}
          </Link>
        </motion.div>
      </nav>

      {/* Contact */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="px-8 py-8 border-t border-white/10"
      >
        <p className="label-light mb-3">Get in touch</p>
        <a
          href="tel:+353831723722"
          className="block font-serif text-ivory text-lg mb-1 hover:text-gold transition-colors"
        >
          +353 83 172 3722
        </a>
        <a
          href="mailto:info@cityhostings.com"
          className="font-sans text-xs text-ivory/50 hover:text-ivory/80 transition-colors"
        >
          info@cityhostings.com
        </a>
      </motion.div>
    </motion.div>
  )
}
