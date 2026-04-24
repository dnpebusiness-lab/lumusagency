"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type Service = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  description: string[];
  deliverables: string[];
  cta: {
    label: string;
    href: string;
  };
};

type ServiceBlockProps = {
  service: Service;
  index: number;
};

export function ServiceBlock({ service, index }: ServiceBlockProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const dark = index % 2 === 0;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set("[data-sb-reveal]", { opacity: 0, y: 50 });
      gsap.set("[data-sb-rule]", { scaleX: 0, transformOrigin: "left center" });
      gsap.set("[data-sb-number]", { opacity: 0, y: 40 });
      gsap.set("[data-sb-deliverable]", { opacity: 0, y: 20 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: el,
          start: "top 70%",
          once: true,
        },
      });

      tl.to("[data-sb-number]", { opacity: 0.85, y: 0, duration: 1.1, ease: "power4.out" })
        .to(
          "[data-sb-reveal]",
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 },
          0.1,
        )
        .to(
          "[data-sb-rule]",
          { scaleX: 1, duration: 1.1, ease: "power4.inOut" },
          0.3,
        )
        .to(
          "[data-sb-deliverable]",
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.06 },
          0.6,
        );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id={service.id}
      className={`relative px-6 md:px-10 py-28 md:py-40 overflow-hidden ${
        dark ? "bg-dark" : "bg-black"
      }`}
    >
      <span
        aria-hidden
        data-sb-number
        className="pointer-events-none absolute -right-4 md:right-8 top-8 md:top-12 font-display italic text-gold/10 text-[clamp(12rem,28vw,28rem)] leading-none tracking-tightest select-none"
      >
        {service.number}
      </span>

      <div className="relative mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-7">
            <p data-sb-reveal className="text-eyebrow">
              Service {service.number} — {service.eyebrow}
            </p>

            <h2
              data-sb-reveal
              className="mt-8 font-display tracking-tightest leading-[1.02] text-4xl md:text-6xl lg:text-7xl"
            >
              {service.title}
            </h2>

            <div
              data-sb-rule
              aria-hidden
              className="mt-10 h-px w-16 bg-gold"
            />

            <div
              data-sb-reveal
              className="mt-10 space-y-6 max-w-xl font-sans font-light text-white/65 leading-body"
            >
              {service.description.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div data-sb-reveal className="mt-12">
              <Link
                href={service.cta.href}
                className="group inline-flex items-center gap-4 text-[11px] uppercase tracking-cta-wide text-white hover:text-gold transition-colors duration-500"
              >
                <span className="h-px w-8 bg-gold transition-all duration-500 group-hover:w-14" />
                {service.cta.label}
                <ArrowRight
                  size={14}
                  className="text-gold transition-transform duration-500 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>

          <div className="md:col-span-5 md:pl-8 lg:pl-12 md:border-l md:border-[var(--border-gold)]">
            <p data-sb-reveal className="text-eyebrow">
              Deliverables
            </p>
            <ul className="mt-8 flex flex-col">
              {service.deliverables.map((item, i) => (
                <li
                  key={item}
                  data-sb-deliverable
                  className={`py-4 flex items-center gap-5 ${
                    i > 0 ? "border-t border-[var(--border-gold)]" : ""
                  }`}
                >
                  <span className="font-display italic text-gold/80 text-sm w-8 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-sans font-light text-white/80">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
