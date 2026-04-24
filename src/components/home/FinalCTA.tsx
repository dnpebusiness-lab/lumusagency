"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/Button";
import { SectionLabel } from "@/components/SectionLabel";

export function FinalCTA() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set("[data-cta-line]", { yPercent: 110 });
      gsap.set("[data-cta-reveal]", { opacity: 0, y: 30 });
      gsap.set("[data-cta-rule]", { scaleX: 0, transformOrigin: "left center" });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: el,
          start: "top 70%",
          once: true,
        },
      });

      tl.to("[data-cta-reveal='eyebrow']", { opacity: 1, y: 0, duration: 0.8 })
        .to(
          "[data-cta-line]",
          { yPercent: 0, duration: 1.1, stagger: 0.18, ease: "power4.out" },
          0.15,
        )
        .to(
          "[data-cta-rule]",
          { scaleX: 1, duration: 1.2, ease: "power4.inOut" },
          0.4,
        )
        .to("[data-cta-reveal='sub']", { opacity: 1, y: 0, duration: 0.8 }, 0.7)
        .to("[data-cta-reveal='button']", { opacity: 1, y: 0, duration: 0.8 }, 0.9);
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative bg-black px-6 md:px-10 py-32 md:py-48 overflow-hidden"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[720px] w-[720px] rounded-full bg-gold/[0.07] blur-[160px]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-[var(--border-gold)]"
      />

      <div className="relative mx-auto max-w-[1400px] flex flex-col items-center text-center">
        <div data-cta-reveal="eyebrow">
          <SectionLabel align="center">04 — Ready to begin</SectionLabel>
        </div>

        <h2 className="mt-12 font-display tracking-tightest leading-[0.98] text-[clamp(3rem,9vw,7.5rem)]">
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-cta-line className="block">
              Ready to light
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-cta-line className="block italic text-gold">
              the way?
            </span>
          </span>
        </h2>

        <div
          data-cta-rule
          aria-hidden
          className="mt-14 h-px w-24 bg-gold"
        />

        <p
          data-cta-reveal="sub"
          className="mt-10 max-w-xl font-sans font-light text-white/60 leading-body"
        >
          Every project begins with a conversation. Tell us about the brand, the
          audience and the ambition — we&rsquo;ll show you what&rsquo;s possible.
        </p>

        <div data-cta-reveal="button" className="mt-12">
          <Button href="/contact" variant="filled" size="lg">
            Start a Project
          </Button>
        </div>

        <p className="mt-10 flex items-center gap-4 text-[10px] uppercase tracking-cta-wide text-white/40">
          <span>Galway, Ireland</span>
          <span aria-hidden className="h-px w-6 bg-[var(--border-gold)]" />
          <span>hello@lumus.agency</span>
        </p>
      </div>
    </section>
  );
}
