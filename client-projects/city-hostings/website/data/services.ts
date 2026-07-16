// TODO_CLIENT_INPUT: Confirm final list of services offered before publishing

export const services = [
  {
    id: 'listing-setup',
    number: '01',
    title: 'Listing Setup & Optimisation',
    description:
      'Professional property presentation across booking platforms, with photography direction, compelling descriptions and targeted pricing strategy.',
    benefit: 'Your property stands out from the first day it goes live.',
  },
  {
    id: 'pricing-management',
    number: '02',
    title: 'Pricing & Availability Management',
    description:
      'Active pricing management to keep your property competitive — adjusting rates based on demand, local events and seasonal patterns.',
    benefit: 'You earn more without monitoring the calendar yourself.',
  },
  {
    id: 'guest-communication',
    number: '03',
    title: 'Guest Communication',
    description:
      'Every enquiry and guest message handled professionally and promptly — from initial interest through to post-stay follow-up.',
    benefit: 'Guests receive the response they expect. You stay undisturbed.',
  },
  {
    id: 'booking-management',
    number: '04',
    title: 'Booking Management',
    description:
      'Full reservation management across all channels, ensuring no double-bookings and a smooth flow from enquiry to confirmed stay.',
    benefit: 'Your calendar is managed with care and accuracy.',
  },
  {
    id: 'check-in-out',
    number: '05',
    title: 'Check-in & Check-out Coordination',
    description:
      'Seamless arrival and departure experiences coordinated for every guest, including access instructions, local guidance and departure checks.',
    benefit: 'Guests feel welcomed. You never need to be present.',
  },
  {
    id: 'cleaning',
    number: '06',
    title: 'Cleaning & Linen Coordination',
    description:
      'Professional cleaning and linen management arranged between each stay, to a consistent hospitality standard.',
    benefit: 'Your property is always ready for the next guest.',
  },
  {
    id: 'maintenance',
    number: '07',
    title: 'Maintenance Support',
    description:
      'Maintenance issues identified and managed quickly, with a local network of trusted trades to resolve problems without delay.',
    benefit: 'Small issues are handled before they become larger ones.',
  },
  {
    id: 'property-presentation',
    number: '08',
    title: 'Property Presentation',
    description:
      'Advice on presentation, staging and amenities to ensure your property photographs well, reviews well and books well.',
    benefit: 'Your property makes a strong impression at every stage.',
  },
  {
    id: 'direct-bookings',
    number: '09',
    title: 'Direct Booking Management',
    description:
      'A direct booking pathway for returning guests and local referrals, reducing platform dependency over time.',
    benefit: 'You build a guest base that is yours to keep.',
  },
  {
    id: 'reporting',
    number: '10',
    title: 'Performance Reporting',
    description:
      'Regular reporting on occupancy, revenue and guest feedback so you always have a clear view of how your property is performing.',
    benefit: 'You stay informed without needing to manage the day-to-day.',
  },
] as const

export const processSteps = [
  {
    number: '01',
    title: 'Property Consultation',
    description:
      'We discuss your property, your goals and what full management would look like in practice. No obligations — just a clear, honest conversation.',
  },
  {
    number: '02',
    title: 'Hosting Strategy',
    description:
      'We build the right approach for your property — pricing, positioning, platform selection and a plan for the first bookings.',
  },
  {
    number: '03',
    title: 'Property Preparation & Launch',
    description:
      'Your listing is prepared and launched, with professional presentation, accurate information and everything guests need from day one.',
  },
  {
    number: '04',
    title: 'Ongoing Management',
    description:
      'We handle the full day-to-day — guests, pricing, cleaning, maintenance and performance — while keeping you informed throughout.',
  },
] as const
