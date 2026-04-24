import { cn } from "@/lib/cn";

type SectionLabelProps = {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center";
  as?: "p" | "span" | "div";
};

export function SectionLabel({
  children,
  className,
  align = "left",
  as: Tag = "p",
}: SectionLabelProps) {
  return (
    <Tag
      className={cn(
        "flex items-center gap-4 text-eyebrow",
        align === "center" && "justify-center",
        className,
      )}
    >
      <span aria-hidden className="h-px w-8 bg-gold" />
      <span>{children}</span>
    </Tag>
  );
}
