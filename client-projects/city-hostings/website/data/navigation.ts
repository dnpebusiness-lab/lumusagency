export const navLinks = [
  { label: 'Property Management', href: '/property-management' },
  { label: 'Services', href: '/services' },
  { label: 'Property Owners', href: '/property-owners' },
  { label: 'Book Direct', href: '/book-direct' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const

export const footerLinks = {
  primary: [
    { label: 'Property Management', href: '/property-management' },
    { label: 'Services', href: '/services' },
    { label: 'Property Owners', href: '/property-owners' },
    { label: 'Book Direct', href: '/book-direct' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Terms & Conditions', href: '/terms' },
  ],
} as const

export const primaryCTA = {
  label: 'Discuss Your Property',
  href: '/property-owners#enquiry',
} as const

export const secondaryCTA = {
  label: 'Book Direct',
  href: '/book-direct',
} as const
