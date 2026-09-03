const CITY_HOSTING = {
  name: 'City Hosting',
  tagline: 'Professional holiday let management across Galway and the West of Ireland.',

  contact: {
    phone: '083 172 3722',
    phoneIntl: '+353 83 172 3722',
    phoneTel: 'tel:+353831723722',
    phoneWhatsApp: 'https://wa.me/353831723722',
    email: 'info@cityhostings.com',
    emailHref: 'mailto:info@cityhostings.com',
  },

  address: {
    line1: 'Unit 4, Tuam Road',
    city: 'Galway',
    eircode: 'H91 AR24',
    country: 'Ireland',
    full: 'Unit 4, Tuam Road, Galway, H91 AR24, Ireland',
    mapsUrl: 'https://maps.google.com/?q=Unit+4+Tuam+Road+Galway+Ireland',
  },

  areas: [
    'Galway City',
    'County Galway',
    'Connemara',
    'The West of Ireland',
  ],

  properties: [
    // Replace with real properties when ready
    // {
    //   id: 'galway-city-centre',
    //   name: 'Galway City Centre Apartment',
    //   slug: 'galway-city-centre-apartment',
    //   type: 'Apartment',
    //   location: 'Galway City',
    //   guests: 4,
    //   bedrooms: 2,
    //   bathrooms: 1,
    //   bookingUrl: 'CLOUDBEDS_WIDGET_URL_HERE', // Sa32sZ only for Galway
    //   photos: [],
    //   summary: '',
    // },
  ],

  // Netlify Forms endpoint — form submissions go here
  forms: {
    ownerEnquiry: 'owner-enquiry',
    guestContact: 'guest-contact',
  },

  // GA4 — replace with real measurement ID
  analytics: {
    ga4: '', // e.g. 'G-XXXXXXXXXX'
  },

  social: {
    instagram: '',
    facebook: '',
  },
};

if (typeof module !== 'undefined') module.exports = CITY_HOSTING;
