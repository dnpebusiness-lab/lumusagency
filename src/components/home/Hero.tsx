"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowDown } from "lucide-react";
import { SectionLabel } from "@/components/SectionLabel";
import { Button } from "@/components/Button";

export function Hero() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduced) return;

      gsap.set("[data-hero-line]", { yPercent: 110 });
      gsap.set("[data-hero-eyebrow]", { opacity: 0, y: 16 });
      gsap.set("[data-hero-sub]", { opacity: 0, y: 18 });
      gsap.set("[data-hero-rule]", { scaleY: 0, transformOrigin: "top center" });
      gsap.set("[data-hero-cta] > *", { opacity: 0, y: 14 });
      gsap.set("[data-hero-indicator]", { opacity: 0, y: 12 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to("[data-hero-eyebrow]", { opacity: 1, y: 0, duration: 0.8 })
        .to(
          "[data-hero-line]",
          { yPercent: 0, duration: 1, stagger: 0.18, ease: "power4.out" },
          0.2,
        )
        .to(
          "[data-hero-rule]",
          { scaleY: 1, duration: 0.9, ease: "power4.inOut" },
          0.7,
        )
        .to("[data-hero-sub]", { opacity: 1, y: 0, duration: 0.9 }, 0.75)
        .to(
          "[data-hero-cta] > *",
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 },
          1.0,
        )
        .to("[data-hero-indicator]", { opacity: 1, y: 0, duration: 0.6 }, 1.3);
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative min-h-[calc(100vh-5rem)] flex items-center px-6 md:px-10 py-24 md:py-32 overflow-hidden"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-[620px] w-[620px] rounded-full bg-gold/[0.05] blur-[140px]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-60 -right-40 h-[520px] w-[520px] rounded-full bg-gold/[0.04] blur-[140px]"
      />

      <div className="relative mx-auto max-w-[1400px] w-full">
        <div data-hero-eyebrow>
          <SectionLabel>Lumus Agency — Galway, Ireland</SectionLabel>
        </div>

        <h1 className="mt-10 md:mt-12 font-display tracking-tightest leading-[0.95] text-[clamp(4.5rem,10vw,8.75rem)]">
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-hero-line className="block">
              We light
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-hero-line className="block italic text-gold">
              the way.
            </span>
          </span>
        </h1>

        <div className="mt-12 md:mt-14 flex items-stretch gap-6 max-w-2xl">
          <span
            data-hero-rule
            aria-hidden
            className="block w-px bg-gold shrink-0"
          />
          <p
            data-hero-sub
            className="font-sans font-light text-white/70 text-base md:text-lg leading-body"
          >
            A creative studio shaping editorial brands, thoughtful websites,
            social storytelling and motion. From Latin{" "}
            <span className="font-display italic text-gold">lumus</span>,
            meaning light — we build what deserves to be seen.
          </p>
        </div>

        <div
          data-hero-cta
          className="mt-14 flex flex-wrap items-center gap-4"
        >
          <Button href="/contact" variant="filled" size="lg">
            Start a Project
          </Button>
          <Button href="/work" variant="ghost" size="lg">
            See the Work
          </Button>
        </div>

        <div
          data-hero-indicator
          className="absolute -bottom-6 md:bottom-0 right-0 md:right-2 hidden sm:flex items-center gap-3 text-white/50"
        >
          <span className="text-[10px] uppercase tracking-cta-wide">
            Scroll
          </span>
          <ArrowDown size={14} className="text-gold animate-[pulse_2.4s_ease-in-out_infinite]" />
        </div>
      </div>
    </section>
  );
}
