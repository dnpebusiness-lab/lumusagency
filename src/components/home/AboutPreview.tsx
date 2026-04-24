"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionLabel } from "@/components/SectionLabel";

type Pillar = {
  number: string;
  title: string;
  description: string;
};

const PILLARS: Pillar[] = [
  {
    number: "i.",
    title: "Clarity",
    description:
      "We strip away what doesn’t serve the story. What remains is intent made visible.",
  },
  {
    number: "ii.",
    title: "Precision",
    description:
      "Every pixel, kerning pair and micro-motion is considered. Craft is a form of respect.",
  },
  {
    number: "iii.",
    title: "Impact",
    description:
      "Beauty alone is not the point. The work must move — brands, audiences, metrics.",
  },
];

export function AboutPreview() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set("[data-about-reveal]", { opacity: 0, y: 60 });
      gsap.set("[data-about-rule]", { scaleX: 0, transformOrigin: "left center" });
      gsap.set("[data-about-pillar]", { opacity: 0, y: 40 });

      gsap.to("[data-about-reveal]", {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 75%",
          once: true,
        },
      });

      gsap.to("[data-about-rule]", {
        scaleX: 1,
        duration: 1.2,
        ease: "power4.inOut",
        scrollTrigger: {
          trigger: "[data-about-rule]",
          start: "top 85%",
          once: true,
        },
      });

      gsap.to("[data-about-pillar]", {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-about-pillars]",
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
      <div className="mx-auto max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        <div className="lg:col-span-7">
          <div data-about-reveal>
            <SectionLabel>02 — The Agency</SectionLabel>
          </div>

          <blockquote
            data-about-reveal
            className="mt-10 font-display italic text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tightest text-white"
          >
            &ldquo;We treat every brand like a magazine —
            <br />
            <span className="text-gold">a point of view, not a product</span>.&rdquo;
          </blockquote>

          <div
            data-about-rule
            aria-hidden
            className="mt-12 h-px w-24 bg-gold"
          />

          <div data-about-reveal className="mt-8 flex items-center gap-4">
            <span className="font-display italic text-white/80">
              Lumus Studio
            </span>
            <span aria-hidden className="h-px w-6 bg-[var(--border-gold)]" />
            <span className="text-[10px] uppercase tracking-cta-wide text-white/50">
              Founded in Galway
            </span>
          </div>

          <div data-about-reveal className="mt-12">
            <Link
              href="/agency"
              className="group inline-flex items-center gap-3 text-[11px] uppercase tracking-cta-wide text-white hover:text-gold transition-colors duration-500"
            >
              <span className="h-px w-8 bg-gold transition-all duration-500 group-hover:w-12" />
              Read our story
              <ArrowRight
                size={14}
                className="text-gold transition-transform duration-500 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>

        <div
          data-about-pillars
          className="lg:col-span-5 lg:border-l lg:border-[var(--border-gold)] lg:pl-16"
        >
          <p className="text-eyebrow">Brand essence</p>

          <ul className="mt-10 flex flex-col">
            {PILLARS.map((pillar, i) => (
              <li
                key={pillar.title}
                data-about-pillar
                className={`py-8 ${i > 0 ? "border-t border-[var(--border-gold)]" : ""}`}
              >
                <div className="flex items-baseline gap-6">
                  <span className="font-display italic text-gold text-base w-8 shrink-0">
                    {pillar.number}
                  </span>
                  <div>
                    <h3 className="font-display text-3xl tracking-tightest leading-none">
                      {pillar.title}
                    </h3>
                    <p className="mt-4 font-sans font-light text-white/60 leading-body max-w-sm">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
