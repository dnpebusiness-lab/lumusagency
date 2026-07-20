import Link from 'next/link'
import { company } from '@/data/company'
import { footerLinks } from '@/data/navigation'

export default function Footer() {
  return (
    <footer className="bg-graphite text-ivory" role="contentinfo">

      {/* Main footer body */}
      <div className="container-editorial pt-16 pb-0 border-t border-white/8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-16 pb-14 border-b border-white/8">

          {/* Left: wordmark + tagline */}
          <div className="flex flex-col justify-between gap-10">
            <Link href="/" aria-label="City Hosting — Home">
              <p
                className="font-serif font-normal text-ivory/85 leading-none"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', letterSpacing: '-0.01em' }}
              >
                City Hosting
              </p>
            </Link>
            <div>
              <p className="font-sans text-xs text-ivory/40 leading-relaxed max-w-[30ch] mb-6">
                Professional holiday let management across Galway and the West of Ireland.
              </p>
              <address className="not-italic">
                <p className="font-sans text-xs text-ivory/30 leading-relaxed">
                  {company.address.line1}<br />
                  {company.address.city}, {company.address.eircode}
                </p>
              </address>
            </div>
          </div>

          {/* Right: nav + contact */}
          <div className="grid grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* Navigation */}
            <div>
              <p className="label-light mb-6">Pages</p>
              <nav aria-label="Footer navigation">
                <ul className="divide-y divide-white/8">
                  {footerLinks.primary.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block font-sans text-xs text-ivory/55 hover:text-ivory py-2.5 transition-colors duration-200"
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
              <p className="label-light mb-6">Contact</p>
              <address className="not-italic space-y-5">
                <div>
                  <a
                    href={company.contact.phoneHref}
                    className="font-serif text-base text-ivory/85 hover:text-gold transition-colors duration-200 block"
                  >
                    {company.contact.phoneInternational}
                  </a>
                </div>
                <div>
                  <a
                    href={company.contact.emailHref}
                    className="font-sans text-xs text-ivory/45 hover:text-ivory/75 transition-colors duration-200"
                  >
                    {company.contact.email}
                  </a>
                </div>
                <div className="pt-2">
                  <Link
                    href="/property-owners#enquiry"
                    className="inline-flex items-center gap-2 font-sans text-[0.65rem] uppercase tracking-[0.13em] text-gold/75 hover:text-gold transition-colors duration-200 group"
                  >
                    <span>Discuss your property</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
                  </Link>
                </div>
              </address>
            </div>
          </div>
        </div>
      </div>

      {/* Legal row */}
      <div className="container-editorial py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="font-sans text-[0.65rem] text-ivory/25 tracking-wide">
            © {new Date().getFullYear()} City Hosting. All rights reserved.
          </p>
          <nav aria-label="Legal navigation">
            <ul className="flex flex-wrap gap-x-5 gap-y-1">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-sans text-[0.65rem] text-ivory/25 hover:text-ivory/50 transition-colors duration-200"
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
