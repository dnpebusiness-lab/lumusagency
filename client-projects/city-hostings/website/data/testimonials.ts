// TODO_CLIENT_INPUT: Real testimonials required before go-live
// All testimonials below are placeholders and must be replaced with verified quotes

export interface Testimonial {
  id: string
  type: 'landlord' | 'guest'
  quote: string
  name: string
  context: string
  verified: boolean
}

export const testimonials: Testimonial[] = [
  {
    id: 'test-01',
    type: 'landlord',
    quote: 'TODO_CLIENT_INPUT: Verified landlord testimonial required.',
    name: 'TODO_CLIENT_INPUT',
    context: 'Property owner, Galway City',
    verified: false,
  },
  {
    id: 'test-02',
    type: 'landlord',
    quote: 'TODO_CLIENT_INPUT: Verified landlord testimonial required.',
    name: 'TODO_CLIENT_INPUT',
    context: 'Property owner, Salthill',
    verified: false,
  },
  {
    id: 'test-03',
    type: 'guest',
    quote: 'TODO_CLIENT_INPUT: Verified guest testimonial required.',
    name: 'TODO_CLIENT_INPUT',
    context: 'Guest, Galway City',
    verified: false,
  },
]

export const verifiedTestimonials = testimonials.filter((t) => t.verified)
