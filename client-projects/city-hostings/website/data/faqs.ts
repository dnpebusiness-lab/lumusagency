export interface FAQ {
  id: string
  question: string
  answer: string
  category: 'landlord' | 'guest' | 'general'
}

export const faqs: FAQ[] = [
  {
    id: 'faq-01',
    category: 'landlord',
    question: 'What types of property does City Hosting manage?',
    answer:
      'We work with holiday lets, short-term rentals and guest accommodation across Galway and the West of Ireland — from city-centre apartments to coastal cottages. We assess each property individually to confirm it is a good fit for our management service.',
  },
  {
    id: 'faq-02',
    category: 'landlord',
    question: 'Do I need to be present when guests check in or out?',
    answer:
      'No. We coordinate the full check-in and check-out process on your behalf. You do not need to be available or present during any part of a guest\'s stay.',
  },
  {
    id: 'faq-03',
    category: 'landlord',
    question: 'Which booking platforms do you list on?',
    answer:
      'TODO_CLIENT_INPUT: Confirm exact platforms used (e.g. Airbnb, Booking.com, direct website). We manage listings across the major short-term rental platforms, selecting the right combination for your property type and location.',
  },
  {
    id: 'faq-04',
    category: 'landlord',
    question: 'How are cleaning and linen handled between guests?',
    answer:
      'We coordinate professional cleaning and linen services between every stay. Your property is prepared to a consistent standard before each new arrival, without you needing to arrange anything.',
  },
  {
    id: 'faq-05',
    category: 'landlord',
    question: 'What happens if there is a maintenance issue?',
    answer:
      'We identify maintenance issues quickly — often before guests report them — and coordinate repairs through our local network of trusted trades. For anything significant, we contact you before proceeding.',
  },
  {
    id: 'faq-06',
    category: 'landlord',
    question: 'How will I know how my property is performing?',
    answer:
      'We provide regular performance reports covering occupancy, revenue and guest feedback. You stay informed about your property without needing to monitor it day to day.',
  },
  {
    id: 'faq-07',
    category: 'landlord',
    question: 'What is your management fee?',
    answer:
      'TODO_CLIENT_INPUT: Fee structure to be confirmed. Our management fee is discussed during the initial consultation and depends on the property and the level of service required.',
  },
  {
    id: 'faq-08',
    category: 'landlord',
    question: 'Can I still use my property for personal stays?',
    answer:
      'Yes. We build your personal use dates into the availability calendar so your property is always blocked when you need it.',
  },
  {
    id: 'faq-09',
    category: 'guest',
    question: 'How do I book a property directly with City Hosting?',
    answer:
      'You can search available properties and make a direct booking through our website. For any questions before booking, you can contact us directly by phone or email.',
  },
  {
    id: 'faq-10',
    category: 'guest',
    question: 'What is the check-in process?',
    answer:
      'TODO_CLIENT_INPUT: Confirm check-in method per property. Full check-in instructions are provided ahead of your arrival date. Most properties use a keyless entry system and require no key collection.',
  },
  {
    id: 'faq-11',
    category: 'guest',
    question: 'Who do I contact if I have an issue during my stay?',
    answer:
      'City Hosting is your direct point of contact for the duration of your stay. You can reach us by phone or email and we will respond promptly.',
  },
  {
    id: 'faq-12',
    category: 'guest',
    question: 'What is the cancellation policy?',
    answer:
      'TODO_CLIENT_INPUT: Cancellation policy to be confirmed per property. Cancellation terms are stated clearly at the time of booking for each property.',
  },
]

export const landlordFaqs = faqs.filter((f) => f.category === 'landlord')
export const guestFaqs = faqs.filter((f) => f.category === 'guest')
