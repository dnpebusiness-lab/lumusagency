"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, label, [data-cursor="hover"]';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.classList.add("has-custom-cursor");

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });

    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.55, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.55, ease: "power3.out" });

    let visible = false;

    const onMove = (e: MouseEvent) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
      if (!visible) {
        visible = true;
        gsap.to([dot, ring], { opacity: 1, duration: 0.4, ease: "power3.out" });
      }
    };

    const onLeave = () => {
      visible = false;
      gsap.to([dot, ring], { opacity: 0, duration: 0.3, ease: "power3.out" });
    };

    const onDown = () => {
      gsap.to(ring, { scale: 0.7, duration: 0.25, ease: "power3.out" });
    };
    const onUp = () => {
      gsap.to(ring, { scale: 1, duration: 0.25, ease: "power3.out" });
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (target && target.closest(INTERACTIVE_SELECTOR)) {
        gsap.to(ring, {
          scale: 1.6,
          borderColor: "var(--gold)",
          duration: 0.35,
          ease: "power3.out",
        });
        gsap.to(dot, { scale: 0, duration: 0.25, ease: "power3.out" });
      } else {
        gsap.to(ring, {
          scale: 1,
          borderColor: "var(--border-gold)",
          duration: 0.35,
          ease: "power3.out",
        });
        gsap.to(dot, { scale: 1, duration: 0.25, ease: "power3.out" });
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mouseover", onOver);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[100] h-10 w-10 rounded-full border border-[var(--border-gold)] mix-blend-difference"
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[100] h-[12px] w-[12px] rounded-full bg-gold"
      />
    </>
  );
}
