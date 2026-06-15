"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Activity,
  Brain,
  Flame,
  TrendingDown,
  Heart,
  ShieldCheck,
  Droplets,
  Sparkles,
} from "lucide-react";

const benefits = [
  {
    icon: Activity,
    title: "Muscle Recovery",
    description:
      "Infrared heat can help support muscle recovery and reduce post-workout soreness.",
  },
  {
    icon: Brain,
    title: "Stress Reduction",
    description:
      "Regular heat sessions are designed to support relaxation and help manage daily stress.",
  },
  {
    icon: Flame,
    title: "Increased Calorie Burn",
    description:
      "Exercising in infrared heat can increase calorie expenditure compared to standard training.",
  },
  {
    icon: TrendingDown,
    title: "Weight Management",
    description:
      "Short, consistent sessions can help support your weight management goals over time.",
  },
  {
    icon: Heart,
    title: "Improved Circulation",
    description:
      "Infrared energy is designed to support healthy blood flow and cardiovascular function.",
  },
  {
    icon: ShieldCheck,
    title: "Pain Relief",
    description:
      "Heat therapy may help with general muscle discomfort and joint stiffness.",
  },
  {
    icon: Droplets,
    title: "Detoxification",
    description:
      "Sweating in infrared heat can support the body&apos;s natural detox process.",
  },
  {
    icon: Sparkles,
    title: "Skin Rejuvenation",
    description:
      "Improved circulation from infrared sessions may contribute to healthier-looking skin.",
  },
];

export default function BenefitsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="benefits"
      ref={ref}
      className="relative py-28 sm:py-36 heat-border"
    >
      {/* Top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,107,0,0.3), rgba(255,169,77,0.5), rgba(255,107,0,0.3), transparent)",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="mb-16 max-w-xl"
        >
          <p className="text-[#FF6B00] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Why Infrared
          </p>
          <h2
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
            className="text-[clamp(36px,6vw,72px)] leading-tight text-white uppercase"
          >
            More from
            <br />
            every session.
          </h2>
          <p className="text-[#666] text-sm mt-4 leading-relaxed">
            Infrared heat adds a layer of benefit that standard exercise alone
            doesn&apos;t provide. These are the areas HOTWORX is designed to support.
          </p>
        </motion.div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.05 + i * 0.07 }}
                className="group glass-card p-6 rounded-sm cursor-default"
              >
                <div className="w-9 h-9 rounded-sm bg-[rgba(255,107,0,0.08)] border border-[rgba(255,107,0,0.15)] flex items-center justify-center mb-5 group-hover:bg-[rgba(255,107,0,0.15)] group-hover:border-[rgba(255,107,0,0.3)] transition-all duration-300">
                  <Icon
                    size={17}
                    className="text-[#FF6B00]"
                    strokeWidth={1.5}
                  />
                </div>
                <h3
                  style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
                  className="text-lg text-white uppercase mb-2"
                >
                  {b.title}
                </h3>
                <p className="text-[#5A5A5A] text-sm leading-relaxed group-hover:text-[#7A7A7A] transition-colors duration-200">
                  {b.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-10 text-[#444] text-xs text-center max-w-2xl mx-auto leading-relaxed"
        >
          These statements describe general wellness benefits associated with infrared heat and exercise.
          They are not medical claims. Individual results may vary. Consult a healthcare professional
          with any medical concerns.
        </motion.p>
      </div>
    </section>
  );
}
