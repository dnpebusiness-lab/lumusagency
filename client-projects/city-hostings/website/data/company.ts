export const company = {
  name: 'City Hosting',
  tagline: 'Professional holiday let management across Galway and the West of Ireland.',
  description:
    'City Hosting provides professional holiday let and short-term rental management for property owners across Galway and the West of Ireland — handling everything from guest communication to property care, so owners can host with confidence.',
  address: {
    line1: 'Unit 4, Tuam Road',
    city: 'Galway',
    eircode: 'H91 AR24',
    country: 'Ireland',
    full: 'Unit 4, Tuam Road, Galway, H91 AR24, Ireland',
  },
  contact: {
    email: 'info@cityhostings.com',
    phone: '083 172 3722',
    phoneInternational: '+353 83 172 3722',
    phoneHref: 'tel:+353831723722',
    emailHref: 'mailto:info@cityhostings.com',
  },
  areas: [
    'Galway City',
    'County Galway',
    'Connemara',
    'The West of Ireland',
  ],
  areaNote:
    'Additional western locations subject to property assessment.',
  registration: {
    // TODO_CLIENT_INPUT: Company registration number
    number: '',
    vat: '',
  },
} as const
