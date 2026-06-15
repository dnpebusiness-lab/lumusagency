"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CalendarCheck, BarChart3, Trophy, Users, CheckCircle } from "lucide-react";

const features = [
  {
    icon: CalendarCheck,
    title: "Book Sessions",
    desc: "Reserve your spot in any infrared session directly from your phone.",
  },
  {
    icon: BarChart3,
    title: "Track Calories",
    desc: "Monitor calories burned during each session and watch them add up.",
  },
  {
    icon: Trophy,
    title: "Complete Challenges",
    desc: "Stay motivated with regular challenges that keep training fresh.",
  },
  {
    icon: Users,
    title: "Train with Friends",
    desc: "Connect with other members and stay accountable through community features.",
  },
  {
    icon: CheckCircle,
    title: "Follow Progress",
    desc: "See your training history, streaks and improvements over time.",
  },
];

export default function AppSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="app"
      ref={ref}
      className="relative py-28 sm:py-36 heat-border overflow-hidden"
    >
      {/* Ambient glow right */}
      <div
        className="absolute top-1/2 right-0 -translate-y-1/2 w-[400px] h-[600px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at right, rgba(255,107,0,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Text side */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-[#FF6B00] text-xs font-semibold tracking-[0.2em] uppercase mb-4"
            >
              HOTWORX Burn Off App
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
              className="text-[clamp(36px,6vw,72px)] leading-tight text-white uppercase mb-6"
            >
              Everything you need
              <br />
              <span className="text-[#444]">to stay consistent.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-[#7A7A7A] text-base leading-relaxed mb-10 max-w-sm"
            >
              The HOTWORX app puts your training in your pocket — from booking
              sessions to tracking every calorie burned.
            </motion.p>

            {/* Feature list */}
            <div className="space-y-4">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                    className="flex items-start gap-4 group cursor-default"
                  >
                    <div className="w-9 h-9 rounded-sm bg-[rgba(255,107,0,0.06)] border border-[rgba(255,107,0,0.12)] flex items-center justify-center flex-shrink-0 group-hover:bg-[rgba(255,107,0,0.12)] group-hover:border-[rgba(255,107,0,0.25)] transition-all duration-200">
                      <Icon size={15} className="text-[#FF6B00]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p
                        style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
                        className="text-white text-base uppercase mb-0.5"
                      >
                        {f.title}
                      </p>
                      <p className="text-[#5A5A5A] text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* App visual / phone mockup placeholder */}
          {/*
            REPLACE: Add a phone mockup image or animated screenshot here.
            Path: /public/images/app-mockup.png
            Recommended size: 300x600px minimum.
          */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative float-anim">
              {/* Phone outline */}
              <div
                className="relative w-[220px] h-[440px] rounded-[32px] border-2 border-[rgba(255,107,0,0.25)] bg-[#111] overflow-hidden"
                style={{
                  boxShadow:
                    "0 0 40px rgba(255,107,0,0.12), 0 0 80px rgba(255,107,0,0.06), inset 0 0 30px rgba(255,107,0,0.03)",
                }}
              >
                {/* Phone notch */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-[#0D0D0D] border border-[rgba(255,255,255,0.05)] z-10" />

                {/* Screen content */}
                <div className="absolute inset-0 pt-12 px-3 pb-4">
                  {/* App header */}
                  <div className="flex items-center justify-between mb-4 px-1">
                    <span
                      style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "14px" }}
                      className="text-white uppercase"
                    >
                      HOT<span className="text-[#FF6B00]">WORX</span>
                    </span>
                    <div className="w-6 h-6 rounded-full bg-[rgba(255,107,0,0.2)] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#FF6B00]" />
                    </div>
                  </div>

                  {/* Stat card */}
                  <div className="bg-[rgba(255,107,0,0.08)] border border-[rgba(255,107,0,0.15)] rounded-xl p-3 mb-3">
                    <p className="text-[#666] text-[9px] uppercase tracking-wider mb-1">
                      Total Calories Burned
                    </p>
                    <p
                      style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "28px" }}
                      className="gradient-text leading-none"
                    >
                      4,820
                    </p>
                    <p className="text-[#444] text-[9px] mt-1">This month</p>
                  </div>

                  {/* Session cards */}
                  {[
                    { name: "Hot Yoga", time: "Tomorrow 7am", tag: "30 min" },
                    { name: "Hot Cycle", time: "Friday 6pm", tag: "15 min" },
                  ].map((s) => (
                    <div
                      key={s.name}
                      className="bg-[#161616] border border-[rgba(255,255,255,0.04)] rounded-lg p-2.5 mb-2 flex items-center justify-between"
                    >
                      <div>
                        <p
                          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "11px" }}
                          className="text-white uppercase"
                        >
                          {s.name}
                        </p>
                        <p className="text-[#444] text-[9px] mt-0.5">{s.time}</p>
                      </div>
                      <span className="text-[8px] text-[#FF6B00] bg-[rgba(255,107,0,0.1)] px-2 py-0.5 rounded-sm font-semibold">
                        {s.tag}
                      </span>
                    </div>
                  ))}

                  {/* Progress bar */}
                  <div className="mt-3 px-1">
                    <div className="flex justify-between text-[9px] text-[#444] mb-1.5">
                      <span>Monthly Goal</span>
                      <span className="text-[#FF6B00]">12/16 sessions</span>
                    </div>
                    <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#FF6B00]"
                        style={{ width: "75%" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Infrared overlay */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-[30px]"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 0%, rgba(255,107,0,0.08) 0%, transparent 60%)",
                  }}
                />
              </div>

              {/* Floating feature pills */}
              {[
                { text: "Session booked", top: "10%", right: "-55%" },
                { text: "342 cal burned", top: "55%", left: "-55%" },
              ].map((pill) => (
                <div
                  key={pill.text}
                  className="absolute flex items-center gap-2 bg-[#161616] border border-[rgba(255,107,0,0.2)] px-3 py-2 rounded-full text-[10px] font-semibold text-white whitespace-nowrap"
                  style={{ top: pill.top, right: pill.right, left: pill.left }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
                  {pill.text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
