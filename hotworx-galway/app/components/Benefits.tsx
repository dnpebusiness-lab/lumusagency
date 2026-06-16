"use client";
import { Reveal } from "./Reveal";
import ChapterHead from "./ChapterHead";

const outcomes = [
  { lead: "Recover", tail: "faster", note: "Designed to support muscle recovery after a hard week." },
  { lead: "Burn", tail: "more", note: "Working in infrared can help push calorie burn past the same class cold." },
  { lead: "Stay", tail: "consistent", note: "Short sessions you'll actually repeat — that's where it adds up." },
  { lead: "Ease", tail: "stress", note: "The heat and the quiet are made to take the edge off the day." },
  { lead: "Support", tail: "circulation", note: "Built to support healthy blood flow while you move." },
  { lead: "Sweat", tail: "it out", note: "A proper sweat that supports the body's own recovery." },
];

export default function Benefits() {
  return (
    <section id="benefits" className="relative border-t border-line py-28 sm:py-36">
      <div className="max-w-[1180px] mx-auto px-7 sm:px-14">
        <ChapterHead
          index="04"
          zone="Recovery & results"
          lines={[<>What the heat</>, <>does for you.</>]}
          className="mb-20 max-w-[16ch]"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-line">
          {outcomes.map((o, i) => (
            <Reveal
              key={o.lead + o.tail}
              delay={(i % 3) * 0.08}
              className="group relative border-r border-b border-line p-8 sm:p-9 hover:bg-panel/50 transition-colors duration-300"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 90% 100% at 50% 120%, rgba(255,59,31,0.10), transparent 70%)",
                }}
              />
              <p className="relative font-display font-extrabold text-[clamp(26px,3.6vw,42px)] leading-[0.95] tracking-tight text-paper">
                {o.lead}{" "}
                <span className="text-ember">{o.tail}</span>
              </p>
              <p className="relative mt-4 text-paper/50 text-[15px] leading-relaxed max-w-[34ch]">
                {o.note}
              </p>
            </Reveal>
          ))}
        </div>

        {/* REPLACE: swap srcs with real HOTWORX Galway photos */}
        <Reveal className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-12">
          <div className="relative overflow-hidden border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80"
              alt="Workout in infrared studio"
              className="w-full block"
              style={{ height: 280, objectFit: "cover", filter: "brightness(0.45) saturate(0.65)" }}
            />
            <div
              className="absolute bottom-0 left-0 right-0 p-6"
              style={{ background: "linear-gradient(to top, rgba(10,8,7,0.92), transparent)" }}
            >
              <p className="font-display font-extrabold text-[18px] tracking-tight">The session</p>
              <p className="text-ash text-[13px] mt-0.5">30 minutes inside the heat</p>
            </div>
          </div>
          <div className="relative overflow-hidden border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=80"
              alt="Recovery and stretch in warm studio"
              className="w-full block"
              style={{ height: 280, objectFit: "cover", filter: "brightness(0.45) saturate(0.65)" }}
            />
            <div
              className="absolute bottom-0 left-0 right-0 p-6"
              style={{ background: "linear-gradient(to top, rgba(10,8,7,0.92), transparent)" }}
            >
              <p className="font-display font-extrabold text-[18px] tracking-tight">The recovery</p>
              <p className="text-ash text-[13px] mt-0.5">What the infrared keeps doing after</p>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <p className="mt-8 text-ash/70 text-[12.5px] leading-relaxed max-w-[64ch]">
            These describe general wellness benefits of infrared training and
            exercise — not medical claims, and results vary with what you put
            in. Anything to do with your health, talk to your GP first.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
