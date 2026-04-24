import { cn } from "@/lib/cn";

type GoldDividerProps = {
  className?: string;
  width?: "full" | "short" | "rule";
  orientation?: "horizontal" | "vertical";
  opacity?: "subtle" | "normal" | "strong";
};

const widths: Record<NonNullable<GoldDividerProps["width"]>, string> = {
  full: "w-full",
  short: "w-24",
  rule: "w-8",
};

const opacities: Record<NonNullable<GoldDividerProps["opacity"]>, string> = {
  subtle: "bg-[rgba(212,160,23,0.15)]",
  normal: "bg-[var(--border-gold)]",
  strong: "bg-gold",
};

export function GoldDivider({
  className,
  width = "full",
  orientation = "horizontal",
  opacity = "normal",
}: GoldDividerProps) {
  if (orientation === "vertical") {
    return (
      <span
        aria-hidden
        className={cn("inline-block w-px h-full", opacities[opacity], className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn("block h-px", widths[width], opacities[opacity], className)}
    />
  );
}
