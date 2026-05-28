"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CaseGlyph } from "./CaseGlyph";
import { cn } from "@/lib/cn";

type Discipline = "Branding" | "Web" | "Social" | "Motion";

type Project = {
  number: string;
  client: string;
  title: string;
  blurb: string;
  year: string;
  disciplines: Discipline[];
  href: string;
  glyph: number;
};

const PROJECTS: Project[] = [
  {
    number: "01",
    client: "Nóra Atelier",
    title: "A quiet confidence in craft",
    blurb:
      "Editorial identity, type system and launch site for a third-generation Galway atelier reimagining heritage textiles.",
    year: "2025",
    disciplines: ["Branding", "Web"],
    href: "#nora-atelier",
    glyph: 0,
  },
  {
    number: "02",
    client: "Kilvara Coffee",
    title: "From bean to broadsheet",
    blurb:
      "A full-stack rebrand and editorial site for a specialty roastery — featuring a serial publication that ships with every bag.",
    year: "2025",
    disciplines: ["Branding", "Web", "Motion"],
    href: "#kilvara",
    glyph: 1,
  },
  {
    number: "03",
    client: "Marin Architects",
    title: "Architecture as argument",
    blurb:
      "Identity, monograph layout and a measured social presence for an Atlantic-coast architecture practice with a literary streak.",
    year: "2024",
    disciplines: ["Branding", "Web", "Social"],
    href: "#marin",
    glyph: 2,
  },
];

const FILTERS: ("All" | Discipline)[] = [
  "All",
  "Branding",
  "Web",
  "Social",
  "Motion",
];

export function WorkGrid() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState<(typeof FILTERS)[number]>("All");

  const filtered = useMemo(() => {
    if (active === "All") return PROJECTS;
    return PROJECTS.filter((p) => p.disciplines.includes(active));
  }, [active]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set("[data-wg-filter]", { opacity: 0, y: 20 });
      gsap.set("[data-wg-card]", { opacity: 0, y: 60 });

      gsap.to("[data-wg-filter]", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.06,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-wg-filters]", start: "top 85%", once: true },
      });

      gsap.to("[data-wg-card]", {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-wg-grid]", start: "top 80%", once: true },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative bg-dark px-6 md:px-10 py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1400px]">
        <div
          data-wg-filters
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-y border-[var(--border-gold)] py-6"
        >
          <p className="text-eyebrow">Filter</p>
          <ul className="flex flex-wrap items-center gap-2">
            {FILTERS.map((filter) => {
              const isActive = active === filter;
              return (
                <li key={filter} data-wg-filter>
                  <button
                    type="button"
                    onClick={() => setActive(filter)}
                    aria-pressed={isActive}
                    className={cn(
                      "px-4 h-9 inline-flex items-center text-[10px] uppercase tracking-cta-wide border transition-colors duration-500",
                      isActive
                        ? "bg-gold text-black border-gold"
                        : "bg-transparent text-white/70 border-[var(--border-gold)] hover:text-gold hover:border-gold",
                    )}
                  >
                    {filter}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="text-[10px] uppercase tracking-cta text-white/40">
            {filtered.length} {filtered.length === 1 ? "project" : "projects"}
          </p>
        </div>

        <div
          data-wg-grid
          className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-x-10 md:gap-y-24"
        >
          {filtered.map((project, i) => (
            <ProjectCard key={project.number} project={project} offset={i} />
          ))}

          {filtered.length === 0 && (
            <p className="md:col-span-2 py-16 text-center text-white/50 font-display italic text-2xl">
              Nothing in this discipline yet — check back soon.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, offset }: { project: Project; offset: number }) {
  const shift = offset % 2 === 1 ? "md:mt-16" : "";
  return (
    <Link
      data-wg-card
      data-cursor="view"
      href={project.href}
      className={cn("group block", shift)}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-black border border-[var(--border-gold)] transition-colors duration-700 group-hover:border-gold">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-10 -right-10 h-72 w-72 rounded-full bg-gold/[0.08] blur-[100px] transition-all duration-700 group-hover:bg-gold/[0.16]"
        />
        <CaseGlyph
          variant={project.glyph}
          className="absolute inset-0 h-full w-full opacity-70 transition-transform duration-[1200ms] group-hover:scale-[1.03]"
        />
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center font-display italic text-gold/25 text-[clamp(7rem,16vw,13rem)] leading-none transition-colors duration-700 group-hover:text-gold/40"
        >
          {project.number}
        </span>

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

        <div
          aria-hidden
          className="absolute inset-0 bg-gold/[0.10] origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-700 ease-[cubic-bezier(0.215,0.61,0.355,1)]"
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

      <p className="mt-4 font-sans font-light text-white/60 leading-body max-w-md">
        {project.blurb}
      </p>

      <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-[10px] uppercase tracking-cta text-white/40">
        {project.disciplines.map((d, i) => (
          <li key={d} className="flex items-center gap-4">
            {i > 0 && <span aria-hidden className="h-px w-3 bg-gold/40" />}
            <span>{d}</span>
          </li>
        ))}
      </ul>
    </Link>
  );
}
