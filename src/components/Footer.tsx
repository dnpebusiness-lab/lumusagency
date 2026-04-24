import Link from "next/link";
import { SectionLabel } from "./SectionLabel";
import { GoldDivider } from "./GoldDivider";
import { InstagramIcon, LinkedInIcon, BehanceIcon } from "./SocialIcons";

const NAV = [
  { label: "The Agency", href: "/agency" },
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "Contact", href: "/contact" },
];

const SOCIAL = [
  { label: "Instagram", href: "https://instagram.com/", icon: InstagramIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/", icon: LinkedInIcon },
  { label: "Behance", href: "https://www.behance.net/", icon: BehanceIcon },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-black text-white">
      <GoldDivider />
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 pt-24 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-6">
            <SectionLabel>We light the way</SectionLabel>
            <h2 className="mt-8 font-display text-5xl md:text-6xl lg:text-7xl leading-[0.95]">
              Let&rsquo;s craft something
              <br />
              <span className="italic text-gold">luminous</span>.
            </h2>
            <div className="mt-10 flex items-center gap-4">
              <span className="h-px w-8 bg-gold" />
              <Link
                href="/contact"
                className="font-sans font-medium text-[11px] uppercase tracking-cta-wide text-white hover:text-gold transition-colors duration-500"
              >
                Start a Project
              </Link>
            </div>
          </div>

          <div className="lg:col-span-3 lg:col-start-8">
            <p className="text-eyebrow mb-6">Navigate</p>
            <ul className="flex flex-col gap-3">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-display text-2xl text-white/80 hover:text-gold transition-colors duration-500"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="text-eyebrow mb-6">Studio</p>
            <address className="not-italic font-sans font-light text-white/70 leading-body">
              Galway, Ireland
              <br />
              Latitude 53.27°N
              <br />
              <a
                href="mailto:hello@lumus.agency"
                className="hover:text-gold transition-colors duration-500"
              >
                hello@lumus.agency
              </a>
            </address>

            <div className="mt-8 flex items-center gap-4">
              {SOCIAL.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-10 w-10 border border-[var(--border-gold)] text-white/70 hover:text-gold hover:border-gold transition-colors duration-500"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <GoldDivider className="mt-24" />

        <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-[11px] uppercase tracking-cta text-white/50">
          <p>
            © {year} Lumus Agency — Crafted in Galway.
          </p>
          <p className="flex items-center gap-3">
            <span>From latin</span>
            <span className="text-gold italic normal-case tracking-normal font-display text-base">
              lumus
            </span>
            <span>— light.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
