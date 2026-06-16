"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

// Custom easing — deliberate, not a default Framer preset.
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Element reveal: rises and clears with a controlled ease.
 * Used for blocks, panels, images.
 */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Mask reveal for headlines: a clip-path wipe with light passing across.
 * Lines reveal from behind a "sauna door" edge.
 */
export function MaskLines({
  lines,
  className,
  stagger = 0.09,
}: {
  lines: ReactNode[];
  className?: string;
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <span className={className} style={{ display: "block" }}>
      {lines.map((line, i) => (
        <span
          key={i}
          style={{ display: "block", overflow: "hidden", paddingBottom: "0.06em" }}
        >
          <motion.span
            style={{ display: "block" }}
            initial={reduce ? false : { y: "110%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 1, ease: EASE, delay: i * stagger }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
