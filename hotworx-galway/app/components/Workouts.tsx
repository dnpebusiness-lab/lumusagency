"use client";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ChapterHead from "./ChapterHead";
import { Reveal } from "./Reveal";
import MagneticButton from "./MagneticButton";

type Session = { name: string; benefit: string };

const iso: Session[] = [
  { name: "Hot Iso", benefit: "Whole-body hold work, head to toe" },
  { name: "Hot Pilates", benefit: "Core and posture, slow and deliberate" },
  { name: "Hot Yoga", benefit: "Flexibility and a clear head" },
  { name: "Hot Buns", benefit: "Glutes and legs, no kit" },
  { name: "Hot Barre None", benefit: "Small movements, long burn" },
  { name: "Hot Core", benefit: "Everything through the middle" },
  { name: "Hot Warrior", benefit: "Strength and stamina together" },
  { name: "Hot Bands", benefit: "Resistance through full range" },
  { name: "Hot Stretch", benefit: "The recovery day you keep skipping" },
];

const hiit: Session[] = [
  { name: "Hot Cycle", benefit: "Legs and lungs on the bike" },
  { name: "Hot Thunder", benefit: "Rowing intervals that earn the shower" },
  { name: "Hot Blast", benefit: "Total body, fifteen flat-out minutes" },
];

const tabs = [
  { id: "iso", label: "Isometric", meta: "30 min · up to 3", data: iso },
  { id: "hiit", label: "HIIT", meta: "15 min · up to 3", data: hiit },
  { id: "fx", label: "FX Zone", meta: "Open floor · members", data: [] },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

function Panel({ s, i }: { s: Session; i: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, clipPath: "inset(0 0 100% 0)" }}
      animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
      transition={{ duration: 0.6, ease: EASE, delay: i * 0.04 }}
      className="panel-glow group border border-line bg-panel/40 p-6 sm:p-7 cursor-default"
    >
      <div className="relative flex items-baseline justify-between gap-4">
        <h3 className="font-display font-extrabold text-[clamp(20px,2.4vw,28px)] tracking-tight text-paper group-hover:text-ember transition-colors duration-300">
          {s.name}
        </h3>
        <span className="font-display text-ash/40 text-sm">
          {String(i + 1).padStart(2, "0")}
        </span>
      </div>
      <p className="relative mt-3 text-paper/50 text-[15px] leading-snug">
        {s.benefit}
      </p>
    </motion.div>
  );
}

export default function Workouts() {
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("iso");
  const current = tabs.find((t) => t.id === active)!;

  return (
    <section id="workouts" className="relative border-t border-line py-28 sm:py-36">
      <div className="max-w-[1180px] mx-auto px-7 sm:px-14">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 mb-16">
          <ChapterHead
            index="03"
            zone="Inside the chamber"
            lines={[<>Twelve ways</>, <>to sweat.</>]}
            className="max-w-[16ch]"
          />
          {/* tab switch */}
          <Reveal delay={0.1}>
            <div className="inline-flex border border-line">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={`px-5 sm:px-6 py-3 text-[13px] font-medium tracking-[0.08em] uppercase transition-colors duration-300 border-r border-line last:border-r-0 cursor-pointer ${
                    active === t.id
                      ? "bg-ember text-[#1a0600]"
                      : "text-ash hover:text-paper"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <p className="text-ash text-sm tracking-[0.06em] mb-8">
          <span className="text-paper">{current.meta}</span>
        </p>

        {/* REPLACE: swap src with a real HOTWORX Galway class-in-action photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Reveal className="relative overflow-hidden border border-line mb-8">
          <img
            src="https://images.unsplash.com/photo-1574680178050-55c6a25ef79f?auto=format&fit=crop&w=1600&q=80"
            alt="Group workout in infrared studio"
            className="w-full object-cover block"
            style={{ height: 280, objectPosition: "center 40%", filter: "brightness(0.42) saturate(0.65)" }}
          />
          <div
            className="absolute inset-0 flex items-center px-8 sm:px-12"
            style={{ background: "linear-gradient(to right, rgba(10,8,7,0.85), rgba(10,8,7,0.1) 60%)" }}
          >
            <p className="font-display font-extrabold text-[clamp(22px,3.5vw,48px)] leading-[0.93] tracking-tight max-w-[18ch]">
              Twelve classes. One room. A screen that runs the session.
            </p>
          </div>
        </Reveal>

        <AnimatePresence mode="wait">
          {active !== "fx" ? (
            <motion.div
              key={active}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {current.data.map((s, i) => (
                <Panel key={s.name} s={s} i={i} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="fx"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-3"
            >
              <div className="panel-glow border border-line bg-panel/40 p-8 sm:p-10">
                <h3 className="font-display font-extrabold text-[clamp(24px,3vw,36px)] tracking-tight text-paper">
                  The FX Zone
                </h3>
                <p className="mt-4 text-paper/55 text-[16px] leading-relaxed max-w-[44ch]">
                  A kit floor outside the saunas — bands, free weights, ropes
                  and the basics. Warm up, add a few sets, or train on the days
                  you skip the heat. No booking, just walk over.
                </p>
              </div>
              <div className="border border-ember/30 bg-panel p-8 sm:p-10 flex flex-col justify-between overflow-hidden relative">
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse 100% 100% at 70% 0%, rgba(255,59,31,0.12), transparent 65%)",
                  }}
                />
                <div className="relative">
                  <p className="text-ember text-[12px] tracking-[0.2em] uppercase mb-3">
                    Included with membership
                  </p>
                  <p className="font-display font-extrabold text-[clamp(24px,3vw,40px)] leading-tight tracking-tight text-paper">
                    Build the workout around your day.
                  </p>
                </div>
                <div className="relative mt-8">
                  <MagneticButton href="#book" variant="fill">
                    Try it free →
                  </MagneticButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* mid-page conversion bar */}
        <Reveal className="mt-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-line p-6 sm:p-8 bg-panel/30">
            <p className="font-display font-bold text-[clamp(18px,2.2vw,26px)] tracking-tight text-paper max-w-[34ch]">
              Not sure which one to start with? We&apos;ll sort that on your free
              session.
            </p>
            <MagneticButton href="#book" variant="fill" className="flex-shrink-0">
              Book free workout →
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
