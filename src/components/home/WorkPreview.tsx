"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SectionLabel } from "@/components/SectionLabel";

type CaseStudy = {
  number: string;
  client: string;
  title: string;
  category: string;
  year: string;
  href: string;
};

const PROJECTS: CaseStudy[] = [
  {
    number: "01",
    client: "Nóra Atelier",
    title: "A quiet confidence in craft",
    category: "Branding · Editorial",
    year: "2025",
    href: "/work#nora-atelier",
  },
  {
    number: "02",
    client: "Kilvara Coffee",
    title: "From bean to broadsheet",
    category: "Web · Motion",
    year: "2025",
    href: "/work#kilvara",
  },
  {
    number: "03",
    client: "Marin Architects",
    title: "Architecture as argument",
    category: "Branding · Web",
    year: "2024",
    href: "/work#marin",
  },
];

export function WorkPreview() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set("[data-work-head] > *", { opacity: 0, y: 40 });
      gsap.set("[data-work-card]", { opacity: 0, y: 60 });

      gsap.to("[data-work-head] > *", {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-work-head]",
          start: "top 80%",
          once: true,
        },
      });

      gsap.to("[data-work-card]", {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-work-grid]",
          start: "top 80%",
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="work"
      className="relative bg-dark px-6 md:px-10 py-28 md:py-40"
    >
      <div className="mx-auto max-w-[1400px]">
        <div
          data-work-head
          className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-end"
        >
          <div className="md:col-span-5">
            <SectionLabel>03 — Selected Work</SectionLabel>
          </div>
          <div className="md:col-span-7 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <h2 className="font-display text-4xl md:text-6xl lg:text-7xl tracking-tightest leading-[1.02]">
              Stories we helped
              <br />
              <span className="italic text-gold">illuminate</span>.
            </h2>
            <Link
              href="/work"
              className="group hidden md:inline-flex items-center gap-3 text-[11px] uppercase tracking-cta-wide text-white hover:text-gold transition-colors duration-500 shrink-0 pb-3"
            >
              <span className="h-px w-8 bg-gold transition-all duration-500 group-hover:w-12" />
              All work
              <ArrowRight
                size={14}
                className="text-gold transition-transform duration-500 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>

        <div
          data-work-grid
          className="mt-20 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-12"
        >
          {PROJECTS.map((project, i) => (
            <CaseCard key={project.number} project={project} offset={i} />
          ))}
        </div>

        <div className="mt-16 md:hidden">
          <Link
            href="/work"
            className="group inline-flex items-center gap-3 text-[11px] uppercase tracking-cta-wide text-white hover:text-gold transition-colors duration-500"
          >
            <span className="h-px w-8 bg-gold" />
            All work
            <ArrowRight size={14} className="text-gold" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CaseCard({ project, offset }: { project: CaseStudy; offset: number }) {
  const shift = offset === 1 ? "md:mt-16" : offset === 2 ? "md:mt-8" : "";
  return (
    <Link
      data-work-card
      href={project.href}
      className={`group block ${shift}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-black border border-[var(--border-gold)] transition-colors duration-700 group-hover:border-gold">
        <CaseVisual number={project.number} offset={offset} />

        <div className="absolute inset-0 flex items-start justify-between p-6 md:p-8 pointer-events-none">
          <span className="text-[10px] uppercase tracking-cta-wide text-white/50">
            Case {project.number}
          </span>
          <ArrowUpRight
            size={18}
            strokeWidth={1.3}
            className="text-gold opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500"
          />
        </div>

        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
        />
      </div>

      <div className="mt-6 flex items-start justify-between gap-6">
        <div>
          <p className="font-sans font-medium text-[10px] uppercase tracking-cta-wide text-gold">
            {project.client}
          </p>
          <h3 className="mt-3 font-display text-2xl md:text-3xl tracking-tightest leading-[1.1] text-white group-hover:text-gold transition-colors duration-500">
            {project.title}
          </h3>
        </div>
        <span className="font-display italic text-gold/70 text-lg shrink-0 pt-1">
          {project.year}
        </span>
      </div>

      <p className="mt-4 text-[10px] uppercase tracking-cta text-white/40">
        {project.category}
      </p>
    </Link>
  );
}

function CaseVisual({ number, offset }: { number: string; offset: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 h-64 w-64 rounded-full bg-gold/[0.08] blur-[90px] transition-all duration-700 group-hover:bg-gold/[0.16]"
      />
      {offset === 0 && (
        <svg
          viewBox="0 0 400 500"
          className="absolute inset-0 h-full w-full opacity-70 transition-transform duration-[1200ms] group-hover:scale-[1.03]"
          fill="none"
          stroke="currentColor"
          aria-hidden
        >
          <circle cx="200" cy="250" r="170" className="text-[var(--border-gold)]" strokeWidth="1" />
          <circle cx="200" cy="250" r="120" className="text-[var(--border-gold)]" strokeWidth="1" />
          <circle cx="200" cy="250" r="70" className="text-gold/70" strokeWidth="1" />
        </svg>
      )}
      {offset === 1 && (
        <svg
          viewBox="0 0 400 500"
          className="absolute inset-0 h-full w-full opacity-80 transition-transform duration-[1200ms] group-hover:scale-[1.03]"
          fill="none"
          stroke="currentColor"
          aria-hidden
        >
          {Array.from({ length: 11 }).map((_, i) => (
            <line
              key={i}
              x1="40"
              x2="360"
              y1={100 + i * 30}
              y2={100 + i * 30}
              className="text-[var(--border-gold)]"
              strokeWidth="1"
            />
          ))}
          <line x1="200" y1="60" x2="200" y2="440" className="text-gold" strokeWidth="1" />
        </svg>
      )}
      {offset === 2 && (
        <svg
          viewBox="0 0 400 500"
          className="absolute inset-0 h-full w-full opacity-80 transition-transform duration-[1200ms] group-hover:scale-[1.03]"
          fill="none"
          stroke="currentColor"
          aria-hidden
        >
          <rect x="80" y="80" width="240" height="340" className="text-[var(--border-gold)]" strokeWidth="1" />
          <rect x="130" y="130" width="140" height="240" className="text-[var(--border-gold)]" strokeWidth="1" />
          <line x1="80" y1="250" x2="320" y2="250" className="text-gold" strokeWidth="1" />
        </svg>
      )}
      <span
        aria-hidden
        className="relative font-display italic text-gold/25 text-[clamp(7rem,18vw,14rem)] leading-none transition-transform duration-[1200ms] group-hover:text-gold/40"
      >
        {number}
      </span>
    </div>
  );
}
