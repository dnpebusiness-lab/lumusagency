"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Workouts", href: "#workouts" },
  { label: "Benefits", href: "#benefits" },
  { label: "Location", href: "#location" },
  { label: "App", href: "#app" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#080808]/95 backdrop-blur-xl border-b border-[rgba(255,107,0,0.15)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-2 cursor-pointer">
          <div className="flex items-center gap-1">
            <span
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "22px", letterSpacing: "0.05em" }}
              className="text-white uppercase tracking-wider"
            >
              HOT
            </span>
            <span
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "22px" }}
              className="text-[#FF6B00] uppercase tracking-wider"
            >
              WORX
            </span>
          </div>
          <span className="hidden sm:block text-[#9A9A9A] text-xs font-medium mt-0.5">
            Galway
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[#9A9A9A] hover:text-white text-sm font-medium transition-colors duration-200 cursor-pointer"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href="tel:0917600007"
            className="flex items-center gap-1.5 text-[#9A9A9A] hover:text-[#FF6B00] text-sm transition-colors duration-200 cursor-pointer"
          >
            <Phone size={14} />
            091 760 007
          </a>
          <a
            href="#book"
            className="bg-[#FF6B00] hover:bg-[#FF8C3A] text-white text-sm font-semibold px-5 py-2.5 rounded-sm transition-colors duration-200 cursor-pointer uppercase tracking-wide"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Book Free Workout
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden text-white p-2 cursor-pointer"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden bg-[#0D0D0D] border-b border-[rgba(255,107,0,0.15)]"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-[#C0C0C0] hover:text-white text-base font-medium py-1 cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="tel:0917600007"
                className="flex items-center gap-2 text-[#FF6B00] font-medium cursor-pointer"
              >
                <Phone size={16} />
                Call 091 760 007
              </a>
              <a
                href="#book"
                onClick={() => setOpen(false)}
                className="bg-[#FF6B00] text-white text-center font-bold py-3 rounded-sm uppercase tracking-wide cursor-pointer"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Book Free Workout
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
