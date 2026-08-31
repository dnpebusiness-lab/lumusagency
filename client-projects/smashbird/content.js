/* ==========================================================================
   SMASHBIRD — CENTRAL CONTENT SOURCE
   ==========================================================================
   Single editable source of truth for the whole site.

   HOW THIS WORKS
   Anything marked `confirmed: false` is HIDDEN from visitors. Nothing on the
   public site is invented: if a fact is not confirmed here, the element that
   would show it does not render at all.

   TO PUBLISH A FIELD
   1. Replace the null / empty value with the real information.
   2. Set the matching `confirmed` flag to true.
   No other file needs touching.

   Every outstanding item is listed in HANDOVER.md.
   ========================================================================== */

window.SMASHBIRD = {

  /* ---------------------------------------------------------------- brand */
  brand: {
    name: 'Smashbird',
    city: 'Galway',
    // CLIENT_CONFIRMATION_REQUIRED — official logo files not supplied.
    // The mark currently in index.html is a hand-drawn SVG approximation and
    // MUST be replaced with the supplied artwork before launch.
    logo: {
      stacked:    { src: null, confirmed: false },
      horizontal: { src: null, confirmed: false },
      avatar:     { src: null, confirmed: false }
    },
    colours: {
      pink:      '#FB2095',
      black:     '#000000',
      yellow:    '#FFD400',
      lightGrey: '#E6E6E6',
      red:       '#E53B2F'
    },
    // Nimbus Sans Narrow / Nimbus Sans are licensed faces and are NOT in the
    // repository. The stack below falls back to metrically similar grotesques.
    fonts: {
      display: "'Nimbus Sans Narrow', 'Helvetica Neue Condensed', 'Arial Narrow', Impact, sans-serif",
      body:    "'Nimbus Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      licensed: false
    }
  },

  /* ------------------------------------------------------------- messaging */
  lines: {
    notAnother: 'NOT ANOTHER BURGER PLACE.',
    serious:    'SERIOUS BURGERS.',
    crunch:     'CRUNCH FIRST. QUESTIONS LATER.',
    sauce:      'SAUCE IS THE MAIN CHARACTER.',
    newDrop:    'NEW DROP. GET STUCK IN.',
    bigFlavour: 'BIG FLAVOUR. NO NONSENSE.'
  },

  hero: {
    eyebrow:     'SMASHBIRD',
    headline:    'SERIOUS BURGERS.',
    support:     'Big flavour. No nonsense.',
    description: 'Smashed burgers, fried chicken, vegan junk and loaded sides — powered by Birdhouse sauces.',
    locationLine:'CROSS STREET · LIOSBÁN · GALWAY'
  },

  about: {
    headline: 'NOT ANOTHER BURGER PLACE.',
    body: 'Smashbird is Galway street food built around big flavour. Smashed burgers, ' +
          'buttermilk fried chicken, vegan junk, loaded sides and a deep range of Birdhouse ' +
          'sauces. No playing it safe. No boring bites. Just serious food made to get stuck into.'
    // No founding year, founders or company history — none confirmed.
  },

  /* ----------------------------------------------------------- proof strip */
  proof: [
    { text: 'WINNER — BEST BURGER & AMERICAN, DELIVEROO RESTAURANT AWARDS 2025', confirmed: true },
    { text: 'VEGAN & GLUTEN-FREE OPTIONS',  confirmed: true },
    { text: 'TWO GALWAY LOCATIONS',         confirmed: true },
    { text: 'BIRDHOUSE SAUCES',             confirmed: true }
  ],

  /* ------------------------------------------------------------------ menu
     Category order as supplied by the client.
     Product prices, descriptions, allergens and images are NOT confirmed and
     therefore render as name-only tiles. Fill a product in and it upgrades
     itself automatically.
     -------------------------------------------------------------------- */
  menuCategories: [
    { id:'meal-deals', name:'Meal Deals' },
    { id:'burgers',    name:'Burgers'    },
    { id:'birds',      name:'Birds'      },
    { id:'vegan-junk', name:'Vegan Junk' },
    { id:'dawgs',      name:'Dawgs'      },
    { id:'sides',      name:'Sides'      },
    { id:'loaded',     name:'Loaded'     },
    { id:'kids',       name:'Kids Menu'  },
    { id:'drips',      name:'Drips'      },
    { id:'drinks',     name:'Drinks'     },
    { id:'bottles',    name:'Sauce Bottles' }
  ],

  // Product template — every field the client will eventually supply.
  // description / price / allergens / image stay null until confirmed.
  // `category` is a best-guess grouping and is flagged in HANDOVER.md.
  menu: [
    { name:'The Melter',                     category:'burgers',    description:null, price:null, image:null, allergens:[], vegan:false, vegetarian:false, glutenFree:false, available:true, orderUrl:null, confirmed:false },
    { name:'The Hatch',                      category:'burgers',    description:null, price:null, image:null, allergens:[], vegan:false, vegetarian:false, glutenFree:false, available:true, orderUrl:null, confirmed:false },
    { name:'Big Bird',                       category:'birds',      description:null, price:null, image:null, allergens:[], vegan:false, vegetarian:false, glutenFree:false, available:true, orderUrl:null, confirmed:false },
    { name:'The Chicken Samboo',             category:'birds',      description:null, price:null, image:null, allergens:[], vegan:false, vegetarian:false, glutenFree:false, available:true, orderUrl:null, confirmed:false },
    { name:'Hot Honey Butter Chicken Sambo', category:'birds',      description:null, price:null, image:null, allergens:[], vegan:false, vegetarian:false, glutenFree:false, available:true, orderUrl:null, confirmed:false },
    { name:'Chick N Pop',                    category:'birds',      description:null, price:null, image:null, allergens:[], vegan:false, vegetarian:false, glutenFree:false, available:true, orderUrl:null, confirmed:false },
    { name:'Birdhouse Tendies & Fries',      category:'birds',      description:null, price:null, image:null, allergens:[], vegan:false, vegetarian:false, glutenFree:false, available:true, orderUrl:null, confirmed:false },
    { name:'Drty Secret VG',                 category:'vegan-junk', description:null, price:null, image:null, allergens:[], vegan:true,  vegetarian:true,  glutenFree:false, available:true, orderUrl:null, confirmed:false },
    { name:'Drty Dawg',                      category:'dawgs',      description:null, price:null, image:null, allergens:[], vegan:false, vegetarian:false, glutenFree:false, available:true, orderUrl:null, confirmed:false },
    { name:'Garlic Butter Parmesan Fries',   category:'loaded',     description:null, price:null, image:null, allergens:[], vegan:false, vegetarian:false, glutenFree:false, available:true, orderUrl:null, confirmed:false },
    { name:'Disco Fries',                    category:'loaded',     description:null, price:null, image:null, allergens:[], vegan:false, vegetarian:false, glutenFree:false, available:true, orderUrl:null, confirmed:false },
    { name:'Chicken Spice Bag Tater Tots',   category:'loaded',     description:null, price:null, image:null, allergens:[], vegan:false, vegetarian:false, glutenFree:false, available:true, orderUrl:null, confirmed:false }
  ],

  // Shown under the menu only once the client confirms how allergen info is
  // provided. Left unconfirmed so no claim is made.
  allergenNote: { text:null, confirmed:false },

  /* -------------------------------------------------------------- sauces */
  sauces: [
    { name:'Buckie BBQ',  image:null, description:null, heat:null, allergens:[], pairing:null, bottled:null, buyUrl:null, confirmed:false },
    { name:'Bum Burner',  image:null, description:null, heat:null, allergens:[], pairing:null, bottled:null, buyUrl:null, confirmed:false },
    { name:'Burnt',       image:null, description:null, heat:null, allergens:[], pairing:null, bottled:null, buyUrl:null, confirmed:false }
  ],
  saucesIntro: 'From smoky and sweet to properly hot, Birdhouse sauces bring a different hit of flavour to every Smashbird order.',
  birdhouseSocial: { url:null, confirmed:false },

  /* ------------------------------------------------------------ locations */
  locations: [
    {
      id:'cross-street',
      name:'Smashbird Cross Street',
      short:'Cross Street',
      address:      { value:'3 Cross Street Lower, Galway, H91 T995', confirmed:true },
      mapsUrl:      { value:null, confirmed:false },
      hours:        { value:null, confirmed:false },
      phone:        { value:null, confirmed:false },
      dineIn:       { value:null, confirmed:false },
      collection:   { value:null, confirmed:false },
      delivery:     { value:null, confirmed:false },
      orderUrl:     { value:null, confirmed:false },
      image:        { src:null, alt:null, confirmed:false }
    },
    {
      id:'liosban',
      name:'Smashbird Liosbán',
      short:'Liosbán',
      // Area is public; exact unit and eircode stay unpublished until confirmed.
      area:         { value:'Liosbán Industrial Estate, Galway', confirmed:true },
      address:      { value:null, confirmed:false, note:'Eircode previously supplied as H91 D8VP — unit/street unconfirmed' },
      mapsUrl:      { value:null, confirmed:false },
      hours:        { value:null, confirmed:false },
      phone:        { value:null, confirmed:false },
      dineIn:       { value:null, confirmed:false },
      collection:   { value:null, confirmed:false },
      delivery:     { value:null, confirmed:false },
      orderUrl:     { value:null, confirmed:false },
      image:        { src:null, alt:null, confirmed:false }
    }
    // Dominick Street closed 31 December 2025 — deliberately absent.
  ],

  /* ------------------------------------------------------------- ordering */
  // Location-specific URLs required. No generic fallback link is used.
  ordering: {
    platforms: { flipdish:{ confirmed:false }, deliveroo:{ confirmed:false } }
  },

  /* -------------------------------------------------------------- reviews
     Only genuine, sourced reviews. Empty array = the section does not render.
     -------------------------------------------------------------------- */
  reviews: [],

  social: {
    instagram: { url:'https://www.instagram.com/smashbird_galway/', handle:'@smashbird_galway', confirmed:true },
    // Curated grid of real supplied images — no fake embedded feed.
    grid: []
  },

  /* ------------------------------------------------------------- catering */
  catering: {
    headline:'BRING SMASHBIRD TO THE PARTY.',
    body:'Birthdays, work parties, weddings or private events — bring the Smashbird and Birdhouse flavour to your crowd.',
    // No food-truck, capacity or service-area claims — none confirmed.
    formEndpoint:{ value:null, confirmed:false }
  },

  contact: {
    email:{ value:null, confirmed:false },
    phone:{ value:null, confirmed:false },
    formEndpoint:{ value:null, confirmed:false }
  },

  /* ---------------------------------------------------------------- legal
     The published privacy policy has blank registration and address fields.
     Nothing here renders until supplied.
     -------------------------------------------------------------------- */
  legal: {
    companyName:       { value:null, confirmed:false },
    registrationNumber:{ value:null, confirmed:false },
    registeredAddress: { value:null, confirmed:false },
    privacyEmail:      { value:null, confirmed:false },
    privacyPolicyUrl:  { value:null, confirmed:false },
    cookiePolicyUrl:   { value:null, confirmed:false },
    termsUrl:          { value:null, confirmed:false },
    allergenInfoUrl:   { value:null, confirmed:false }
  }
};
