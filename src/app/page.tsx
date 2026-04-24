import { SectionLabel } from "@/components/SectionLabel";
import { Button } from "@/components/Button";
import { GoldDivider } from "@/components/GoldDivider";

export default function Home() {
  return (
    <main>
      <section className="min-h-[calc(100vh-5rem)] flex items-center px-6 md:px-10">
        <div className="mx-auto max-w-[1400px] w-full">
          <SectionLabel>Lumus Agency — Galway</SectionLabel>
          <h1 className="mt-10 font-display text-[clamp(3.5rem,10vw,8.75rem)] leading-[0.95] tracking-tightest">
            We light
            <br />
            <span className="italic text-gold">the way</span>.
          </h1>
          <p className="mt-10 max-w-xl border-l border-[var(--border-gold)] pl-6 font-sans font-light text-white/70 leading-body">
            A creative studio shaping editorial brands, thoughtful websites,
            social storytelling and motion. From Latin <em className="font-display italic text-gold">lumus</em>,
            meaning light.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Button href="/contact" variant="filled" size="lg">
              Start a Project
            </Button>
            <Button href="/work" variant="ghost" size="lg">
              See the Work
            </Button>
          </div>
          <GoldDivider width="short" className="mt-24" opacity="strong" />
          <p className="mt-6 text-[11px] uppercase tracking-cta text-white/40">
            Phase 1 — Base layout & shared components.
          </p>
        </div>
      </section>
    </main>
  );
}
