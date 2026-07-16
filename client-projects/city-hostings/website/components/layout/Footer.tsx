import Link from 'next/link'
import { company } from '@/data/company'
import { footerLinks } from '@/data/navigation'

export default function Footer() {
  return (
    <footer className="bg-graphite text-ivory" role="contentinfo">
      <div className="container-editorial pt-16 pb-10">

        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 pb-12 border-b border-white/10">

          {/* Brand */}
          <div>
            {/* TODO_CLIENT_INPUT: Replace with actual SVG/PNG logo */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 border border-ivory/30 flex items-center justify-center">
                <span className="font-serif text-xs text-ivory">CH</span>
              </div>
              <div>
                <p className="font-serif text-base leading-none tracking-wide text-ivory">
                  City Hosting
                </p>
                <p className="font-sans text-[8px] tracking-[0.2em] uppercase text-ivory/40 mt-0.5">
                  Professional Management
                </p>
              </div>
            </div>
            <p className="font-sans text-sm text-ivory/55 leading-relaxed max-w-xs">
              Professional holiday let and short-term rental management across Galway and the West of Ireland.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="label-light mb-5">Navigation</p>
            <nav aria-label="Footer navigation">
              <ul className="space-y-3">
                {footerLinks.primary.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-sans text-sm text-ivory/65 hover:text-ivory transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="label-light mb-5">Contact</p>
            <address className="not-italic space-y-4">
              <div>
                <p className="font-sans text-sm text-ivory/65 leading-relaxed">
                  {company.address.line1}<br />
                  {company.address.city}<br />
                  {company.address.eircode}<br />
                  {company.address.country}
                </p>
              </div>
              <div>
                <a
                  href={company.contact.phoneHref}
                  className="font-serif text-base text-ivory hover:text-gold transition-colors duration-200 block"
                >
                  {company.contact.phoneInternational}
                </a>
              </div>
              <div>
                <a
                  href={company.contact.emailHref}
                  className="font-sans text-sm text-ivory/65 hover:text-ivory transition-colors duration-200"
                >
                  {company.contact.email}
                </a>
              </div>
            </address>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8">
          <p className="font-sans text-xs text-ivory/35 tracking-wide">
            © {new Date().getFullYear()} City Hosting. All rights reserved.
          </p>
          <nav aria-label="Legal navigation">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-xs text-ivory/35 hover:text-ivory/60 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
