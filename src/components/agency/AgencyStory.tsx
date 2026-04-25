"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionLabel } from "@/components/SectionLabel";

export function AgencyStory() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set("[data-as-reveal]", { opacity: 0, y: 50 });
      gsap.set("[data-as-rule]", { scaleX: 0, transformOrigin: "left center" });

      gsap.to("[data-as-reveal]", {
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

      gsap.to("[data-as-rule]", {
        scaleX: 1,
        duration: 1.2,
        ease: "power4.inOut",
        scrollTrigger: {
          trigger: "[data-as-rule]",
          start: "top 85%",
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative bg-dark px-6 md:px-10 py-28 md:py-40"
    >
      <div className="mx-auto max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        <div className="lg:col-span-5">
          <div data-as-reveal>
            <SectionLabel>Origin</SectionLabel>
          </div>

          <h2
            data-as-reveal
            className="mt-10 font-display tracking-tightest leading-[1.02] text-4xl md:text-5xl lg:text-6xl"
          >
            From the Latin{" "}
            <span className="italic text-gold">lumus</span> — light.
          </h2>

          <div
            data-as-rule
            aria-hidden
            className="mt-10 h-px w-24 bg-gold"
          />

          <p
            data-as-reveal
            className="mt-10 font-sans font-light text-white/60 leading-body max-w-md"
          >
            Lumus is what we choose to make visible. The studio sits at the
            quiet end of a Galway street, between the bay and the bookshops —
            a fitting place to think about clarity.
          </p>
        </div>

        <div className="lg:col-span-7 space-y-8 font-sans font-light text-white/70 leading-body text-base md:text-lg max-w-2xl">
          <p data-as-reveal>
            We started Lumus because most agencies are organised around
            channels — a brand team, a web team, a social team — while brands
            actually live as a single voice across all of them. Lumus is built
            the other way around: one editorial direction, four disciplines
            that reinforce each other.
          </p>
          <p data-as-reveal>
            The work that excites us is precise but warm, restrained but
            confident. We borrow from publishing more than from advertising:
            grids, mastheads, pull-quotes, considered white space. The brief
            is a treatment; the deliverables are the issue.
          </p>
          <p data-as-reveal>
            We work with founders, cultural projects and operators who treat
            the brand as a long game. Some weeks that means a launch identity,
            other weeks a film, a feed, a website, a typeface — usually all of
            the above, eventually.
          </p>

          <blockquote
            data-as-reveal
            className="not-prose pt-8 border-t border-[var(--border-gold)] font-display italic text-2xl md:text-3xl text-white leading-[1.25] max-w-xl"
          >
            “Light a brand well enough and it stops needing to shout.”
          </blockquote>
        </div>
      </div>
    </section>
  );
}
