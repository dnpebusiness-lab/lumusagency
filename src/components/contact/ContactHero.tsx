"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SectionLabel } from "@/components/SectionLabel";

export function ContactHero() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduced) return;

      gsap.set("[data-ch-line]", { yPercent: 110 });
      gsap.set("[data-ch-fade]", { opacity: 0, y: 18 });
      gsap.set("[data-ch-rule]", { scaleY: 0, transformOrigin: "top center" });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to("[data-ch-fade='eyebrow']", { opacity: 1, y: 0, duration: 0.8 })
        .to(
          "[data-ch-line]",
          { yPercent: 0, duration: 1.05, stagger: 0.18, ease: "power4.out" },
          0.2,
        )
        .to(
          "[data-ch-rule]",
          { scaleY: 1, duration: 0.9, ease: "power4.inOut" },
          0.65,
        )
        .to("[data-ch-fade='sub']", { opacity: 1, y: 0, duration: 0.9 }, 0.7);
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative bg-black px-6 md:px-10 pt-28 md:pt-40 pb-16 md:pb-24 overflow-hidden"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 h-[620px] w-[620px] rounded-full bg-gold/[0.05] blur-[140px]"
      />

      <div className="relative mx-auto max-w-[1400px]">
        <div data-ch-fade="eyebrow">
          <SectionLabel>05 — Contact</SectionLabel>
        </div>

        <h1 className="mt-10 md:mt-14 font-display tracking-tightest leading-[0.98] text-[clamp(3.5rem,9vw,8rem)]">
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-ch-line className="block">
              Let&rsquo;s start
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-ch-line className="block italic text-gold">
              a conversation.
            </span>
          </span>
        </h1>

        <div className="mt-12 flex items-stretch gap-6 max-w-2xl">
          <span
            data-ch-rule
            aria-hidden
            className="block w-px bg-gold shrink-0"
          />
          <p
            data-ch-fade="sub"
            className="font-sans font-light text-white/70 text-base md:text-lg leading-body"
          >
            Tell us about the brand, the audience and the ambition. We answer
            within one working day, from Galway.
          </p>
        </div>
      </div>
    </section>
  );
}
