import type { Metadata } from "next";
import { WorkHero } from "@/components/work/WorkHero";
import { WorkGrid } from "@/components/work/WorkGrid";
import { FinalCTA } from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "Work — Lumus Agency",
  description:
    "Selected projects from the Lumus archive. Editorial brands, websites, social and motion crafted in Galway.",
};

export default function WorkPage() {
  return (
    <main>
      <WorkHero />
      <WorkGrid />
      <FinalCTA />
    </main>
  );
}
