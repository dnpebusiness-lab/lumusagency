"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionLabel } from "@/components/SectionLabel";

type Principle = {
  number: string;
  title: string;
  description: string;
};

const PRINCIPLES: Principle[] = [
  {
    number: "01",
    title: "Darkness as Canvas",
    description:
      "Black is the page. It pushes type, image and motion forward without competing with them.",
  },
  {
    number: "02",
    title: "Gold as Signal",
    description:
      "Gold is reserved — for what is active, what matters, what should be read first. Never decoration.",
  },
  {
    number: "03",
    title: "Generous Space",
    description:
      "Margins and white space carry the same weight as content. Confidence is the room to breathe.",
  },
  {
    number: "04",
    title: "Serif for Soul",
    description:
      "Cormorant Garamond gives the work warmth and a literary register. It is the studio’s voice.",
  },
  {
    number: "05",
    title: "Motion with Purpose",
    description:
      "Movement is editorial — it punctuates rather than performs. Power3.out, never linear.",
  },
  {
    number: "06",
    title: "Precision in Detail",
    description:
      "1px hairlines, kerning, tracking, micro-shadows. The sum of small decisions is the brand.",
  },
];

export function DesignPrinciples() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set("[data-dp-head] > *", { opacity: 0, y: 40 });
      gsap.set("[data-dp-card]", { opacity: 0, y: 50 });

      gsap.to("[data-dp-head] > *", {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-dp-head]",
          start: "top 80%",
          once: true,
        },
      });

      gsap.to("[data-dp-card]", {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-dp-grid]",
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
      className="relative bg-black px-6 md:px-10 py-28 md:py-40"
    >
      <div className="mx-auto max-w-[1400px]">
        <div
          data-dp-head
          className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-end"
        >
          <div className="md:col-span-5">
            <SectionLabel>Design Principles</SectionLabel>
          </div>
          <h2 className="md:col-span-7 font-display tracking-tightest leading-[1.02] text-4xl md:text-6xl lg:text-7xl">
            Six rules we keep,
            <br />
            <span className="italic text-gold">project after project</span>.
          </h2>
        </div>

        <div
          data-dp-grid
          className="mt-20 md:mt-28 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--border-gold)]"
        >
          {PRINCIPLES.map((principle) => (
            <article
              key={principle.number}
              data-dp-card
              className="group relative bg-black hover:bg-dark transition-colors duration-500 ease-[cubic-bezier(0.215,0.61,0.355,1)] p-10 md:p-12 flex flex-col gap-8 min-h-[280px]"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-display italic text-gold/80 text-lg">
                  {principle.number}
                </span>
                <span
                  aria-hidden
                  className="h-px w-8 bg-gold/40 transition-all duration-500 group-hover:w-12 group-hover:bg-gold"
                />
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="font-display text-2xl md:text-3xl tracking-tightest leading-[1.05]">
                  {principle.title}
                </h3>
                <p className="font-sans font-light text-white/60 leading-body max-w-sm">
                  {principle.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
