"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { Phone, MapPin, Clock, ArrowRight } from "lucide-react";
import { MaskLines } from "./Reveal";
import MagneticButton from "./MagneticButton";

// 3D never blocks first paint.
const InfraredCore = dynamic(() => import("./three/InfraredCore"), {
  ssr: false,
  loading: () => null,
});

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export default function HeroChamber() {
  const reduce = useReducedMotion();
  const [use3D, setUse3D] = useState(false);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!reduce && hasWebGL()) setUse3D(true);
  }, [reduce]);

  // Pause the shader when the hero scrolls offscreen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setPaused(!e.isIntersecting),
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <header
      ref={ref}
      className="relative min-h-[100svh] flex items-end overflow-hidden pb-[9vh] pt-28"
    >
      {/* Layer 1: 3D infrared field, or static fallback */}
      <div className="absolute inset-0 z-0">
        {use3D ? (
          <InfraredCore paused={paused} />
        ) : (
          // Static WebGL / reduced-motion fallback — designed, not a blank.
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 55% at 62% 30%, rgba(255,59,31,0.28), rgba(255,106,44,0.10) 38%, #0A0807 70%)",
            }}
          />
        )}
      </div>

      {/* Layer 2: heat haze + edge darkening so type stays readable */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, #0A0807 4%, rgba(10,8,7,0.4) 30%, rgba(10,8,7,0.15) 55%, rgba(10,8,7,0.6) 100%)",
        }}
      />
      {/* Layer 3: chamber frame lines (subtle architecture) */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute left-6 sm:left-10 top-0 bottom-0 w-px bg-line" />
        <div className="absolute right-6 sm:right-10 top-0 bottom-0 w-px bg-line" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1180px] mx-auto px-7 sm:px-14">
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="chapter mb-7 flex items-center gap-3"
        >
          <span className="inline-block w-8 h-px bg-ember" />
          Tuam Road, Galway — <b>open 24 hours</b>
        </motion.p>

        <h1 className="h-mega heat-text text-[clamp(54px,11vw,150px)] text-paper">
          <MaskLines
            lines={[
              <>Train hot.</>,
              <>
                Finish <span className="text-ember">fast.</span>
              </>,
            ]}
          />
        </h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 max-w-[42ch] text-[clamp(16px,2vw,20px)] text-paper/70"
        >
          Galway&apos;s only 24/7 infrared studio. Fifteen or thirty minutes
          inside the heat, booked from your phone, open whenever you are. Your
          first session is free.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <MagneticButton href="#book" variant="fill">
            Book your free workout
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </MagneticButton>
          <MagneticButton href="tel:0917600007" variant="line">
            <Phone size={15} /> 091 760 007
          </MagneticButton>
        </motion.div>

        {/* Architectural stat row */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.9 }}
          className="mt-14 flex flex-wrap border-t border-line"
        >
          {[
            { k: "15–30", v: "Minutes a class", icon: <Clock size={13} /> },
            { k: "3", v: "People per sauna", icon: null },
            { k: "24/7", v: "Members in anytime", icon: null },
            { k: "Free", v: "First session", icon: <MapPin size={13} /> },
          ].map((s) => (
            <div
              key={s.v}
              className="pr-7 mr-7 py-5 border-r border-line last:border-r-0 last:mr-0 last:pr-0"
            >
              <div className="font-display font-extrabold text-[26px] leading-none text-paper">
                {s.k}
              </div>
              <div className="mt-1.5 text-[11px] tracking-[0.14em] uppercase text-ash">
                {s.v}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </header>
  );
}
