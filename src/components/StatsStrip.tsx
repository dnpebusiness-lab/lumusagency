"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const STATS = [
  { value: "04", label: "Disciplines" },
  { value: "03", label: "Cases" },
  { value: "01", label: "Studio" },
  { value: "2025", label: "Founded" },
];

export function StatsStrip() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.set("[data-stat]", { opacity: 0, y: 28 });
      gsap.to("[data-stat]", {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="bg-dark border-y border-[var(--border-gold)]">
      <div className="mx-auto max-w-[1400px] grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--border-gold)]">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            data-stat
            className="py-10 px-8 md:px-12 flex flex-col"
          >
            <span className="font-display italic text-gold text-[clamp(2.5rem,5vw,4.5rem)] leading-none tracking-tightest">
              {stat.value}
            </span>
            <span className="mt-3 text-[10px] uppercase tracking-cta-wide text-white/50">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
