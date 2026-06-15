"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Phone, Mail } from "lucide-react";
import LeadForm from "./LeadForm";

export default function FinalCTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="book"
      ref={ref}
      className="relative py-28 sm:py-36 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[#0A0A0A]" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,107,0,0.07) 0%, transparent 70%)",
        }}
      />
      {/* Top line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,107,0,0.4) 30%, rgba(255,169,77,0.7) 50%, rgba(255,107,0,0.4) 70%, transparent 100%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          {/* Left: copy */}
          <div className="lg:sticky lg:top-24">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-[#FF6B00] text-xs font-semibold tracking-[0.2em] uppercase mb-5"
            >
              Free First Session
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.1 }}
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
              className="text-[clamp(42px,7vw,80px)] leading-[0.9] uppercase text-white mb-6"
            >
              Try HOTWORX
              <br />
              <span className="gradient-text">Galway</span>
              <br />
              for free.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-[#7A7A7A] text-base leading-relaxed mb-10 max-w-sm"
            >
              Book your first session during staffed hours and experience
              infrared training for yourself. No commitment required.
            </motion.p>

            {/* Contact options */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-3 mb-8"
            >
              <a
                href="tel:0917600007"
                className="flex items-center gap-3 text-[#666] hover:text-white transition-colors duration-200 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-sm bg-[rgba(255,107,0,0.06)] border border-[rgba(255,107,0,0.12)] flex items-center justify-center group-hover:bg-[rgba(255,107,0,0.12)] transition-all duration-200">
                  <Phone size={14} className="text-[#FF6B00]" />
                </div>
                <span className="text-sm">091 760 007</span>
              </a>
              <div className="flex items-center gap-3 text-[#666]">
                <div className="w-9 h-9 rounded-sm bg-[rgba(255,107,0,0.06)] border border-[rgba(255,107,0,0.12)] flex items-center justify-center">
                  <Mail size={14} className="text-[#FF6B00]" />
                </div>
                {/* REPLACE: Add studio email here when available */}
                <span className="text-sm text-[#333]">Email address — add here</span>
              </div>
            </motion.div>

            {/* Staffed hours reminder */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="p-4 bg-[rgba(255,107,0,0.04)] border border-[rgba(255,107,0,0.1)] rounded-sm"
            >
              <p className="text-[#FF6B00] text-xs font-semibold uppercase tracking-wider mb-2">
                Staffed Hours
              </p>
              <div className="space-y-1 text-xs text-[#555]">
                <div className="flex justify-between">
                  <span>Mon – Thu</span><span>11am – 8pm</span>
                </div>
                <div className="flex justify-between">
                  <span>Friday</span><span>9am – 6pm</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span><span>9am – 2pm</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="glass-card p-8 sm:p-10 rounded-sm"
          >
            <h3
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
              className="text-2xl text-white uppercase mb-1"
            >
              Request Your Free Session
            </h3>
            <p className="text-[#555] text-sm mb-8">
              Fill in your details below and we&apos;ll get back to you to arrange
              everything.
            </p>
            <LeadForm />
            <p className="mt-5 text-[#2A2A2A] text-xs leading-relaxed">
              Free session available for first-time local guests during staffed
              hours. Terms may apply.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
