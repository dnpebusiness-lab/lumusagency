"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

export function PageTransition() {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(el, { display: "none" });
      return;
    }

    if (isFirst.current) {
      isFirst.current = false;
      gsap.fromTo(
        el,
        { yPercent: 0 },
        {
          yPercent: -100,
          duration: 1.1,
          ease: "power4.inOut",
          delay: 0.15,
          onComplete: () => gsap.set(el, { display: "none" }),
        },
      );
    } else {
      gsap.set(el, { yPercent: 100, display: "flex" });
      gsap.timeline()
        .to(el, { yPercent: 0, duration: 0.5, ease: "power4.out" })
        .to(el, {
          yPercent: -100,
          duration: 0.7,
          ease: "power4.inOut",
          delay: 0.1,
          onComplete: () => gsap.set(el, { display: "none" }),
        });
    }
  }, [pathname]);

  return (
    <div
      ref={overlayRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center bg-black"
    >
      <span className="font-display italic text-gold text-[2rem] tracking-tightest select-none">
        Lumus•
      </span>
    </div>
  );
}
