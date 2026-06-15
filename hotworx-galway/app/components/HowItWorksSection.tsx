"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Choose Your Session",
    description:
      "Pick a 15-minute HIIT or 30-minute isometric workout. Available in-app or at the studio — any time of day.",
    detail: "15-min HIIT · 30-min Isometric",
  },
  {
    step: "02",
    title: "Train in Infrared Heat",
    description:
      "Enter a small-capacity infrared sauna with virtual instruction. Up to 3 people per session. The heat amplifies every rep.",
    detail: "Virtual instruction · Max 3 members",
  },
  {
    step: "03",
    title: "Track and Stay Consistent",
    description:
      "Use the HOTWORX app to book sessions, monitor calories burned and track progress over time.",
    detail: "App booking · Calorie tracking · Progress",
  },
];

export default function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative py-28 sm:py-36 heat-border"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="mb-16"
        >
          <p className="text-[#FF6B00] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            How HOTWORX Works
          </p>
          <h2
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
            className="text-[clamp(36px,6vw,72px)] leading-tight text-white uppercase"
          >
            Three steps.
            <br />
            <span className="text-[#444]">That&apos;s the whole system.</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 36 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.1 + i * 0.15 }}
              className="group relative p-8 glass-card rounded-sm cursor-default"
            >
              {/* Step number */}
              <div
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
                className="text-[72px] leading-none text-[rgba(255,107,0,0.08)] group-hover:text-[rgba(255,107,0,0.15)] transition-colors duration-300 mb-4 select-none"
              >
                {s.step}
              </div>

              {/* Orange line accent */}
              <div className="w-8 h-0.5 bg-[#FF6B00] mb-5 transition-all duration-300 group-hover:w-14" />

              <h3
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
                className="text-2xl text-white uppercase mb-3"
              >
                {s.title}
              </h3>
              <p className="text-[#7A7A7A] text-sm leading-relaxed mb-5">
                {s.description}
              </p>
              <p className="text-xs text-[#FF6B00] font-medium tracking-wider uppercase">
                {s.detail}
              </p>

              {/* Connecting line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-[rgba(255,107,0,0.2)] z-10" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
