"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SectionLabel } from "@/components/SectionLabel";

export function AgencyHero() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduced) return;

      gsap.set("[data-ah-line]", { yPercent: 110 });
      gsap.set("[data-ah-fade]", { opacity: 0, y: 20 });
      gsap.set("[data-ah-rule]", { scaleY: 0, transformOrigin: "top center" });
      gsap.set("[data-ah-meta] > *", { opacity: 0, y: 14 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to("[data-ah-fade='eyebrow']", { opacity: 1, y: 0, duration: 0.8 })
        .to(
          "[data-ah-line]",
          { yPercent: 0, duration: 1.05, stagger: 0.18, ease: "power4.out" },
          0.2,
        )
        .to(
          "[data-ah-rule]",
          { scaleY: 1, duration: 0.9, ease: "power4.inOut" },
          0.65,
        )
        .to("[data-ah-fade='sub']", { opacity: 1, y: 0, duration: 0.9 }, 0.7)
        .to(
          "[data-ah-meta] > *",
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
          1.1,
        );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative bg-black px-6 md:px-10 pt-28 md:pt-40 pb-20 md:pb-28 overflow-hidden"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-[620px] w-[620px] rounded-full bg-gold/[0.05] blur-[140px]"
      />

      <div className="relative mx-auto max-w-[1400px]">
        <div data-ah-fade="eyebrow">
          <SectionLabel>03 — The Agency</SectionLabel>
        </div>

        <h1 className="mt-10 md:mt-14 font-display tracking-tightest leading-[0.95] text-[clamp(4rem,10vw,9rem)]">
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-ah-line className="block">
              Who is
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-ah-line className="block italic text-gold">
              Lumus?
            </span>
          </span>
        </h1>

        <div className="mt-12 md:mt-14 flex items-stretch gap-6 max-w-2xl">
          <span
            data-ah-rule
            aria-hidden
            className="block w-px bg-gold shrink-0"
          />
          <p
            data-ah-fade="sub"
            className="font-sans font-light text-white/70 text-base md:text-lg leading-body"
          >
            A small editorial studio in Galway, Ireland. We design brands,
            websites and motion for founders, makers and cultural projects who
            want their work to be looked at twice.
          </p>
        </div>

        <div
          data-ah-meta
          className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-10 max-w-3xl"
        >
          <Meta label="Studio" value="Galway, IE" />
          <Meta label="Founded" value="2024" />
          <Meta label="Team" value="Editorial Collective" />
          <Meta label="Clients" value="Worldwide" />
        </div>
      </div>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] uppercase tracking-cta text-white/40">
        {label}
      </span>
      <span className="font-display text-xl text-white tracking-tightest">
        {value}
      </span>
    </div>
  );
}
