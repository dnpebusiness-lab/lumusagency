import type { SVGProps } from "react";
import { ArrowUpRight } from "lucide-react";

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "353871234567";
const PREFILL =
  "Hi Lumus — I'd like to talk about a project.";

function WhatsAppGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M3.5 20.5l1.4-4.2A8 8 0 1 1 8 19.6l-4.5 0.9z" />
      <path d="M9 9c.4 1.6 1.4 3 3 4 1 .7 2.2 1.2 3.4 1.2.6 0 1-.3 1.2-.7l.4-1c.1-.3 0-.6-.3-.7l-1.6-.7c-.3-.1-.6 0-.8.2l-.5.6c-.6-.3-1.4-.8-2-1.4-.6-.6-1.1-1.4-1.4-2l.6-.5c.2-.2.3-.5.2-.8L10.5 5.5c-.1-.3-.4-.4-.7-.3l-1 .4c-.4.2-.7.6-.7 1.2 0 .8.4 1.6.9 2.2z" />
    </svg>
  );
}

export function WhatsAppWidget() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PREFILL)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block bg-black border border-[var(--border-gold)] hover:border-gold transition-colors duration-700 p-8 md:p-10"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full bg-gold/[0.08] blur-[100px]"
      />

      <div className="relative flex items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold text-gold"
          >
            <WhatsAppGlyph className="h-5 w-5" />
          </span>
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2 text-[10px] uppercase tracking-cta-wide text-gold">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-gold animate-[ping_2s_ease-out_infinite]" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
              </span>
              Available now
            </span>
            <span className="font-display text-xl text-white">
              Chat on WhatsApp
            </span>
          </div>
        </div>

        <ArrowUpRight
          size={18}
          strokeWidth={1.3}
          className="text-gold opacity-70 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1"
        />
      </div>

      <p className="relative mt-6 font-sans font-light text-white/65 leading-body max-w-md">
        Prefer a faster reply? Send us a message on WhatsApp — typically
        answered within the hour, working Galway time.
      </p>

      <p className="relative mt-6 text-[10px] uppercase tracking-cta text-white/40">
        Direct line · Galway studio
      </p>
    </a>
  );
}
