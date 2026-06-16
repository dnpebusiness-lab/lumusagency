"use client";
import { Phone } from "lucide-react";
import { Reveal, MaskLines } from "./Reveal";
import LeadForm from "./LeadForm";
import MagneticButton from "./MagneticButton";

export default function FinalCTA() {
  return (
    <section id="book" className="relative border-t border-line overflow-hidden">
      {/* the door opening — warm light spills in from the top */}
      <div
        className="absolute inset-x-0 top-0 h-[60%] pointer-events-none haze"
        style={{
          background:
            "radial-gradient(ellipse 70% 100% at 50% 0%, rgba(255,59,31,0.16), rgba(255,106,44,0.05) 40%, transparent 70%)",
        }}
      />

      <div className="relative max-w-[1180px] mx-auto px-7 sm:px-14 py-28 sm:py-36">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
          {/* copy */}
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <p className="chapter mb-7 flex items-center gap-3">
                <span className="font-display font-bold text-ember">05</span>
                <span className="inline-block w-8 h-px bg-line" />
                The door is open
              </p>
            </Reveal>
            <h2 className="h-sec text-[clamp(42px,8vw,104px)] text-paper heat-text">
              <MaskLines
                lines={[
                  <>Try it</>,
                  <>
                    for <span className="text-ember">free.</span>
                  </>,
                ]}
              />
            </h2>
            <Reveal delay={0.15}>
              <p className="mt-8 text-paper/60 text-[17px] max-w-[40ch] leading-relaxed">
                Book your first session during staffed hours and feel infrared
                training for yourself. No card, no pressure.
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <div className="mt-9 flex flex-wrap gap-3">
                <MagneticButton href="tel:0917600007" variant="line">
                  <Phone size={15} /> 091 760 007
                </MagneticButton>
              </div>
            </Reveal>
            <Reveal delay={0.35}>
              <div className="mt-10 border-t border-line max-w-sm">
                {[
                  ["Mon – Thu", "11am – 8pm"],
                  ["Friday", "9am – 6pm"],
                  ["Saturday", "9am – 2pm"],
                ].map(([d, t]) => (
                  <div key={d} className="flex justify-between py-2.5 border-b border-line text-[14px]">
                    <span className="text-ash">{d}</span>
                    <span className="text-paper">{t}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* form */}
          <Reveal delay={0.1} className="border border-line bg-panel/50 p-8 sm:p-10">
            <h3 className="font-display font-extrabold text-2xl tracking-tight text-paper mb-1">
              Book your free session
            </h3>
            <p className="text-ash text-[14px] mb-8">
              Leave your details — we&apos;ll be in touch to sort a time.
            </p>
            <LeadForm />
            <div className="mt-7 pt-6 border-t border-line">
              <a
                href="tel:0917600007"
                className="text-ash text-sm hover:text-paper transition-colors cursor-pointer"
              >
                Rather talk? Call the studio on 091 760 007 →
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
