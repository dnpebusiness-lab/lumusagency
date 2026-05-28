import type { Metadata } from "next";
import { AgencyHero } from "@/components/agency/AgencyHero";
import { AgencyStory } from "@/components/agency/AgencyStory";
import { ProcessSection } from "@/components/agency/ProcessSection";
import { DesignPrinciples } from "@/components/agency/DesignPrinciples";
import { VisionMission } from "@/components/agency/VisionMission";
import { FinalCTA } from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "The Agency",
  description:
    "Lumus is an editorial creative studio in Galway, Ireland. Our story, our six design principles, and what we are here to make.",
  alternates: { canonical: "/agency" },
  openGraph: {
    title: "The Agency — Lumus Agency",
    description:
      "An editorial creative studio in Galway, Ireland. Story, principles, and what we make.",
    url: "/agency",
    type: "website",
  },
};

export default function AgencyPage() {
  return (
    <main>
      <AgencyHero />
      <AgencyStory />
      <ProcessSection />
      <DesignPrinciples />
      <VisionMission />
      <FinalCTA />
    </main>
  );
}
