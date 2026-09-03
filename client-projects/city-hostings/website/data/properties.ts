// TODO_CLIENT_INPUT: Replace with real property data from booking provider
// TODO_CLIENT_INPUT: Connect to booking API (see data/booking.ts)

export interface Property {
  id: string
  slug: string
  name: string
  location: string
  area: string
  guests: number
  bedrooms: number
  bathrooms: number
  priceFrom: number | null
  description: string
  shortDescription: string
  amenities: string[]
  images: string[]
  available: boolean
  featured: boolean
}

export const featuredProperties: Property[] = [
  {
    id: 'prop-001',
    slug: 'galway-city-centre',
    name: 'TODO_CLIENT_INPUT: Property Name',
    location: 'Galway City Centre',
    area: 'Galway',
    guests: 4,
    bedrooms: 2,
    bathrooms: 1,
    priceFrom: null, // TODO_CLIENT_INPUT: Add nightly rate
    description: 'TODO_CLIENT_INPUT: Full property description required.',
    shortDescription: 'TODO_CLIENT_INPUT: Short description for listing card.',
    amenities: [
      'TODO_CLIENT_INPUT: Confirmed amenities list required',
    ],
    images: [], // TODO_CLIENT_INPUT: Professional photography required
    available: true,
    featured: true,
  },
  {
    id: 'prop-002',
    slug: 'salthill-coastal',
    name: 'TODO_CLIENT_INPUT: Property Name',
    location: 'Salthill',
    area: 'Galway',
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    priceFrom: null,
    description: 'TODO_CLIENT_INPUT: Full property description required.',
    shortDescription: 'TODO_CLIENT_INPUT: Short description for listing card.',
    amenities: [],
    images: [],
    available: true,
    featured: true,
  },
  {
    id: 'prop-003',
    slug: 'connemara-retreat',
    name: 'TODO_CLIENT_INPUT: Property Name',
    location: 'Connemara',
    area: 'County Galway',
    guests: 8,
    bedrooms: 4,
    bathrooms: 2,
    priceFrom: null,
    description: 'TODO_CLIENT_INPUT: Full property description required.',
    shortDescription: 'TODO_CLIENT_INPUT: Short description for listing card.',
    amenities: [],
    images: [],
    available: true,
    featured: true,
  },
]
