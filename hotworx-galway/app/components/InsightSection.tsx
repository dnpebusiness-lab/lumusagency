"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const lines = [
  "Most people don't need another complicated fitness plan.",
  "They need a training option that fits real life.",
];

const highlights = [
  { stat: "15–30", label: "Minute sessions" },
  { stat: "24/7", label: "Member access" },
  { stat: "3", label: "People max per session" },
];

export default function InsightSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="insight"
      ref={ref}
      className="relative py-28 sm:py-36 heat-border overflow-hidden"
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,107,0,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-[#FF6B00] text-xs font-semibold tracking-[0.2em] uppercase mb-8"
        >
          The Reality
        </motion.p>

        {/* Statement lines */}
        <div className="mb-14">
          {lines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.1 + i * 0.15 }}
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
              className={`text-[clamp(28px,5vw,52px)] leading-tight mb-3 ${
                i === 0 ? "text-white" : "text-[#666]"
              }`}
            >
              {line}
            </motion.p>
          ))}
        </div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14"
        >
          {[
            "Short sessions that fit your schedule.",
            "24-hour access — morning, evening, or night.",
            "Heat, infrared energy and exercise in one place.",
          ].map((text, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-5 glass-card rounded-sm"
            >
              <div className="w-5 h-5 mt-0.5 rounded-full border border-[#FF6B00] flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-[#FF6B00]" />
              </div>
              <p className="text-[#B0B0B0] text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-10 sm:gap-16 pt-8 border-t border-[rgba(255,255,255,0.06)]"
        >
          {highlights.map((h, i) => (
            <div key={i}>
              <p
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
                className="text-[clamp(36px,6vw,60px)] leading-none gradient-text mb-1"
              >
                {h.stat}
              </p>
              <p className="text-[#666] text-sm uppercase tracking-[0.1em]">{h.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
