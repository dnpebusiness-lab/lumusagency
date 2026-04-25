import { GoldDivider } from "@/components/GoldDivider";

const ITEMS = [
  {
    label: "Studio",
    value: "Galway, Ireland",
    sub: "Latitude 53.27°N",
  },
  {
    label: "Email",
    value: "hello@lumus.agency",
    href: "mailto:hello@lumus.agency",
    sub: "Replies within one working day",
  },
  {
    label: "Hours",
    value: "Mon — Fri",
    sub: "09:00 — 18:00 GMT",
  },
];

export function ContactInfo() {
  return (
    <aside className="flex flex-col gap-10">
      <div>
        <p className="text-eyebrow">Studio details</p>
        <p className="mt-6 font-sans font-light text-white/65 leading-body max-w-sm">
          We work with founders and operators worldwide, from a small editorial
          studio overlooking Galway Bay.
        </p>
      </div>

      <GoldDivider />

      <ul className="flex flex-col gap-8">
        {ITEMS.map((item) => (
          <li key={item.label} className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-cta text-white/40">
              {item.label}
            </span>
            {item.href ? (
              <a
                href={item.href}
                className="font-display text-2xl text-white hover:text-gold transition-colors duration-500"
              >
                {item.value}
              </a>
            ) : (
              <span className="font-display text-2xl text-white">
                {item.value}
              </span>
            )}
            <span className="text-[10px] uppercase tracking-cta text-white/40">
              {item.sub}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
