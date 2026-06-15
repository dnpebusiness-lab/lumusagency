"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star } from "lucide-react";

/*
  REPLACE: Replace these placeholder cards with real member reviews.
  Sources: Google Reviews, Facebook Reviews, or direct testimonials.
  Do NOT publish without replacing placeholders with genuine reviews.
*/

const placeholders = [
  {
    stars: 5,
    quote: "Add a real member review here.",
    name: "Member Name",
    label: "HOTWORX Galway Member",
    source: "Google Review",
  },
  {
    stars: 5,
    quote: "Add a Google review here.",
    name: "Member Name",
    label: "HOTWORX Galway Member",
    source: "Google Review",
  },
  {
    stars: 5,
    quote: "Add a transformation story here.",
    name: "Member Name",
    label: "HOTWORX Galway Member",
    source: "Member Story",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={13} className="text-[#FF6B00] fill-[#FF6B00]" />
      ))}
    </div>
  );
}

export default function SocialProofSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="reviews"
      ref={ref}
      className="relative py-28 sm:py-36 heat-border"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div>
            <p className="text-[#FF6B00] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
              Member Stories
            </p>
            <h2
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
              className="text-[clamp(36px,6vw,72px)] leading-tight text-white uppercase"
            >
              What members
              <br />
              <span className="text-[#444]">say about us.</span>
            </h2>
          </div>
          <a
            href="https://g.page/r/hotworx-galway/review"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 text-sm text-[#666] hover:text-[#FF6B00] transition-colors duration-200 cursor-pointer underline underline-offset-4"
          >
            Leave us a Google review
          </a>
        </motion.div>

        {/* Review cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {placeholders.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.1 + i * 0.1 }}
              className="glass-card p-7 rounded-sm"
            >
              <div className="flex items-center justify-between mb-5">
                <StarRating count={r.stars} />
                <span className="text-[#333] text-xs uppercase tracking-wider">
                  {r.source}
                </span>
              </div>
              <p className="text-[#444] italic text-sm leading-relaxed mb-6 min-h-[60px]">
                &ldquo;{r.quote}&rdquo;
              </p>
              <div className="pt-4 border-t border-[rgba(255,255,255,0.04)]">
                <p className="text-white text-sm font-semibold">{r.name}</p>
                <p className="text-[#444] text-xs mt-0.5">{r.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-14 pt-10 border-t border-[rgba(255,255,255,0.04)]"
        >
          {[
            { value: "24/7", label: "Member Access" },
            { value: "700+", label: "Studios Worldwide" },
            { value: "Free", label: "First Session" },
          ].map((t) => (
            <div key={t.label} className="text-center">
              <p
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
                className="text-[42px] leading-none gradient-text"
              >
                {t.value}
              </p>
              <p className="text-[#444] text-xs uppercase tracking-wider mt-1">
                {t.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
