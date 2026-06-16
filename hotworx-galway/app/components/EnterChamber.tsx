"use client";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ChapterHead from "./ChapterHead";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const steps = [
  {
    no: "01",
    title: "Choose your session",
    body: "Nine isometric classes at 30 minutes, three HIIT classes at 15. Open the app, tap a slot, done.",
  },
  {
    no: "02",
    title: "Step into the heat",
    body: "You and up to two others. A screen runs the session start to finish. The infrared does the part you can't see.",
  },
  {
    no: "03",
    title: "Track it from the app",
    body: "Calories logged the second you finish. Streaks kept honest. Come back tomorrow morning, or tonight.",
  },
];

export default function EnterChamber() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (reduce) return;

      // The heat-progress line fills as you move through the chamber.
      gsap.fromTo(
        ".chamber-fill",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".chamber-track",
            start: "top 70%",
            end: "bottom 70%",
            scrub: 0.6,
          },
        }
      );

      // Each step warms up as it arrives.
      gsap.utils.toArray<HTMLElement>(".chamber-step").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0.25, x: -10 },
          {
            opacity: 1,
            x: 0,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 78%", end: "top 50%", scrub: 0.5 },
          }
        );
      });
    },
    { scope: root }
  );

  return (
    <section
      id="how"
      ref={root}
      className="relative border-t border-line py-28 sm:py-36 overflow-hidden"
    >
      {/* deepening glow toward the bottom of the chamber */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 50% 120%, rgba(255,59,31,0.08), transparent 70%)",
        }}
      />
      <div className="relative max-w-[1180px] mx-auto px-7 sm:px-14">
        <ChapterHead
          index="02"
          zone="Enter the chamber"
          lines={[<>How it</>, <>actually works.</>]}
          className="mb-20 max-w-[18ch]"
        />

        <div className="chamber-track grid grid-cols-1 md:grid-cols-[80px_1fr] gap-x-10">
          {/* progress rail */}
          <div className="hidden md:block relative">
            <div className="absolute left-1/2 top-2 bottom-2 w-px bg-line" />
            <div className="chamber-fill absolute left-1/2 top-2 bottom-2 w-px bg-gradient-to-b from-ember to-amber origin-top" />
          </div>

          <div>
            {steps.map((s, i) => (
              <div
                key={s.no}
                className="chamber-step grid grid-cols-[auto_1fr] gap-6 sm:gap-10 items-start py-10 border-t border-line first:border-t-0 first:pt-0"
              >
                <div className="font-display font-extrabold text-[clamp(40px,7vw,84px)] leading-none ghost">
                  {s.no}
                </div>
                <div className="pt-1">
                  <h3 className="font-display font-extrabold text-[clamp(22px,3.4vw,38px)] leading-tight text-paper tracking-tight">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-paper/55 text-[clamp(15px,1.6vw,18px)] max-w-[52ch] leading-relaxed">
                    {s.body}
                  </p>
                  {i === steps.length - 1 && (
                    <a
                      href="#book"
                      className="inline-flex items-center gap-2 mt-6 text-ember text-sm font-medium hover:gap-3 transition-all cursor-pointer"
                    >
                      Book your free workout
                      <span aria-hidden>→</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
