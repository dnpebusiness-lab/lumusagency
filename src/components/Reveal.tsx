"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type RevealProps = {
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  duration?: number;
  stagger?: number;
  start?: string;
  once?: boolean;
};

export function Reveal({
  children,
  className,
  y = 40,
  delay = 0,
  duration = 1,
  stagger,
  start = "top 85%",
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const useStagger = typeof stagger === "number";
      const targets: Element[] | HTMLDivElement = useStagger
        ? (Array.from(el.children) as Element[])
        : el;

      if (reduced) {
        gsap.set(targets, { opacity: 1, y: 0, clearProps: "transform,opacity" });
        return;
      }

      gsap.set(targets, { opacity: 0, y });

      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration,
        delay,
        stagger: useStagger ? stagger : 0,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start, once },
      });
    }, el);

    return () => ctx.revert();
  }, [y, delay, duration, stagger, start, once]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
