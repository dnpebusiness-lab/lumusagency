"use client";
import type { ReactNode } from "react";
import { MaskLines, Reveal } from "./Reveal";

/** Section opener: zone index + masked headline. Keeps every chapter consistent. */
export default function ChapterHead({
  index,
  zone,
  lines,
  className = "",
  align = "left",
}: {
  index: string;
  zone: string;
  lines: ReactNode[];
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`${align === "center" ? "text-center" : ""} ${className}`}>
      <Reveal>
        <p className="chapter mb-6 flex items-center gap-3" style={align === "center" ? { justifyContent: "center" } : undefined}>
          <span className="font-display font-bold text-ember not-italic">{index}</span>
          <span className="inline-block w-8 h-px bg-line" />
          {zone}
        </p>
      </Reveal>
      <h2 className="h-sec text-[clamp(36px,6.5vw,92px)] text-paper">
        <MaskLines lines={lines} />
      </h2>
    </div>
  );
}
