"use client";
import { Reveal } from "./Reveal";
import ChapterHead from "./ChapterHead";

const oldWay = [
  "An hour you have to find",
  "A crowded floor at peak time",
  "Guesswork once you're there",
  "Easy to skip, easy to quit",
];

const newWay = [
  "15 or 30 minutes, in and out",
  "Three people to a sauna, max",
  "A guided session on the wall",
  "Doors open round the clock",
];

export default function WhyDifferent() {
  return (
    <section id="why" className="relative border-t border-line py-28 sm:py-36">
      <div className="max-w-[1180px] mx-auto px-7 sm:px-14">
        <ChapterHead
          index="01"
          zone="Outside the chamber"
          lines={[<>Same goal.</>, <>Different room.</>]}
          className="mb-20 max-w-[20ch]"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 relative">
          {/* Old way */}
          <Reveal className="relative p-8 sm:p-10 lg:pr-16 border border-line lg:border-r-0">
            <p className="text-ash text-[13px] tracking-[0.2em] uppercase mb-8">
              The usual gym
            </p>
            <ul className="space-y-5">
              {oldWay.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-4 text-paper/45 text-lg leading-snug"
                >
                  <span className="mt-2.5 w-4 h-px bg-paper/20 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* New way — lit panel */}
          <Reveal
            delay={0.12}
            className="relative p-8 sm:p-10 lg:pl-16 border border-ember/30 bg-panel overflow-hidden"
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 90% 100% at 80% 0%, rgba(255,59,31,0.12), transparent 65%)",
              }}
            />
            <p className="relative text-ember text-[13px] tracking-[0.2em] uppercase mb-8">
              HOTWORX Galway
            </p>
            <ul className="relative space-y-5">
              {newWay.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-4 text-paper text-lg leading-snug"
                >
                  <span className="mt-2.5 w-4 h-px bg-ember flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Heat line where the two panels meet (desktop) */}
          <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px">
            <div className="h-full w-full bg-gradient-to-b from-transparent via-ember/60 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
