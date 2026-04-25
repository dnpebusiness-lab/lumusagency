"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionLabel } from "@/components/SectionLabel";

export function VisionMission() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set("[data-vm-reveal]", { opacity: 0, y: 40 });
      gsap.set("[data-vm-tagline]", { yPercent: 110 });
      gsap.set("[data-vm-rule]", { scaleX: 0, transformOrigin: "left center" });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: el,
          start: "top 70%",
          once: true,
        },
      });

      tl.to("[data-vm-reveal]", {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.12,
      })
        .to(
          "[data-vm-rule]",
          { scaleX: 1, duration: 1.1, ease: "power4.inOut" },
          0.3,
        )
        .to(
          "[data-vm-tagline]",
          { yPercent: 0, duration: 1.1, ease: "power4.out" },
          0.5,
        );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative bg-dark px-6 md:px-10 py-28 md:py-40"
    >
      <div className="mx-auto max-w-[1400px]">
        <div data-vm-reveal>
          <SectionLabel>What we&rsquo;re here for</SectionLabel>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          <article
            data-vm-reveal
            className="border-t border-[var(--border-gold)] pt-10"
          >
            <p className="text-eyebrow">Vision</p>
            <h3 className="mt-8 font-display tracking-tightest leading-[1.05] text-3xl md:text-5xl">
              A studio whose work is{" "}
              <span className="italic text-gold">read</span>, not just seen.
            </h3>
            <p className="mt-8 font-sans font-light text-white/65 leading-body max-w-md">
              We want Lumus to become the reference point for editorial brand
              craft in Ireland and beyond — a place where founders, writers
              and operators come when the work has to last.
            </p>
          </article>

          <article
            data-vm-reveal
            className="border-t border-[var(--border-gold)] pt-10 md:pt-20"
          >
            <p className="text-eyebrow">Mission</p>
            <h3 className="mt-8 font-display tracking-tightest leading-[1.05] text-3xl md:text-5xl">
              Build brands with{" "}
              <span className="italic text-gold">a point of view</span>.
            </h3>
            <p className="mt-8 font-sans font-light text-white/65 leading-body max-w-md">
              Every week we ship identity, web, social and motion that holds
              together as one editorial voice — built for clarity, paid in
              precision, judged on impact.
            </p>
          </article>
        </div>

        <div
          data-vm-rule
          aria-hidden
          className="mt-20 h-px w-32 bg-gold"
        />

        <div className="mt-12 flex flex-col md:flex-row md:items-end md:justify-between gap-10">
          <div>
            <p data-vm-reveal className="text-eyebrow">
              Tagline
            </p>
            <h3 className="mt-8 font-display tracking-tightest leading-[0.95] text-[clamp(3rem,8vw,6.5rem)]">
              <span className="block overflow-hidden pb-[0.08em]">
                <span data-vm-tagline className="block">
                  We light{" "}
                  <span className="italic text-gold">the way</span>.
                </span>
              </span>
            </h3>
          </div>

          <p
            data-vm-reveal
            className="font-sans font-light text-white/50 max-w-xs text-sm leading-body"
          >
            Three words, said often, meant always. The shortest brief we
            give ourselves on every project.
          </p>
        </div>
      </div>
    </section>
  );
}
