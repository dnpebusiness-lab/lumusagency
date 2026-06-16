"use client";
import { motion, useReducedMotion } from "framer-motion";
import ChapterHead from "./ChapterHead";
import { Reveal } from "./Reveal";

const features = [
  ["Book in seconds", "Whole timetable, tap the slot, sorted."],
  ["See the calories", "Every session logged the second you finish."],
  ["Chase a challenge", "Monthly targets to keep the streak alive."],
  ["Bring the crew", "Add friends, share sessions, stay honest."],
];

const EASE = [0.16, 1, 0.3, 1] as const;

function FloatCard({
  children,
  className = "",
  delay = 0,
  drift = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  drift?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: EASE, delay }}
      className={className}
      style={
        reduce
          ? undefined
          : { animation: `haze-drift ${9 + drift}s ease-in-out infinite` }
      }
    >
      {children}
    </motion.div>
  );
}

export default function AppControl() {
  return (
    <section id="app" className="relative border-t border-line py-28 sm:py-36 overflow-hidden">
      <div className="max-w-[1180px] mx-auto px-7 sm:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* copy */}
          <div>
            <ChapterHead
              index="—"
              zone="The control centre"
              lines={[<>Your studio,</>, <>in your pocket.</>]}
              className="mb-10 max-w-[16ch]"
            />
            <Reveal>
              <p className="text-paper/55 text-[16px] max-w-[42ch] mb-10 leading-relaxed">
                The Burn Off app runs the lot — booking, calories, challenges and
                the friends who keep you turning up.
              </p>
            </Reveal>
            <div className="border-t border-line">
              {features.map((f, i) => (
                <Reveal
                  key={f[0]}
                  delay={i * 0.06}
                  className="flex items-baseline justify-between gap-6 py-5 border-b border-line"
                >
                  <span className="font-display font-bold text-[clamp(17px,2vw,22px)] tracking-tight text-paper">
                    {f[0]}
                  </span>
                  <span className="text-ash text-[14px] text-right max-w-[24ch]">
                    {f[1]}
                  </span>
                </Reveal>
              ))}
            </div>
          </div>

          {/* floating interface */}
          <div className="relative h-[460px] sm:h-[520px] flex items-center justify-center">
            <div
              className="absolute w-[80%] h-[80%] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,59,31,0.12), transparent 65%)",
                filter: "blur(20px)",
              }}
            />

            {/* main stat card */}
            <FloatCard
              delay={0.1}
              drift={0}
              className="relative z-10 w-[230px] border border-line bg-panel p-5"
            >
              <p className="text-[10px] tracking-[0.18em] uppercase text-ash">
                Burned this month
              </p>
              <p className="font-display font-extrabold text-[44px] leading-none text-paper mt-2">
                4,820
              </p>
              <p className="text-ash text-[11px] mt-1">cals · 12 sessions</p>
              <div className="mt-4">
                <div className="flex justify-between text-[10px] text-ash mb-1.5">
                  <span>Monthly goal</span>
                  <span className="text-ember">12 / 16</span>
                </div>
                <div className="h-1 bg-ink">
                  <div className="h-full bg-ember" style={{ width: "75%" }} />
                </div>
              </div>
            </FloatCard>

            {/* booking chip top-right */}
            <FloatCard
              delay={0.25}
              drift={2}
              className="absolute z-20 top-6 right-2 sm:right-6 border border-ember/30 bg-ink px-4 py-3"
            >
              <p className="font-display font-bold text-[13px] uppercase tracking-tight text-paper">
                Hot Yoga
              </p>
              <p className="text-[10px] text-ash">Tomorrow · 7:00 · 30m</p>
            </FloatCard>

            {/* calorie chip bottom-left */}
            <FloatCard
              delay={0.4}
              drift={3.5}
              className="absolute z-20 bottom-8 left-0 sm:left-4 flex items-center gap-2.5 border border-line bg-ink px-4 py-3"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-ember" />
              <p className="text-[12px] text-paper font-medium">342 cal · session done</p>
            </FloatCard>
          </div>
        </div>
      </div>
    </section>
  );
}
