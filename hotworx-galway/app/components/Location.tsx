"use client";
import { MapPin, Car, Phone, Navigation } from "lucide-react";
import { Reveal } from "./Reveal";
import ChapterHead from "./ChapterHead";
import MagneticButton from "./MagneticButton";

const access = [
  { icon: MapPin, text: "Ground floor, across from the Travelodge, beside Wayfair" },
  { icon: Car, text: "Free parking right outside — no city-centre circling" },
  { icon: Phone, text: "091 760 007" },
];

const hours = [
  ["Mon – Thu", "11am – 8pm"],
  ["Friday", "9am – 6pm"],
  ["Saturday", "9am – 2pm"],
];

export default function Location() {
  return (
    <section id="location" className="relative border-t border-line py-28 sm:py-36">
      <div className="max-w-[1180px] mx-auto px-7 sm:px-14">
        <ChapterHead
          index="—"
          zone="Find the chamber"
          lines={[<>Tuam Road.</>, <>Park at the door.</>]}
          className="mb-20 max-w-[16ch]"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Map panel */}
          <Reveal className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[440px] border border-line overflow-hidden bg-ink-2">
            {/* map grid */}
            <div
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent 0 47px, rgba(255,59,31,0.06) 47px 48px), repeating-linear-gradient(90deg, transparent 0 47px, rgba(255,59,31,0.05) 47px 48px)",
              }}
            />
            {/* warm glow at marker */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 56% 44%, rgba(255,59,31,0.18), transparent 45%)",
              }}
            />
            {/* pulsing marker */}
            <div className="absolute top-[44%] left-[56%]">
              <span className="ir-ring absolute -inset-3 rounded-full border border-ember" />
              <span className="ir-ring absolute -inset-3 rounded-full border border-ember [animation-delay:1.3s]" />
              <span className="relative block w-4 h-4 rounded-full bg-ember ring-4 ring-ember/20" />
            </div>
            {/* label */}
            <div className="absolute bottom-5 left-5 right-5">
              <p className="font-display font-bold text-paper text-lg tracking-tight">
                HOTWORX Galway
              </p>
              <p className="text-ash text-sm">
                Tuam Road Retail Centre · H91 YH39
              </p>
              {/* REPLACE: swap this designed placeholder for a real embedded map
                  (Google Maps iframe / Mapbox) before launch. */}
            </div>
          </Reveal>

          {/* Details */}
          <Reveal delay={0.1} className="border border-line p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <ul className="space-y-5">
                {access.map((a) => {
                  const Icon = a.icon;
                  return (
                    <li key={a.text} className="flex items-start gap-4">
                      <Icon size={18} className="text-ember mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                      <span className="text-paper/70 text-[16px] leading-snug">
                        {a.text}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-10 pt-8 border-t border-line">
                <p className="chapter mb-5">Front desk staffed</p>
                {hours.map(([d, t]) => (
                  <div
                    key={d}
                    className="flex justify-between py-2.5 border-b border-line last:border-0 text-[15px]"
                  >
                    <span className="text-ash">{d}</span>
                    <span className="text-paper">{t}</span>
                  </div>
                ))}
                <p className="mt-4 text-paper/45 text-sm leading-relaxed">
                  Members get in 24/7, seven days. Staffed hours are for first
                  visits and sign-ups — that&apos;s when your free session runs.
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <MagneticButton
                href="https://maps.google.com/?q=Tuam+Road+Retail+Centre+Galway"
                variant="line"
              >
                <Navigation size={15} /> Open in Maps
              </MagneticButton>
              <MagneticButton href="tel:0917600007" variant="fill">
                Call studio
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
