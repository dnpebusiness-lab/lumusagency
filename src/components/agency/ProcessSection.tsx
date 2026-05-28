"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionLabel } from "@/components/SectionLabel";

const STEPS = [
  {
    number: "01",
    title: "Discover",
    description:
      "We begin by listening — to the brand, its history, its audience, its competitors. Research and conversation precede every mark.",
  },
  {
    number: "02",
    title: "Define",
    description:
      "Strategy before aesthetics. We articulate the editorial position: voice, whitespace, and the tension that makes the brand distinct.",
  },
  {
    number: "03",
    title: "Craft",
    description:
      "Typography, colour, motion, copy. Each element earns its place. Nothing is decoration — everything is argument.",
  },
  {
    number: "04",
    title: "Launch",
    description:
      "We hand over a living system, not a static file. Guidelines, assets, training — so the brand holds its shape in every hand that touches it.",
  },
];

export function ProcessSection() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.set("[data-ps-heading]", { opacity: 0, y: 20 });
      gsap.set("[data-ps-step]", { opacity: 0, x: -28 });

      gsap.to("[data-ps-heading]", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });

      gsap.to("[data-ps-step]", {
        opacity: 1,
        x: 0,
        duration: 0.9,
        stagger: 0.14,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 75%", once: true },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative bg-black px-6 md:px-10 py-20 md:py-28">
      <div className="mx-auto max-w-[1400px]">
        <div data-ps-heading>
          <SectionLabel>The Method</SectionLabel>
          <h2 className="mt-10 font-display text-[clamp(2rem,5vw,4rem)] tracking-tightest leading-[1.05] max-w-xl">
            Four steps.{" "}
            <span className="italic text-gold">One obsession.</span>
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border-gold)]">
          {STEPS.map((step) => (
            <div
              key={step.number}
              data-ps-step
              className="group relative bg-black px-8 py-10 flex flex-col gap-6 overflow-hidden transition-colors duration-500 hover:bg-dark"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-0 right-0 font-display italic text-gold/[0.06] text-[7rem] leading-none select-none translate-x-3 translate-y-4"
              >
                {step.number}
              </span>

              <span className="font-display italic text-gold/70 text-3xl leading-none">
                {step.number}
              </span>

              <div>
                <h3 className="font-display text-2xl md:text-3xl tracking-tightest text-white group-hover:text-gold transition-colors duration-500">
                  {step.title}
                </h3>
                <span
                  aria-hidden
                  className="block mt-3 h-px w-6 bg-gold/40 transition-all duration-700 group-hover:w-full group-hover:bg-gold/60"
                />
              </div>

              <p className="relative font-sans font-light text-white/60 leading-body text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
