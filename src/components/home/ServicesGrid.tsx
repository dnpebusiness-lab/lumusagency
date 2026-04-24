"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import {
  Feather,
  Monitor,
  MessageCircle,
  Film,
  ArrowRight,
} from "lucide-react";
import { SectionLabel } from "@/components/SectionLabel";
import type { LucideIcon } from "lucide-react";

type Service = {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tags: string[];
  href: string;
};

const SERVICES: Service[] = [
  {
    number: "01",
    title: "Branding",
    description:
      "Identity systems with editorial tone. Logos, naming, typography and guidelines built to last a decade.",
    icon: Feather,
    tags: ["Identity", "Naming", "Type", "Guidelines"],
    href: "/services#branding",
  },
  {
    number: "02",
    title: "Web Design",
    description:
      "Editorial websites that feel like magazines — engineered for performance, built for story.",
    icon: Monitor,
    tags: ["UX", "UI", "Next.js", "Motion"],
    href: "/services#web-design",
  },
  {
    number: "03",
    title: "Social Media",
    description:
      "A consistent visual language that turns a feed into a publication people pause on.",
    icon: MessageCircle,
    tags: ["Strategy", "Content", "Templates", "Copy"],
    href: "/services#social",
  },
  {
    number: "04",
    title: "Motion Graphics",
    description:
      "Motion with intent. Brand-led animation that earns attention instead of demanding it.",
    icon: Film,
    tags: ["Animation", "Reels", "VFX", "Loops"],
    href: "/services#motion",
  },
];

export function ServicesGrid() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set("[data-services-head] > *", { opacity: 0, y: 40 });
      gsap.set("[data-services-card]", { opacity: 0, y: 60 });

      gsap.to("[data-services-head] > *", {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-services-head]",
          start: "top 80%",
          once: true,
        },
      });

      gsap.to("[data-services-card]", {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-services-grid]",
          start: "top 80%",
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="services"
      className="relative bg-dark px-6 md:px-10 py-28 md:py-40"
    >
      <div className="mx-auto max-w-[1400px]">
        <div
          data-services-head
          className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-end"
        >
          <div className="md:col-span-5">
            <SectionLabel>01 — Services</SectionLabel>
          </div>
          <h2 className="md:col-span-7 font-display text-4xl md:text-6xl lg:text-7xl tracking-tightest leading-[1.02]">
            Four disciplines,
            <br />
            <span className="italic text-gold">one coherent voice</span>.
          </h2>
        </div>

        <div
          data-services-grid
          className="mt-20 md:mt-28 grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--border-gold)]"
        >
          {SERVICES.map((service) => (
            <ServiceCard key={service.number} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon;
  return (
    <Link
      data-services-card
      href={service.href}
      className="group relative bg-dark hover:bg-black/70 transition-colors duration-500 ease-[cubic-bezier(0.215,0.61,0.355,1)] p-10 md:p-14 flex flex-col gap-10 min-h-[360px]"
    >
      <div className="flex items-start justify-between">
        <span className="font-display text-xl text-white/40 tracking-tight">
          {service.number}
        </span>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-gold)] text-gold transition-colors duration-500 group-hover:border-gold group-hover:text-gold-bright">
          <Icon size={18} strokeWidth={1.3} />
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <h3 className="font-display text-3xl md:text-4xl tracking-tightest leading-[1.05]">
          {service.title}
        </h3>
        <p className="font-sans font-light text-white/60 leading-body max-w-md">
          {service.description}
        </p>
      </div>

      <div className="flex items-end justify-between gap-6">
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] uppercase tracking-cta text-white/40">
          {service.tags.map((tag, i) => (
            <li key={tag} className="flex items-center gap-4">
              {i > 0 && <span aria-hidden className="h-px w-3 bg-gold/40" />}
              <span>{tag}</span>
            </li>
          ))}
        </ul>
        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-cta-wide text-white/70 group-hover:text-gold transition-colors duration-500 shrink-0">
          Explore
          <ArrowRight
            size={14}
            className="translate-x-0 group-hover:translate-x-1 transition-transform duration-500"
          />
        </span>
      </div>
    </Link>
  );
}
