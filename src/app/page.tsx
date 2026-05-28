import { Hero } from "@/components/home/Hero";
import { MarqueeStrip } from "@/components/MarqueeStrip";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { StatsStrip } from "@/components/StatsStrip";
import { AboutPreview } from "@/components/home/AboutPreview";
import { WorkPreview } from "@/components/home/WorkPreview";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function Home() {
  return (
    <main>
      <Hero />
      <MarqueeStrip />
      <ServicesGrid />
      <StatsStrip />
      <AboutPreview />
      <WorkPreview />
      <FinalCTA />
    </main>
  );
}
