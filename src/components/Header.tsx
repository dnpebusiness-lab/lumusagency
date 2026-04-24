"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { label: "The Agency", href: "/agency" },
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-colors duration-500 ease-[cubic-bezier(0.215,0.61,0.355,1)]",
        scrolled || menuOpen
          ? "bg-black/85 backdrop-blur-md border-b border-[var(--border-gold)]"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 h-20 flex items-center justify-between">
        <Link
          href="/"
          aria-label="Lumus Agency — home"
          className="group inline-flex items-baseline gap-[2px]"
        >
          <span className="font-sans font-medium tracking-cta-wide text-sm text-white uppercase">
            Lumus
          </span>
          <span className="text-gold text-sm leading-none translate-y-[1px]">
            •
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative font-sans font-medium text-[11px] uppercase tracking-cta transition-colors duration-300",
                  active ? "text-gold" : "text-white/70 hover:text-white",
                )}
              >
                {link.label}
                <span
                  aria-hidden
                  className={cn(
                    "absolute -bottom-1 left-0 h-px bg-gold transition-all duration-500 ease-[cubic-bezier(0.215,0.61,0.355,1)]",
                    active ? "w-full" : "w-0 group-hover:w-full",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Button href="/contact" variant="outline" size="md">
            Start a Project
          </Button>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="lg:hidden inline-flex items-center justify-center h-10 w-10 text-white hover:text-gold transition-colors"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        className={cn(
          "lg:hidden overflow-hidden transition-[max-height] duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] bg-black/95 backdrop-blur-md",
          menuOpen ? "max-h-[90vh]" : "max-h-0",
        )}
      >
        <div className="px-6 py-10 flex flex-col gap-6 border-t border-[var(--border-gold)]">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-display text-3xl transition-colors duration-300",
                  active ? "text-gold" : "text-white hover:text-gold",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-4">
            <Button href="/contact" variant="filled" size="lg">
              Start a Project
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
