"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";

const links = [
  { label: "Why", href: "#why" },
  { label: "How", href: "#how" },
  { label: "Classes", href: "#workouts" },
  { label: "The heat", href: "#benefits" },
  { label: "Where", href: "#location" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-ink/85 backdrop-blur-xl border-b border-line"
          : "border-b border-transparent"
      }`}
    >
      <div className="max-w-[1180px] mx-auto px-7 sm:px-14 h-16 flex items-center justify-between">
        <a href="#" className="font-display font-extrabold text-[22px] tracking-tight cursor-pointer">
          HOT<span className="text-ember">WORX</span>
          <span className="text-ash text-[12px] font-body font-normal ml-2 align-middle">
            Galway
          </span>
        </a>

        <div className="hidden lg:flex items-center gap-9">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-ash hover:text-paper text-[13px] tracking-wide transition-colors duration-200 cursor-pointer"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <a
            href="tel:0917600007"
            className="flex items-center gap-1.5 text-ash hover:text-ember text-[13px] transition-colors duration-200 cursor-pointer"
          >
            <Phone size={13} /> 091 760 007
          </a>
          <a
            href="#book"
            className="btn-heat bg-ember text-[#1a0600] hover:bg-burnt text-[13px] font-medium tracking-wide px-5 py-2.5 transition-colors duration-300 cursor-pointer"
          >
            First session free
          </a>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden text-paper p-2 cursor-pointer"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden bg-ink-2 border-b border-line"
          >
            <div className="px-7 py-5 flex flex-col gap-4">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-paper/80 hover:text-paper text-base cursor-pointer"
                >
                  {l.label}
                </a>
              ))}
              <a href="tel:0917600007" className="flex items-center gap-2 text-ember cursor-pointer">
                <Phone size={15} /> 091 760 007
              </a>
              <a
                href="#book"
                onClick={() => setOpen(false)}
                className="bg-ember text-[#1a0600] text-center font-medium py-3 cursor-pointer"
              >
                Book free workout
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
