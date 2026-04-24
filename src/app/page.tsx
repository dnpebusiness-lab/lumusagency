import { Hero } from "@/components/home/Hero";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { AboutPreview } from "@/components/home/AboutPreview";
import { WorkPreview } from "@/components/home/WorkPreview";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function Home() {
  return (
    <main>
      <Hero />
      <ServicesGrid />
      <AboutPreview />
      <WorkPreview />
      <FinalCTA />
    </main>
  );
}
