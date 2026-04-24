import type { Metadata } from "next";
import { ServicesHero } from "@/components/services/ServicesHero";
import { ServiceBlock, type Service } from "@/components/services/ServiceBlock";
import { FinalCTA } from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "Services — Lumus Agency",
  description:
    "Branding, web design, social media and motion graphics. Four disciplines, one editorial voice — crafted with intent by Lumus Agency.",
};

const SERVICES: Service[] = [
  {
    id: "branding",
    number: "01",
    eyebrow: "Identity · Editorial",
    title: "Brands that read like a headline.",
    description: [
      "A brand is a point of view before it is a logo. We work alongside founders and marketing leads to shape an identity that is precise, durable, and true to the work — built from a clear editorial position rather than a trend cycle.",
      "From naming to type pairing, from color systems to launch assets, every component is designed to age well and to feel considered in use. The goal is not to be loud; it is to be recognisable at a whisper.",
    ],
    deliverables: [
      "Logo system & wordmarks",
      "Naming & verbal identity",
      "Typography & color",
      "Brand guidelines",
      "Launch collateral",
      "Art direction",
    ],
    cta: { label: "Shape an identity", href: "/contact" },
  },
  {
    id: "web-design",
    number: "02",
    eyebrow: "UX · UI · Build",
    title: "Editorial websites, engineered to move.",
    description: [
      "We design websites that read like magazines — with a rhythm, a voice, and a sense of place. Then we build them on modern web foundations so they load fast, rank well, and scale with the brand.",
      "Our process pairs editorial craft with performance discipline: grid systems that breathe, typography that holds the page together, and motion that serves the story rather than decorate the frame.",
    ],
    deliverables: [
      "UX strategy & sitemap",
      "UI design & systems",
      "Next.js / React build",
      "Headless CMS integration",
      "Motion & micro-interactions",
      "SEO & performance",
    ],
    cta: { label: "Build a site", href: "/contact" },
  },
  {
    id: "social",
    number: "03",
    eyebrow: "Strategy · Content · Community",
    title: "Feeds that feel like publications.",
    description: [
      "Social should feel edited — not assembled. We treat a brand’s channels as a recurring title with a recognisable cover, a masthead, a point of view. That consistency is what turns followers into readers.",
      "We handle strategy, calendar, templates, copy and community — or plug into your team as an extension of it. Every post earns its place in the grid.",
    ],
    deliverables: [
      "Channel strategy",
      "Visual templates & grid",
      "Content calendar",
      "Copywriting",
      "Reels & short-form",
      "Community management",
    ],
    cta: { label: "Run our feed", href: "/contact" },
  },
  {
    id: "motion",
    number: "04",
    eyebrow: "Motion · Animation · VFX",
    title: "Motion with a point of view.",
    description: [
      "Motion earns attention when it has something to say. We design brand-led animation — from logo lifts to long-form product films — that extends the visual system rather than entertain around it.",
      "The tools are After Effects, Cinema 4D and Lottie; the language is editorial, restrained, intentional. Motion as punctuation, not as noise.",
    ],
    deliverables: [
      "Logo motion",
      "Brand reels & sizzles",
      "Social animations",
      "Product explainers",
      "Kinetic typography",
      "Seamless loops",
    ],
    cta: { label: "Animate our brand", href: "/contact" },
  },
];

export default function ServicesPage() {
  return (
    <main>
      <ServicesHero />
      {SERVICES.map((service, i) => (
        <ServiceBlock key={service.id} service={service} index={i} />
      ))}
      <FinalCTA />
    </main>
  );
}
