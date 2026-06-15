"use client";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Flame, Zap, Dumbbell } from "lucide-react";

const isometric = [
  { name: "Hot Iso", benefit: "Full-body muscle engagement" },
  { name: "Hot Pilates", benefit: "Core strength and posture" },
  { name: "Hot Yoga", benefit: "Flexibility and balance" },
  { name: "Hot Buns", benefit: "Glutes and lower body" },
  { name: "Hot Barre None", benefit: "Toning and endurance" },
  { name: "Hot Core", benefit: "Core stability and strength" },
  { name: "Hot Warrior", benefit: "Full-body power and stamina" },
  { name: "Hot Bands", benefit: "Resistance and muscle activation" },
  { name: "Hot Stretch", benefit: "Recovery and flexibility" },
];

const hiit = [
  { name: "Hot Cycle", benefit: "Cardio and lower body burn" },
  { name: "Hot Thunder", benefit: "High-intensity rowing endurance" },
  { name: "Hot Blast", benefit: "Total-body HIIT conditioning" },
];

const tabs = ["Isometric", "HIIT", "FX Zone"] as const;
type Tab = (typeof tabs)[number];

export default function WorkoutsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [active, setActive] = useState<Tab>("Isometric");

  return (
    <section
      id="workouts"
      ref={ref}
      className="relative py-28 sm:py-36 heat-border"
    >
      {/* Background infrared glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(255,107,0,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="mb-12"
        >
          <p className="text-[#FF6B00] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            The Sessions
          </p>
          <h2
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
            className="text-[clamp(36px,6vw,72px)] leading-tight text-white uppercase"
          >
            Every workout,
            <br />
            <span className="text-[#444]">inside infrared heat.</span>
          </h2>
        </motion.div>

        {/* Tab navigation */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex gap-1 mb-10 p-1 bg-[#111] rounded-sm w-fit"
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`px-6 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-200 cursor-pointer rounded-sm ${
                active === tab
                  ? "bg-[#FF6B00] text-white"
                  : "text-[#666] hover:text-white"
              }`}
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px" }}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Isometric grid */}
        {active === "Isometric" && (
          <motion.div
            key="iso"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            {/* Duration badge */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(255,107,0,0.08)] border border-[rgba(255,107,0,0.2)] rounded-sm">
                <Flame size={13} className="text-[#FF6B00]" />
                <span className="text-[#FFA94D] text-xs font-semibold tracking-wider uppercase">
                  30 minutes · Up to 3 members
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isometric.map((w, i) => (
                <motion.div
                  key={w.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="group glass-card p-5 rounded-sm cursor-default"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3
                      style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
                      className="text-xl text-white uppercase group-hover:text-[#FF6B00] transition-colors duration-200"
                    >
                      {w.name}
                    </h3>
                    <Flame
                      size={16}
                      className="text-[rgba(255,107,0,0.3)] group-hover:text-[#FF6B00] transition-colors duration-200 flex-shrink-0 mt-0.5"
                    />
                  </div>
                  <p className="text-[#666] text-sm">{w.benefit}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* HIIT grid */}
        {active === "HIIT" && (
          <motion.div
            key="hiit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(255,107,0,0.08)] border border-[rgba(255,107,0,0.2)] rounded-sm">
                <Zap size={13} className="text-[#FF6B00]" />
                <span className="text-[#FFA94D] text-xs font-semibold tracking-wider uppercase">
                  15 minutes · Up to 3 members
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {hiit.map((w, i) => (
                <motion.div
                  key={w.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="group glass-card p-8 rounded-sm cursor-default"
                >
                  <div
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
                    className="text-[64px] leading-none text-[rgba(255,107,0,0.06)] group-hover:text-[rgba(255,107,0,0.12)] transition-colors duration-300 mb-4"
                  >
                    0{i + 1}
                  </div>
                  <div className="w-8 h-0.5 bg-[#FF6B00] mb-4 transition-all duration-300 group-hover:w-12" />
                  <h3
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
                    className="text-2xl text-white uppercase mb-2"
                  >
                    {w.name}
                  </h3>
                  <p className="text-[#666] text-sm">{w.benefit}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* FX Zone */}
        {active === "FX Zone" && (
          <motion.div
            key="fx"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-10 rounded-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-sm bg-[rgba(255,107,0,0.1)] border border-[rgba(255,107,0,0.2)] flex items-center justify-center">
                    <Dumbbell size={18} className="text-[#FF6B00]" />
                  </div>
                  <div>
                    <h3
                      style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
                      className="text-2xl text-white uppercase"
                    >
                      FX Zone
                    </h3>
                    <p className="text-[#666] text-xs uppercase tracking-wider">
                      Functional Training Area
                    </p>
                  </div>
                </div>
                <p className="text-[#8A8A8A] leading-relaxed mb-6">
                  The FX Zone gives members access to a full functional exercise
                  area — available before, after or between infrared sessions.
                  Use it to extend your training or warm up before stepping into
                  the sauna.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {["Resistance Bands", "Free Weights", "Battle Ropes", "Training Equipment"].map(
                    (item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-[#666]">
                        <div className="w-1 h-1 rounded-full bg-[#FF6B00]" />
                        {item}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="glass-card p-10 rounded-sm flex flex-col justify-between">
                <div>
                  <p className="text-[#FF6B00] text-xs uppercase tracking-[0.2em] font-semibold mb-3">
                    Included with Membership
                  </p>
                  <h3
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
                    className="text-[clamp(28px,4vw,44px)] leading-tight text-white uppercase mb-4"
                  >
                    Train more.
                    <br />
                    In less time.
                  </h3>
                  <p className="text-[#7A7A7A] text-sm leading-relaxed">
                    Combine infrared sessions with functional training for a
                    complete approach to fitness — all under one roof in Galway.
                  </p>
                </div>
                <a
                  href="#book"
                  className="mt-8 block text-center bg-[rgba(255,107,0,0.1)] hover:bg-[#FF6B00] border border-[rgba(255,107,0,0.3)] hover:border-[#FF6B00] text-[#FF6B00] hover:text-white font-bold py-3.5 transition-all duration-200 cursor-pointer uppercase tracking-wide text-sm"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  Try It Free
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mid-page CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8 bg-[#111] border border-[rgba(255,107,0,0.12)] rounded-sm"
        >
          <div>
            <p
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
              className="text-xl text-white uppercase"
            >
              Not sure where to start?
            </p>
            <p className="text-[#666] text-sm mt-1">
              Book your free session and we&apos;ll walk you through everything during staffed hours.
            </p>
          </div>
          <a
            href="#book"
            className="flex-shrink-0 bg-[#FF6B00] hover:bg-[#FF8C3A] text-white font-bold px-8 py-3.5 uppercase tracking-wide transition-colors duration-200 cursor-pointer"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px" }}
          >
            Book Free Workout
          </a>
        </motion.div>
      </div>
    </section>
  );
}
