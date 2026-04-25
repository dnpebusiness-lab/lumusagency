import type { Metadata } from "next";
import { ContactHero } from "@/components/contact/ContactHero";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactInfo } from "@/components/contact/ContactInfo";
import { WhatsAppWidget } from "@/components/contact/WhatsAppWidget";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Contact — Lumus Agency",
  description:
    "Tell us about the brand, the audience and the ambition. Replies within one working day, from Galway.",
};

export default function ContactPage() {
  return (
    <main>
      <ContactHero />
      <section className="relative bg-dark px-6 md:px-10 py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <Reveal stagger={0.12} y={50} className="lg:col-span-7">
            <div>
              <p className="text-eyebrow">Project brief</p>
              <h2 className="mt-8 font-display tracking-tightest leading-[1.05] text-3xl md:text-4xl">
                Send us the broad strokes —
                <br />
                <span className="italic text-gold">
                  we&rsquo;ll come back with the questions
                </span>
                .
              </h2>
            </div>

            <div className="mt-14">
              <ContactForm />
            </div>
          </Reveal>

          <Reveal
            stagger={0.15}
            y={50}
            className="lg:col-span-5 lg:border-l lg:border-[var(--border-gold)] lg:pl-12 flex flex-col gap-12"
          >
            <ContactInfo />
            <WhatsAppWidget />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
