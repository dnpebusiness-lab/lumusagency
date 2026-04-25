import type { Metadata } from "next";
import { AgencyHero } from "@/components/agency/AgencyHero";
import { AgencyStory } from "@/components/agency/AgencyStory";
import { DesignPrinciples } from "@/components/agency/DesignPrinciples";
import { VisionMission } from "@/components/agency/VisionMission";
import { FinalCTA } from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "The Agency — Lumus",
  description:
    "Lumus is an editorial creative studio in Galway, Ireland. Our story, our six design principles, and what we are here to make.",
};

export default function AgencyPage() {
  return (
    <main>
      <AgencyHero />
      <AgencyStory />
      <DesignPrinciples />
      <VisionMission />
      <FinalCTA />
    </main>
  );
}
