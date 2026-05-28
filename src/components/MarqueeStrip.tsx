import { Marquee } from "@/components/Marquee";

const PHRASES = [
  "Branding",
  "Web Design",
  "Social Media",
  "Motion Graphics",
  "Editorial Identity",
  "We Light the Way",
  "Galway · Ireland",
  "Est. 2025",
];

export function MarqueeStrip() {
  return (
    <div className="border-y border-[var(--border-gold)] bg-black py-3 overflow-hidden">
      <Marquee
        items={PHRASES}
        speed={55}
        separator="·"
        itemClassName="font-display italic text-gold/60 text-xl tracking-tightest"
        separatorClassName="font-display text-gold/30 text-lg"
      />
    </div>
  );
}
