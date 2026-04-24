"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import { SectionLabel } from "@/components/SectionLabel";

type Entry = {
  number: string;
  title: string;
  href: string;
  tagline: string;
};

const INDEX: Entry[] = [
  { number: "01", title: "Branding", href: "#branding", tagline: "Identity · Editorial" },
  { number: "02", title: "Web Design", href: "#web-design", tagline: "UX · UI · Build" },
  { number: "03", title: "Social Media", href: "#social", tagline: "Strategy · Content" },
  { number: "04", title: "Motion Graphics", href: "#motion", tagline: "Animation · VFX" },
];

export function ServicesHero() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduced) return;

      gsap.set("[data-sh-line]", { yPercent: 110 });
      gsap.set("[data-sh-fade]", { opacity: 0, y: 18 });
      gsap.set("[data-sh-rule]", { scaleY: 0, transformOrigin: "top center" });
      gsap.set("[data-sh-index]", { opacity: 0, y: 24 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to("[data-sh-fade='eyebrow']", { opacity: 1, y: 0, duration: 0.8 })
        .to(
          "[data-sh-line]",
          { yPercent: 0, duration: 1, stagger: 0.16, ease: "power4.out" },
          0.2,
        )
        .to(
          "[data-sh-rule]",
          { scaleY: 1, duration: 0.9, ease: "power4.inOut" },
          0.6,
        )
        .to("[data-sh-fade='sub']", { opacity: 1, y: 0, duration: 0.9 }, 0.7)
        .to(
          "[data-sh-index]",
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 },
          1.0,
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
        className="pointer-events-none absolute -top-40 -right-40 h-[620px] w-[620px] rounded-full bg-gold/[0.05] blur-[140px]"
      />

      <div className="relative mx-auto max-w-[1400px]">
        <div data-sh-fade="eyebrow">
          <SectionLabel>02 — Services</SectionLabel>
        </div>

        <h1 className="mt-10 md:mt-14 font-display tracking-tightest leading-[0.98] text-[clamp(3.5rem,9vw,8rem)]">
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-sh-line className="block">
              Four disciplines,
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.08em]">
            <span data-sh-line className="block italic text-gold">
              one intent.
            </span>
          </span>
        </h1>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
          <div className="md:col-span-7 flex items-stretch gap-6 max-w-2xl">
            <span
              data-sh-rule
              aria-hidden
              className="block w-px bg-gold shrink-0"
            />
            <p
              data-sh-fade="sub"
              className="font-sans font-light text-white/70 text-base md:text-lg leading-body"
            >
              We build brands, websites, social presences and motion that read
              as one voice. Below, four ways we shape that voice —
              pick the thread and follow.
            </p>
          </div>

          <ul className="md:col-span-5 md:border-l md:border-[var(--border-gold)] md:pl-10">
            {INDEX.map((entry) => (
              <li
                key={entry.number}
                data-sh-index
                className="group border-b border-[var(--border-gold)] last:border-b-0"
              >
                <a
                  href={entry.href}
                  className="flex items-center gap-6 py-5 text-white hover:text-gold transition-colors duration-500"
                >
                  <span className="font-display italic text-gold/80 text-lg w-10 shrink-0">
                    {entry.number}
                  </span>
                  <span className="flex-1 flex flex-col">
                    <span className="font-display text-2xl md:text-3xl tracking-tightest leading-none">
                      {entry.title}
                    </span>
                    <span className="mt-2 text-[10px] uppercase tracking-cta text-white/40 group-hover:text-gold/80 transition-colors duration-500">
                      {entry.tagline}
                    </span>
                  </span>
                  <ArrowRight
                    size={16}
                    className="text-gold opacity-60 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-1"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
