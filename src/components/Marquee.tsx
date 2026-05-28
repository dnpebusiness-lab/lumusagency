"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/cn";

type MarqueeProps = {
  items: string[];
  speed?: number;
  separator?: string;
  className?: string;
  itemClassName?: string;
  separatorClassName?: string;
};

export function Marquee({
  items,
  speed = 80,
  separator = "·",
  className,
  itemClassName,
  separatorClassName,
}: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const totalWidth = track.scrollWidth / 2;
    const tween = gsap.to(track, {
      x: -totalWidth,
      duration: totalWidth / speed,
      ease: "none",
      repeat: -1,
    });

    return () => {
      tween.kill();
    };
  }, [speed]);

  const doubled = [...items, ...items];

  return (
    <div className={cn("overflow-hidden select-none", className)}>
      <div
        ref={trackRef}
        className="flex items-center whitespace-nowrap will-change-transform"
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center shrink-0">
            <span className={itemClassName}>{item}</span>
            <span
              aria-hidden
              className={cn("mx-10 inline-block", separatorClassName)}
            >
              {separator}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
