"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ChevronDown, Phone, MapPin, Clock } from "lucide-react";

/*
  REPLACE HERO IMAGE:
  Add a dark infrared-themed image/video at:
  /public/images/hero-bg.jpg  (or .mp4 for video)
  The current fallback uses a CSS gradient background.
*/

function HeatOrb() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouseX.set((e.clientX - cx) * 0.025);
      mouseY.set((e.clientY - cy) * 0.025);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      {/* Outer ambient ring */}
      <div
        className="absolute w-[700px] h-[700px] rounded-full opacity-[0.07]"
        style={{
          background:
            "radial-gradient(circle, #FFA94D 0%, #FF6B00 30%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      {/* Mid glow */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-[0.12]"
        style={{
          background:
            "radial-gradient(circle, #FF8C3A 0%, #FF6B00 40%, transparent 70%)",
          filter: "blur(50px)",
          animation: "heatShimmer 5s ease-in-out infinite",
        }}
      />
      {/* Core hot orb */}
      <div
        className="w-[180px] h-[180px] rounded-full opacity-[0.18]"
        style={{
          background:
            "radial-gradient(circle, #FFA94D 0%, #FF6B00 50%, rgba(255,107,0,0.1) 80%, transparent 100%)",
          filter: "blur(20px)",
          animation: "pulseGlow 3s ease-in-out infinite",
        }}
      />
    </motion.div>
  );
}

export default function HeroSection() {
  const [webglFailed, setWebglFailed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Test WebGL availability
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) setWebglFailed(true);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background layer */}
      <div className="absolute inset-0 bg-[#080808]" />

      {/* Cinematic gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,107,0,0.08) 0%, rgba(8,8,8,0) 70%)",
        }}
      />

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,107,0,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,107,0,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Heat orb 3D effect (CSS fallback — no heavy WebGL needed) */}
      <HeatOrb />

      {/* Scan line atmospheric effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.015]">
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, transparent, rgba(255,107,0,0.8), transparent)",
            animation: "scanLine 8s linear infinite",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-24">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 mb-8"
        >
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(255,107,0,0.25)] bg-[rgba(255,107,0,0.05)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-pulse" />
            <span className="text-[#FFA94D] text-xs font-semibold tracking-[0.15em] uppercase">
              Galway&apos;s Only 24/7 Infrared Studio
            </span>
          </div>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
          className="text-[clamp(52px,10vw,110px)] leading-[0.92] uppercase tracking-tight mb-6 text-white"
        >
          Galway&apos;s{" "}
          <span className="gradient-text">24/7</span>
          <br />
          Infrared
          <br />
          Fitness Studio
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-[#9A9A9A] text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed font-light"
        >
          Train in infrared heat, book around your schedule and get more from
          every session in less time.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          <a
            href="#book"
            className="group relative w-full sm:w-auto bg-[#FF6B00] hover:bg-[#FF8C3A] text-white font-bold px-10 py-4 uppercase tracking-[0.12em] transition-all duration-200 cursor-pointer overflow-hidden pulse-glow"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px" }}
          >
            <span className="relative z-10">Book Your Free Workout</span>
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
          </a>
          <a
            href="tel:0917600007"
            className="flex items-center justify-center gap-2 w-full sm:w-auto border border-[rgba(255,255,255,0.15)] hover:border-[rgba(255,107,0,0.4)] text-white hover:text-[#FF6B00] font-semibold px-8 py-4 transition-all duration-200 cursor-pointer uppercase tracking-wide"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px" }}
          >
            <Phone size={16} />
            Call 091 760 007
          </a>
        </motion.div>

        {/* Supporting details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-[#666]"
        >
          <div className="flex items-center gap-2">
            <MapPin size={13} className="text-[#FF6B00]" />
            <span>Tuam Road Retail Centre, Galway</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-[#FF6B00]" />
            <span>24-hour member access</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#FF6B00]">✓</span>
            <span>Free session for first-time guests</span>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#444] cursor-pointer"
        onClick={() => document.getElementById("insight")?.scrollIntoView({ behavior: "smooth" })}
      >
        <span className="text-xs uppercase tracking-[0.2em] font-medium">Scroll</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #080808)" }}
      />
    </section>
  );
}
