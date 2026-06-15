"use client";
import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";

/**
 * Magnetic CTA with warm light response.
 * Cursor pulls the button slightly; a heat glow tracks the pointer
 * (the .btn-heat ::before in globals reads --mx / --my).
 */
export default function MagneticButton({
  children,
  href,
  variant = "fill",
  className = "",
}: {
  children: ReactNode;
  href: string;
  variant?: "fill" | "line";
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 });

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    el.style.setProperty("--mx", `${mx}px`);
    el.style.setProperty("--my", `${my}px`);
    if (reduce) return;
    x.set((mx - r.width / 2) * 0.22);
    y.set((my - r.height / 2) * 0.3);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const base =
    "btn-heat group inline-flex items-center justify-center gap-2.5 font-medium tracking-wide cursor-pointer select-none transition-colors duration-300";
  const styles =
    variant === "fill"
      ? "bg-ember text-[#1a0600] hover:bg-burnt px-8 py-4 text-[15px]"
      : "border border-line text-paper hover:border-burnt hover:text-burnt px-7 py-4 text-[15px]";

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </motion.a>
  );
}
