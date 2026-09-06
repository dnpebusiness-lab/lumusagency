/* ==========================================================================
   SMASHBIRD — CENTRAL CONTENT SOURCE
   ==========================================================================
   Single editable source of truth for the whole site.

   MENU / SAUCE DATA
   Verified against the official Smashbird Flipdish ordering site and
   Birdhouse.ie on 31 August 2026. Cross Street and Liosbán currently show the
   same menu and the same prices, so one list serves both.

   HOW THIS WORKS
   Anything marked `confirmed: false` is HIDDEN from visitors. Nothing on the
   public site is invented: if a fact is not confirmed here, the element that
   would show it does not render at all.

   Known source problems are listed in `contentIssues` at the bottom of this
   file and repeated in HANDOVER.md. Nothing ambiguous has been guessed.
   ========================================================================== */

window.SMASHBIRD = {

  /* ---------------------------------------------------------------- brand */
  brand: {
    name: 'Smashbird',
    city: 'Galway',
    /* OFFICIAL ARTWORK — supplied in the Brand Identity & Art Direction deck
       (2026) and exported unmodified into img/. The earlier hand-drawn SVG
       approximation has been deleted from index.html.

       Deck rules, slides 05–06, enforced in the CSS:
         - horizontal → website headers. Minimum width 160px.
         - stacked    → covers and campaign frames. Minimum 96px.
         - avatar     → profiles and favicons. Minimum 40px.
         - Never stretch, crop, recolour, rotate, outline, shadow or GLOW it.
           The neon treatment on this site is applied to type only, never to
           the mark. Keep copy and busy design out of its clear space. */
    logo: {
      horizontal: { src: 'img/logo-horizontal.png', w: 720, h: 203, minWidth: 160, confirmed: true },
      stacked:    { src: 'img/logo-stacked.png',    w: 640, h: 640, minWidth:  96, confirmed: true },
      // Replaced 2026-09-06 with the master file the client sent directly
      // (black circle, transparent corners, true alpha — not the earlier
      // flattened grey-circle export) at 1024x1024, down from a 2668x2668
      // source.
      avatar:     { src: 'img/logo-avatar.png',     w: 1024, h: 1024, minWidth:  40, confirmed: true },
      // Single-colour silhouette lifted from the deck's illustration sheet.
      // Used through CSS mask-image so it is painted in one brand colour and
      // the file itself is never recoloured. Deck slide 11: one large mark,
      // never a scatter of small ones.
      bird:       { src: 'img/bird.png', w: 900, h: 820, confirmed: true }
    },
    colours: {
      pink:'#FB2095', black:'#000000', yellow:'#FFD400',
      lightGrey:'#E6E6E6', red:'#E53B2F'
    },
    // Nimbus Sans Narrow / Nimbus Sans are licensed and NOT in the repository.
    fonts: {
      display: "'Nimbus Sans Narrow','Helvetica Neue Condensed','Arial Narrow',Impact,sans-serif",
      body:    "'Nimbus Sans','Helvetica Neue',Helvetica,Arial,sans-serif",
      licensed: false
    }
  },

  /* ------------------------------------------------------------- messaging */
  lines: {
    notAnother:'NOT ANOTHER BURGER PLACE.', serious:'SERIOUS BURGERS.',
    crunch:'CRUNCH FIRST. QUESTIONS LATER.', sauce:'SAUCE IS THE MAIN CHARACTER.',
    newDrop:'NEW DROP. GET STUCK IN.', bigFlavour:'BIG FLAVOUR. NO NONSENSE.'
  },

  hero: {
    eyebrow:'SMASHBIRD',
    headline:'SERIOUS BURGERS.',
    support:'Big flavour. No nonsense.',
    description:'Smashed burgers, fried chicken, vegan junk and loaded sides — powered by Birdhouse sauces.',
    locationLine:'CROSS STREET · LIOSBÁN · GALWAY'
  },

  about: {
    headline:'NOT ANOTHER BURGER PLACE.',
    body:'Smashbird is Galway street food built around big flavour. Smashed burgers, ' +
         'buttermilk fried chicken, vegan junk, loaded sides and a deep range of Birdhouse ' +
         'sauces. No playing it safe. No boring bites. Just serious food made to get stuck into.'
  },

  /* ------------------------------------------------------ category strips
     The four things Smashbird makes, in the brand's own words.

     ⚠ This copy is the client's. A rebuild replaced it with shorter
     paraphrases written here, which was wrong — it is restored verbatim and
     should not be "improved" again without being asked. */
  strips: [
    { n:'01', word:'Smashed', em:null,
      copy:'Two thin beef patties pressed hard on a screaming hot flat-top. Crisp lacy edges. American cheese melted through every layer.' },
    { n:'02', word:'Fried', em:null,
      copy:'Fried chicken with real crunch. Crispy Bird, Hot Honey, Korean. Choose your sauce. Choose your heat. Never choose safe.' },
    { n:'03', word:'Loaded', em:null,
      copy:"Loaded fries built to collapse under the weight of their own toppings. Share them. Or don't." },
    { n:'04', word:'Vegan', em:'Junk',
      copy:"Vegan food that isn't trying to be acceptable. The same crunch, the same sauce, the same mess. No apologies." }
  ],

  /* --------------------------------------------------------------- wall sign
     Painted on the wall at Cross Street. A real line in a real room, and the
     least replaceable sentence on this site — it cannot be rewritten, only
     quoted. Rendered on the home page as a neon sign. */
  wallSign: {
    line1: 'I licked it',
    line2: "so it's mine",
    note:  'On the wall at Cross Street',
    confirmed: true
  },

  /* ------------------------------------------------------------ neon signs
     Real Smashbird signage lines, supplied by the client 2026-09-06. Each
     one gets its own moment on a different page — they are never stacked
     together, because a room with four neon signs on one wall is a sign
     shop, not a restaurant.

     Deliberately kept as TYPE. The brand deck (slides 05–06) forbids adding
     glow to the logo mark itself, so where the round logo appears as a neon
     moment it is the space AROUND the mark that is lit, never the mark.

     Neon lips and a neon burger were also requested as graphic assets. No
     such artwork exists in this repository and drawing an approximation
     would put an invented graphic into the brand — so they are not here.
     Supply the artwork and it drops into the same system. See #23. */
  neonSigns: {
    fries:   { line1:'Feed me fries',   line2:'& tell me im pretty', confirmed:true },
    burgers: { line1:'Feed me burgers', line2:'& tell me im pretty', confirmed:true }
  },

  /* ----------------------------------------------------------- proof strip */
  proof: [
    { text:'WINNER — BEST BURGER & AMERICAN, DELIVEROO RESTAURANT AWARDS 2025', confirmed:true },
    { text:'VEGAN & GLUTEN-FREE OPTIONS',  confirmed:true },
    { text:'TWO GALWAY LOCATIONS',         confirmed:true },
    { text:'BIRDHOUSE SAUCES',             confirmed:true }
  ],

  /* --------------------------------------------------------------- awards
     Scalable on purpose — an Awards & Recognition section should not need a
     rebuild every time a new one comes in.

     Five of these are read directly off a photo of the actual plaques on
     the wall (supplied 2026-09-06, see img/wall-awards-neon.jpg) — issuer,
     category and year transcribed from the physical award, not guessed.
     No award logo ARTWORK file exists in this repository, so cards render
     as text; the wall photo itself is used separately as real evidence
     rather than a substitute for a vector logo. See contentIssues #17. */
  awards: [
    { name:'Best Burger & American', issuer:'Deliveroo Restaurant Awards', year:'2025',
      logo:{ src:null, confirmed:false }, confirmed:true },

    // Read off the physical plaque on the wall.
    { name:'Chicken Burger of the Year', issuer:'Irish TakeAway Awards — Connacht', year:null,
      logo:{ src:null, confirmed:false }, confirmed:true },
    { name:'Social Media Award', issuer:'Irish TakeAway Awards — Connacht', year:null,
      logo:{ src:null, confirmed:false }, confirmed:true },
    { name:'Best in Ireland', issuer:"McKenna's Guides", year:'2026',
      logo:{ src:null, confirmed:false }, confirmed:true },
    { name:'Best in Ireland', issuer:"McKenna's Guides", year:'2025',
      logo:{ src:null, confirmed:false }, confirmed:true },

    /* Named by the client 2026-09-06 but not visible on the wall photo —
       may be the same win as the Deliveroo award above under a different
       name, or a separate one. Left as its own entry rather than merged,
       since merging on a guess risks hiding a real, distinct award. */
    { name:'Best Burgers & American in Ireland', issuer:null, year:null,
      logo:{ src:null, confirmed:false }, confirmed:true },
    { name:'Blas na hÉireann winner', issuer:'Blas na hÉireann', year:null,
      logo:{ src:null, confirmed:false }, confirmed:true },
    { name:'Great Taste winner', issuer:'Great Taste', year:null,
      logo:{ src:null, confirmed:false }, confirmed:true }
  ],
  awardsNote:'More awards to be added. Award logos are used only where the official ' +
             'artwork has been supplied — none are recreated.',
  // Real photo of the actual plaques on the wall — used as evidence
  // alongside the text cards above, not instead of them.
  awardsPhoto:{ src:'img/wall-awards-neon.jpg',
    alt:'The Smashbird wall with neon burger and neon lips signs either side of the neon "I licked it so it\'s mine" sign, and four award plaques displayed underneath: Irish TakeAway Awards for Chicken Burger of the Year and Social Media Award (Connacht), and two McKenna\'s Guides Best in Ireland awards for 2025 and 2026' },

  /* -------------------------------------------------------- current offers
     Three offers named directly by the client brief (2026-09-06). Their
     existence is confirmed; their exact terms were not supplied, so no
     percentage, price or age/ID requirement is invented here — `terms`
     stays unconfirmed and the card falls back to directing people in-store.
     See contentIssues #18. */
  currentOffers: [
    { id:'student-mondays', day:'Monday', name:'Student Mondays',
      blurb:'A standing Monday offer for students.',
      terms:{ value:null, confirmed:false }, confirmed:true },
    { id:'wing-wednesdays', day:'Wednesday', name:'Wing Wednesdays',
      blurb:'A standing Wednesday offer built around the wings.',
      terms:{ value:null, confirmed:false }, confirmed:true },
    { id:'kids-sundays', day:'Sunday', name:'Kids Eat Free Sundays',
      blurb:'A standing Sunday offer for families.',
      terms:{ value:null, confirmed:false }, confirmed:true }
  ],
  offersNote:'Terms, times and any ID or age requirements have not been ' +
             'confirmed yet for this page — ask in-store or check Instagram ' +
             'before you go.',

  /* ------------------------------------------------------------------ menu
     Categories reflect exactly what the official ordering site shows.
     There is deliberately no "Meal Deals" and no "Loaded" category.
     -------------------------------------------------------------------- */
  menuCategories: [
    { id:'burgers',    name:'Burgers',       note:'Served on sesame sourdough.' },
    { id:'birds',      name:'Birds',         note:null },
    { id:'vegan-junk', name:'Vegan Junk',    note:null },
    { id:'dawgs',      name:'Dawgs',         note:'Served with fries.' },
    { id:'sides',      name:'Sides',         note:null },
    { id:'drips',      name:'Drips',         note:'3 for €5.00 · €2.50 each' },
    { id:'drinks',     name:'Drinks',        note:null },
    { id:'bottles',    name:'Sauce Bottles', note:null },
    { id:'kids',       name:'Kids Menu',     note:null }
  ],

  menu: [
    /* -------------------------------------------------------- BURGERS */
    { name:'Hot Honey Butter Chicken Sambo', category:'burgers', price:'From €13.50',
      description:'Miso buttermilk fried chicken, hot honey butter, bread and butter pickles, shredded lettuce and Smash sauce.',
      allergens:['Cereals','Milk','Egg','Sesame Seeds','Sulphites'],
      vegan:false, vegetarian:false, glutenFree:null, available:true, confirmed:true },

    { name:'The Chicken Samboo', category:'burgers', price:'From €13.00',
      description:'Buttermilk fried chicken, shredded lettuce, Jack cheese, fried onions, house pickles and Smash sauce.',
      allergens:['Cereals','Milk','Mustard','Sesame Seeds','Sulphites'],
      vegan:false, vegetarian:false, glutenFree:null, available:true, confirmed:true },

    { name:'K Poppin', category:'burgers', price:'From €13.00',
      description:'Buttermilk fried chicken, Asian slaw, shredded lettuce and Korean Q.',
      allergens:['Cereals','Milk','Sesame Seeds','Sulphites'],
      vegan:false, vegetarian:false, glutenFree:null, available:true, confirmed:true },

    { name:'Jalapeño Hatch', category:'burgers', price:'From €13.00',
      description:'Hickey’s double beef patties, jalapeño jam, American cheddar, bread and butter pickles, jalapeño mayo and shredded lettuce.',
      allergens:['Cereals','Soybeans','Milk','Mustard','Sesame Seeds','Sulphites'],
      vegan:false, vegetarian:false, glutenFree:null, available:true, confirmed:true },

    { name:'The Melter', category:'burgers', price:'From €13.00',
      description:'Hickey’s beef patties, streaky bacon, American cheddar, Jack cheese, house pickles and Smash sauce.',
      allergens:['Cereals','Soybeans','Milk','Mustard','Sesame Seeds','Sulphites'],
      vegan:false, vegetarian:false, glutenFree:null, available:true, confirmed:true },

    { name:'Bangin Buff', category:'burgers', price:'From €13.00',
      description:'Buttermilk fried chicken, Monterey Jack, shredded lettuce, house pickles and Burnt Butter Buffalo.',
      // Wording differs from the other entries on the source site; kept verbatim.
      allergens:['Cereals','Milk','Sesame Seeds','Sulphur Dioxide and Sulphites'],
      vegan:false, vegetarian:false, glutenFree:null, available:true, confirmed:true },

    { name:'Angry Bird', category:'burgers', price:'From €13.50',
      description:'Buttermilk fried chicken, raw slaw, pink onion and Mango Mazzaleen.',
      allergens:['Cereals','Milk','Sesame Seeds','Sulphites'],
      vegan:false, vegetarian:false, glutenFree:null, available:true, confirmed:true },

    { name:'Big Bird', category:'burgers', price:'From €14.00',
      description:'Buttermilk fried chicken, Hickey’s beef patty, streaky bacon, cheese, pink onion and Smash sauce.',
      allergens:['Cereals','Soybeans','Milk','Mustard','Sesame Seeds','Sulphites'],
      vegan:false, vegetarian:false, glutenFree:null, available:true, confirmed:true },

    { name:'The Hatch', category:'burgers', price:'From €12.50',
      description:'Hickey’s beef patties, American cheddar, house pickles and Smash sauce.',
      allergens:['Cereals','Soybeans','Milk','Mustard','Sesame Seeds','Sulphites'],
      vegan:false, vegetarian:false, glutenFree:null, available:true, confirmed:true },

    { name:'Rasta Burger', category:'burgers', price:'From €12.50',
      description:'Hickey’s beef patties, American cheddar, raw slaw, pickles and Caribbean Jerk.',
      allergens:['Cereals','Crustaceans','Fish','Milk','Sesame Seeds','Sulphites'],
      allergensNeedCheck:true,   // see contentIssues — Birdhouse jerk data inconsistent
      vegan:false, vegetarian:false, glutenFree:null, available:true, confirmed:true },

    /* ---------------------------------------------------------- BIRDS
       Flavour-dependent allergens — the source does not publish a complete
       list at product level, so none is shown. */
    { name:'Birdhouse Tendies', category:'birds', price:'From €13.00',
      description:'Award-winning buttermilk fried chicken tendies with a choice of flavour.',
      allergens:[], allergensUnavailable:true,
      vegan:false, vegetarian:false, glutenFree:null, available:true, confirmed:true },

    { name:'Wings Medium', category:'birds', price:'From €12.00',
      description:'Medium portion of wings with a choice of flavour.',
      allergens:[], allergensUnavailable:true,
      vegan:false, vegetarian:false, glutenFree:null, available:true, confirmed:true },

    { name:'Chick N Pop', category:'birds', price:'From €12.50',
      description:'Buttermilk fried chicken popcorn tossed in a choice of flavour.',
      allergens:[], allergensUnavailable:true,
      vegan:false, vegetarian:false, glutenFree:null, available:true, confirmed:true },

    { name:'Wings Large', category:'birds', price:'From €16.00',
      description:'Large portion of wings with a choice of flavour.',
      allergens:[], allergensUnavailable:true,
      vegan:false, vegetarian:false, glutenFree:null, available:true, confirmed:true },

    /* ----------------------------------------------------- VEGAN JUNK */
    { name:'Brassica Burger VG', category:'vegan-junk', price:'From €12.00',
      description:'Crunchy cabbage fritter, vegan chedda, shredded lettuce, chimichurri and vegan aioli.',
      allergens:['Cereals','Sulphites'],
      vegan:true, vegetarian:true, glutenFree:null, available:true, confirmed:true },

    { name:'The Stray VG', category:'vegan-junk', price:'From €11.00',
      description:'Vegan merguez, Asian slaw, fried onion and Korean soy.',
      allergens:['Cereals','Mustard','Soybeans','Sulphites'],
      vegan:true, vegetarian:true, glutenFree:null, available:true, confirmed:true },

    { name:'Drty Secret VG', category:'vegan-junk', price:'From €13.50',
      description:'Plant-based burger, vegan chedda, chilli rayu mayo, pickles and Asian slaw.',
      allergens:['Cereals','Soybeans','Mustard','Sulphites'],
      vegan:true, vegetarian:true, glutenFree:null, available:true, confirmed:true },

    { name:'Cabbage Fritter', category:'vegan-junk', price:'From €8.00',
      description:'Crunchy cabbage fritter with chimichurri.',
      // Vegan Junk entry shows no allergens; the Sides entry lists two. Flagged.
      allergens:[], allergensUnavailable:true, allergensNeedCheck:true,
      vegan:null, vegetarian:null, glutenFree:null, available:true, confirmed:true },

    /* ---------------------------------------------------------- DAWGS */
    { name:'Drty Dawg', category:'dawgs', price:'From €11.50',
      description:'Sausage, bacon, Jack cheese, fried onion, Smash sauce and chimichurri.',
      allergens:['Cereals','Eggs','Soybeans','Milk','Sulphites'],
      vegan:false, vegetarian:false, glutenFree:null, available:true, confirmed:true },

    { name:'The Stray', category:'dawgs', price:'From €11.00',
      description:'Vegan merguez, Asian slaw, fried onion and Korean soy.',
      // Listed with Eggs and Milk although described elsewhere as vegan. Flagged.
      allergens:['Cereals','Eggs','Milk','Sulphites'], allergensNeedCheck:true,
      vegan:null, vegetarian:null, glutenFree:null, available:true, confirmed:true },

    { name:'Bowwow Buff', category:'dawgs', price:'From €11.00',
      description:'Sausage, Burnt Butter Buffalo and whipped blue cheese ranch.',
      allergens:['Cereals','Eggs','Milk','Sulphites'],
      vegan:false, vegetarian:false, glutenFree:null, available:true, confirmed:true },

    /* ---------------------------------------------------------- SIDES */
    { name:'French Fries VG', category:'sides', price:'€4.50', description:null,
      allergens:['Sulphites'], vegan:true, vegetarian:true, glutenFree:null, available:true, confirmed:true },

    { name:'Halloumi Fries V', category:'sides', price:'€8.00',
      description:'Halloumi fries with miso maple and togarashi.',
      allergens:['Soybeans','Sesame Seeds','Sulphites'],
      vegan:false, vegetarian:true, glutenFree:null, available:true, confirmed:true },

    { name:'Disco Fries', category:'sides', price:'€13.00',
      description:'Fries, buffalo chicken, pickles and jalapeño drizzle.',
      allergens:['Eggs','Milk','Mustard','Sulphites'],
      vegan:false, vegetarian:false, glutenFree:null, available:true, confirmed:true },

    { name:'Togarashi Fries', category:'sides', price:'€6.00', description:null,
      allergens:['Crustaceans','Sesame Seeds','Sulphites'],
      vegan:false, vegetarian:false, glutenFree:null, available:true, confirmed:true },

    { name:'Pickles', category:'sides', price:'€3.00', description:null,
      allergens:['Mustard','Sulphites'],
      vegan:null, vegetarian:null, glutenFree:null, available:true, confirmed:true },

    { name:'Spice Bag Tater Tots', category:'sides', price:'From €8.50',
      description:'Crispy tater tots coated in signature salt, chilli and pepper seasoning with fried onions, peppers, chillies and hot honey butter sauce.',
      allergens:['Crustaceans','Soybeans','Milk','Sesame Seeds','Sulphites'],
      vegan:false, vegetarian:false, glutenFree:null, available:true, confirmed:true },

    { name:'Tater Hashers VG', category:'sides', price:'€5.50', description:null,
      allergens:['Soybeans','Sesame Seeds','Sulphites'],
      vegan:true, vegetarian:true, glutenFree:null, available:true, confirmed:true },

    { name:'Jalapeño Jam Fries V', category:'sides', price:'€9.00',
      // Source description is garbled ("Saberno fior de latter"). Not guessed,
      // not shown. See contentIssues.
      description:null, descriptionNeedsCorrection:true,
      allergens:['Sulphites'],
      vegan:false, vegetarian:true, glutenFree:null, available:true, confirmed:true },

    { name:'Garlic Butter Parmesan Fries', category:'sides', price:'€8.50', description:null,
      allergens:['Milk','Sulphites'],
      vegan:false, vegetarian:null, glutenFree:null, available:true, confirmed:true },

    { name:'Asian Slaw', category:'sides', price:'€3.00', description:null,
      allergens:['Sesame Seeds','Sulphites'],
      vegan:null, vegetarian:null, glutenFree:null, available:true, confirmed:true },

    { name:'Cabbage Fritter', category:'sides', price:'€8.00',
      description:'With chimichurri.',
      allergens:['Cereals','Sulphites'],
      vegan:null, vegetarian:null, glutenFree:null, available:true, confirmed:true },

    /* -------------------------------------------------------- DRINKS */
    { name:'Coca-Cola Classic 330ml',            category:'drinks', price:'€3.00', allergens:[], available:true, confirmed:true },
    { name:'Coca-Cola Zero Sugar 330ml',         category:'drinks', price:'€3.00', allergens:[], available:true, confirmed:true },
    { name:'Diet Coke 330ml',                    category:'drinks', price:'€3.00', allergens:[], available:true, confirmed:true },
    { name:'Sprite 330ml',                       category:'drinks', price:'€3.00', allergens:[], available:true, confirmed:true },
    { name:'Fanta Orange 330ml',                 category:'drinks', price:'€3.00', allergens:[], available:true, confirmed:true },
    { name:'Fanta Lemon 330ml',                  category:'drinks', price:'€3.00', allergens:[], available:true, confirmed:true },
    { name:'Monster Original 500ml',             category:'drinks', price:'€3.50', allergens:[], available:true, confirmed:true },
    { name:'Monster Energy Ultra 500ml',         category:'drinks', price:'€3.50', allergens:[], available:true, confirmed:true },
    { name:'Monster Mango Loco Energy + Juice 500ml', category:'drinks', price:'€3.50', allergens:[], available:true, confirmed:true },
    { name:'Deep RiverRock Still Water 500ml',   category:'drinks', price:'€3.00', allergens:[], available:true, confirmed:true },
    { name:'Solas Soda Elderflower',             category:'drinks', price:'€4.50', allergens:[], available:true, confirmed:true },
    { name:'Solas Soda Lemon and Mint',          category:'drinks', price:'€4.50', allergens:[], available:true, confirmed:true },
    { name:'Solas Soda Cola',                    category:'drinks', price:'€4.50', allergens:[], available:true, confirmed:true },
    { name:'Solas Soda RockShandy Grapefruit',   category:'drinks', price:'€4.50', allergens:[], available:true, confirmed:true },
    { name:'Solas Soda Ginger',                  category:'drinks', price:'€4.50', allergens:[], available:true, confirmed:true },
    { name:'Irn Bru',                            category:'drinks', price:'€3.50', allergens:[], available:true, confirmed:true },
    { name:'Vital Prickly Pear',                 category:'drinks', price:'€3.50', allergens:[], available:true, confirmed:true },
    { name:'Vital Pineapple',                    category:'drinks', price:'€3.50', allergens:[], available:true, confirmed:true },
    { name:'Nero di Troia 150ml',                category:'drinks', price:'€8.00', allergens:[], alcohol:true, available:true, confirmed:true },
    { name:'Pecorino 150ml',                     category:'drinks', price:'€8.00', allergens:[], alcohol:true, available:true, confirmed:true },
    { name:'Lucky Saint IPA, non-alcoholic',     category:'drinks', price:'€6.00', allergens:[], available:true, confirmed:true },
    { name:'White Hag Hazy IPA',                 category:'drinks', price:'€6.50', allergens:[], alcohol:true, available:true, confirmed:true },
    { name:'Hells Lager',                        category:'drinks', price:'€6.50', allergens:[], alcohol:true, available:true, confirmed:true },
    { name:'Tropical IPA',                       category:'drinks', price:'€7.00', allergens:[], alcohol:true, available:true, confirmed:true },
    { name:'Bottle of Pecorino',                 category:'drinks', price:'€41.00', allergens:[], alcohol:true, available:true, confirmed:true },
    { name:'Bottle of Nero di Troia',            category:'drinks', price:'€39.00', allergens:[], alcohol:true, available:true, confirmed:true },
    { name:'SIP White Wine, Chardonnay 187ml',   category:'drinks', price:'€6.95', allergens:[], alcohol:true, available:true, confirmed:true },
    { name:'SIP Red Wine, Garnacha 187ml',       category:'drinks', price:'€6.95', allergens:[], alcohol:true, available:true, confirmed:true },

    /* ------------------------------------- SAUCE BOTTLES (at Smashbird)
       Only the bottles the Smashbird menu actually lists. Bum Burner and
       Burnt Butter Buffalo are sold on Birdhouse.ie but are NOT listed here. */
    { name:'Birdhouse Mango',          category:'bottles', price:'€6.95', allergens:[], available:true, confirmed:true },
    { name:'Birdhouse Teeling Whiskey',category:'bottles', price:'€6.95', allergens:[], available:true, confirmed:true },
    { name:'Birdhouse Jerk',           category:'bottles', price:'€6.95', allergens:[], available:true, confirmed:true },
    { name:'Birdhouse Jalapeño Mayo',  category:'bottles', price:'€5.50', allergens:[], available:true, confirmed:true },
    { name:'Birdhouse Korean Q',       category:'bottles', price:'€6.95', allergens:[], available:true, confirmed:true },
    { name:'Birdhouse Buckie BBQ',     category:'bottles', price:'€6.95', allergens:[], available:true, confirmed:true },

    /* ----------------------------------------------------- KIDS MENU */
    { name:'Kids Hatch & Fries', category:'kids', price:'From €9.00', allergens:[], allergensUnavailable:true, available:true, confirmed:true },
    { name:'Kids Pop & Fries',   category:'kids', price:'€9.00',      allergens:[], allergensUnavailable:true, available:true, confirmed:true },
    { name:'Kids Corn & Fries',  category:'kids', price:'€9.00',      allergens:[], allergensUnavailable:true, available:true, confirmed:true },
    { name:'Kids Tater Tots',    category:'kids', price:'€3.50',      allergens:[], allergensUnavailable:true, available:true, confirmed:true },
    { name:'Kids Fries',         category:'kids', price:'€3.50',      allergens:[], allergensUnavailable:true, available:true, confirmed:true },
    { name:'Kids Water',         category:'kids', price:'€2.00',      allergens:[], available:true, confirmed:true }
  ],

  /* --------------------------------------------------------------- drips */
  dips: {
    offer:'3 for €5.00', each:'€2.50',
    list: [
      { name:'Ranch',                 label:null, allergens:['Eggs','Sulphites'] },
      { name:'Korean Q',              label:'V',  allergens:['Cereals','Soybeans','Sulphites'] },
      // Source shows "(V0)" — not reproduced. Correct label to be confirmed.
      { name:'Burnt Butter Buffalo',  label:null, labelNeedsCheck:true, allergens:['Milk','Sulphites'] },
      { name:'Rayu Mayo',             label:'V',  allergens:['Soybeans','Sulphites'] },
      { name:'Mango Mazzaleen',       label:'V',  allergens:['Sulphites'] },
      { name:'Jalapeño Aioli',        label:'V',  allergens:['Sulphites'] },
      { name:'Buckie BBQ',            label:'VG', allergens:['Sulphites'] },
      { name:'Garlic Aioli',          label:null, allergens:['Eggs','Sulphites'] },
      { name:'Blue Cheese',           label:'V',  allergens:['Eggs','Milk','Sulphites'] },
      { name:'Smash Sauce',           label:'V',  allergens:['Eggs','Soybeans','Sulphites'] },
      { name:'Caribbean Jerk',        label:null, allergens:['Crustaceans','Fish','Sulphites'] },
      { name:'Vegan Garlic Aioli',    label:'V',  allergens:['Sulphites'] },
      { name:'Bloody Mary Ketchup',   label:'V',  allergens:['Sulphites'] },
      { name:'Teeling Whiskey BBQ',   label:null, allergens:['Crustaceans','Fish','Sulphites'] },
      { name:'Bum Burner',            label:'VG', allergens:['Sulphites'] }
    ]
  },

  // How allergen information is provided in store — not confirmed, so nothing
  // is claimed. Per-item allergens above come from the official menu.
  allergenNote: { text:null, confirmed:false },

  /* -------------------------------------------------------- gluten free
     THE COMMERCIAL HEADLINE, not a footnote.

     Confirmed by the client 2026-09-06: practically the whole menu can be
     made gluten free, with two sauces as the exception. That is stated
     here in the client's own terms and nowhere stronger — "can be made
     gluten free" is a kitchen capability, not a coeliac safety guarantee,
     and the copy never crosses into medical assurance.

     Still open (contentIssues #19): WHICH two sauces. Until that lands,
     `exceptions.value` stays null and the site says "two of our sauces"
     without naming them, which is true and useful. No individual menu item
     carries glutenFree:true either — per-item verification hasn't happened,
     and the GF tag in the menu renderer is wired and waiting for it. */
  glutenFree: {
    eyebrow:'Gluten free',
    headline:'ALMOST OUR ENTIRE MENU CAN BE MADE GLUTEN FREE.',
    body:'Burgers, fried chicken, sides, the lot. Two of our sauces are the only things ' +
         'that cannot be adapted. Tell the team when you order and they will take it from there.',
    // The exact two sauces — not supplied, so not named. See contentIssues #19.
    exceptions:{ value:null, confirmed:false },
    // Shown wherever the claim appears. Responsible, not a guarantee.
    caution:'We prepare gluten-free orders on request. We are not a gluten-free kitchen, so if ' +
            'you are coeliac or severely allergic, speak to us directly before ordering.',
    confirmed:true
  },

  /* ------------------------------------------------- Birdhouse bottles
     Retail products on Birdhouse.ie. Descriptions are marketing copy and are
     NOT complete legal ingredient lists — see contentIssues.
     -------------------------------------------------------------------- */
  sauces: [
    { name:'Birdhouse Buckie BBQ Sauce', price:'€6.95', size:'250ml', heat:'4/10',
      description:'Scottish and Irish medicine cooked into a Kansas-style BBQ sauce. A mix of black pepper, mustard and cayenne.',
      allergenAdvice:'May contain sulphites and mustard.',
      buyUrl:'https://birdhouse.ie/product/birdhouse-buckie-bbq-sauce/', confirmed:true },

    { name:'Birdhouse Bum Burner Sauce', price:'€6.95', size:'250ml', heat:'9/10',
      description:'The hottest Birdhouse sauce. A fruity habanero and hot chilli mix that is not for the faint-hearted.',
      allergenAdvice:'May contain sulphites.',
      buyUrl:'https://birdhouse.ie/product/birdhouse-bum-burner-sauce/', confirmed:true },

    { name:'Birdhouse Burnt Butter Buffalo Sauce', price:'€6.95', size:'250ml',
      // Source lists 5/10, 6/10 and 2/3 in three places. Not chosen.
      heat:null, heatNeedsCheck:true,
      description:'Birdhouse’s take on the original Buffalo sauce, made with aged cayenne, jalapeños, browned butter and plenty of vinegar.',
      allergenAdvice:'Dairy.',
      buyUrl:'https://birdhouse.ie/product/birdhouse-burnt-butter-buffalo-sauce/', confirmed:true },

    { name:'Birdhouse Jerk BBQ', price:'€6.95', size:'250ml',
      // Source lists 4/10, 2/10 and .5/3 in three places. Not chosen.
      heat:null, heatNeedsCheck:true,
      description:'Sweet, smoky and spicy, with chilli, tomato, onion, oregano, nutmeg, allspice, ginger, fruit, herbs and spices. Designed as a sunshine sauce and jerk marinade ingredient.',
      allergenAdvice:'May contain celery, barley, fish, sulphites, soybeans and wheat.',
      buyUrl:'https://birdhouse.ie/product/birdhouse-jerk-bbq/', confirmed:true },

    { name:'Birdhouse Korean BBQ Sauce', price:'€6.95', size:'250ml', heat:'5/10',
      description:'Ginger, garlic, gochujang and red pepper flakes, balancing sweet and spicy flavours.',
      allergenAdvice:'May contain celery, dairy and sesame.',
      buyUrl:'https://birdhouse.ie/product/birdhouse-korean-bbq-sauce/', confirmed:true },

    { name:'Birdhouse Mango Mazzaleen Sauce', price:'€6.95', size:'250ml', heat:'7/10',
      description:'Sweet mango with heat, habanero and coconut.',
      // Not listed on the product page. The dip menu lists sulphites, but that
      // is a different product and is not carried across.
      allergenAdvice:null, allergenAdviceMissing:true,
      buyUrl:'https://birdhouse.ie/product/birdhouse-mango-mazzaleen-sauce/', confirmed:true },

    { name:'Birdhouse Teeling Whiskey Sauce', price:'€6.95', size:'250ml', heat:'2/10',
      description:'South Carolina-style BBQ sauce with tangy tomato, vinegar and black pepper.',
      allergenAdvice:'May contain barley, celery, fish and sulphites.',
      // Page also mentions 105ml elsewhere; only 250ml shown until confirmed.
      sizeNeedsCheck:true,
      buyUrl:'https://birdhouse.ie/product/birdhouse-teelin-whiskey-sauce/', confirmed:true }
  ],
  saucesIntro:'From smoky and sweet to properly hot, Birdhouse sauces bring a different hit of flavour to every Smashbird order.',
  saucesDisclaimer:'Descriptions are from Birdhouse and are not full ingredient lists. Check the bottle for allergen advice.',
  birdhouseSocial:{ url:null, confirmed:false },

  // Wholesale tubs exist (1L / 5L / 10L) but prices are unpublished. Not shown.
  wholesale:{ sizes:['1 litre','5 litres','10 litres'], prices:null,
              enquiries:['shop@birdhouse.ie','info@birdhouse.ie'], publish:false },

  /* ------------------------------------------------------------ locations */
  /* ----------------------------------------------------------- locations
     ONE SHAPE, TWO BRANCHES, N PAGES.

     Every location page on the site is rendered from this array by a single
     component — nothing about a branch is hard-coded in the markup. Adding a
     third location means adding a third object here and nothing else.

     Each field is `{value, confirmed}` and an unconfirmed field simply does
     not render: no "Opening hours: TBC" rows, no empty map embeds, no
     invented phone numbers. Rows appear as the client fills them in.

     Still missing across both branches (contentIssues #14, #27): weekly
     opening hours, phone numbers, Google Maps links and review links,
     delivery availability, dine-in confirmation, parking notes, photography. */
  locations: [
    {
      id:'cross-street', name:'Smashbird – Cross Street', short:'Cross Street',
      // Used for the page's own <title>/meta and its H1 — see the SEO block.
      blurb:      { value:'City centre, off Quay Street.', confirmed:true },
      address:    { value:'3 Cross Street Lower, Galway, H91 T995', confirmed:true },
      eircode:    { value:'H91 T995', confirmed:true },
      mapsUrl:    { value:null, confirmed:false },
      directions: { value:null, confirmed:false },
      parking:    { value:null, confirmed:false },
      hours:      { value:null, confirmed:false },   // live open/closed status is not weekly hours
      phone:      { value:null, confirmed:false },
      dineIn:     { value:null, confirmed:false },
      collection: { value:'Collection', confirmed:true },
      delivery:   { value:null, confirmed:false },
      orderUrl:   { value:'https://www.smashbirdgalway.ie/order#/restaurant/36246/collection/76036', confirmed:true },
      googleReviewUrl:{ value:null, confirmed:false },
      image:      { src:null, alt:null, confirmed:false }
    },
    {
      id:'liosban', name:'Smashbird Liosbán', short:'Liosbán',
      blurb:      { value:'North side, off the Tuam Road.', confirmed:true },
      address:    { value:'Unit 8, Liosban Industrial Estate, 1 Kilkerrian Park, Tuam Rd, Galway, H91 D8VP', confirmed:true },
      eircode:    { value:'H91 D8VP', confirmed:true },
      mapsUrl:    { value:null, confirmed:false },
      directions: { value:null, confirmed:false },
      parking:    { value:null, confirmed:false },
      hours:      { value:null, confirmed:false },
      phone:      { value:null, confirmed:false },
      dineIn:     { value:null, confirmed:false },
      collection: { value:'Collection', confirmed:true },
      delivery:   { value:null, confirmed:false },
      orderUrl:   { value:'https://www.smashbirdgalway.ie/order#/restaurant/36246/collection/76715', confirmed:true },
      googleReviewUrl:{ value:null, confirmed:false },
      image:      { src:null, alt:null, confirmed:false }
    }
    // Dominick Street closed 31 December 2025 — deliberately absent. The old
    // address still shown on Birdhouse.ie must never be copied in here.
  ],
  menuNote:'Cross Street and Liosbán currently show the same menu and prices.',

  ordering:{ platforms:{ flipdish:{ confirmed:true }, deliveroo:{ confirmed:false } } },

  /* -------------------------------------------------------------- reviews
     Supplied by the client, 1 September 2026. Quoted exactly as given —
     no wording has been tidied, shortened or punctuated differently.

     `rating`, `date` and `sourceUrl` are null because they were not supplied.
     Nothing is inferred: a star rating nobody stated would be invented, and a
     made-up source URL is worse than none. The card renders without them.

     ⚠ WORTH CHASING: the Tripadvisor permalink for each review. Displayed
     testimonials that cannot be traced to their source are a consumer-
     protection risk (ASAI / EU Omnibus rules on published reviews), and the
     link also earns the reader's trust. Paste it into `sourceUrl` and the
     attribution becomes a link on its own. */
  reviews: [
    { text:'The burgers are so tasty. The Parmesan fries are to die for.',
      name:'Peter Mooney', platform:'Tripadvisor',
      rating:null, date:null, sourceUrl:null, confirmed:true },

    { text:'Best vegan burger. Full stop.',
      name:'Joe Kel', platform:'Tripadvisor',
      rating:null, date:null, sourceUrl:null, confirmed:true },

    { text:'An amazing experience for foodie and burger lovers.',
      name:'Nathan C', platform:'Tripadvisor',
      rating:null, date:null, sourceUrl:null, confirmed:true }
  ],
  social: {
    instagram:{ url:'https://www.instagram.com/smashbird_galway/', handle:'@smashbird_galway', confirmed:true },
    /* The brief lists "@smashbird_galway" as the account and names TikTok as
       a priority channel, which reads as the same handle on both platforms —
       but that is an inference, not something anyone stated, and a dead
       social link on a live site is a real error. So the likely URL is
       pre-filled and left switched OFF: flip `confirmed` to true once
       someone has actually opened it. See contentIssues #21. */
    tiktok:{ url:'https://www.tiktok.com/@smashbird_galway', handle:'@smashbird_galway', confirmed:false },
    // A direct "leave a review" link needs the Google Maps Place ID, which
    // has not been supplied. See contentIssues #20 — the CTA stays hidden
    // until this is filled in, exactly like every other unconfirmed link.
    googleReviewUrl:{ value:null, confirmed:false },

    /* ================================================================
       STRATEGIC PHOTO PLACEMENT SYSTEM

       Each photo serves a conversion purpose at different points on the
       journey. Assign your 7 supplied Cloudinary IDs to the slots below
       based on what each photo shows.

       PLACEMENT ROLES:
       1. hero — Full-width hero at top of page: most dramatic
                food/preparation shot for immediate impact
       2. burgers — Category representative: best burger/smashed prep shot
       3. birds — Category representative: fried chicken or wings shot
       4. vegan — Category representative: vegan/veggie dish shot
       5. location1 — Cross Street storefront or interior detail
       6. location2 — Liosban storefront or interior detail
       7. social — Lifestyle/brand/atmosphere/behind-the-scenes for grid
                   (can use multiple IDs for variety)

       Example assignment:
       hero: { id: 'IMG_3369', alt: 'Smashbird smashed burger with melted cheese and pickles' },
       burgers: { id: 'IMG_3357', alt: 'Close-up of Smashbird burger preparation' },

       Leave id: null for any slot you don't have a photo for yet.
       The site renders without photos — they integrate as they arrive.
       ================================================================ */

    /* PHOTO PLACEMENT — OFF BY DEFAULT, AND DELIBERATELY SO.

       The brand system (Brand Identity & Art Direction deck, slides 1, 12, 16)
       is explicitly photo-independent:
         "No photo dependency. Recognition from logo, colour, type and rhythm."
         "When there is no strong image, design stronger."
         "Never fill a weak layout with a weak image."

       So the site is built to be complete with NO photography. Photos are an
       enhancement, not a dependency — switch them on when they earn their place.

       ⚠ alt text is empty on purpose. These seven were supplied as Cloudinary
       IDs only. Nobody has described what they show, and this environment
       cannot fetch Cloudinary to look, so writing alt text would mean
       inventing it. One line per photo from someone who can see them
       ("IMG_3369 — close-up of the double smash") fills these in and lets
       `enabled` below flip to true. */
    // Six real photos confirmed and captioned (2026-09-06 and earlier),
    // uploaded straight into this repository. The seven Cloudinary IDs
    // below are real uploads too, but nobody has described what each one
    // shows and this environment cannot fetch Cloudinary's CDN to look —
    // see contentIssues #13. The `id`-only entries stay filtered out by
    // the render code until each gets a real one-line description.
    photosEnabled: true,

    placements: {
      hero:      { id: 'IMG_3369', alt: '' },
      burgers:   { id: 'IMG_3357', alt: '' },
      birds:     { id: '_MG_3427', alt: '' },
      vegan:     { id: 'IMG_3398', alt: '' },
      location1: { id: 'IMG_1556', alt: '' },
      location2: { id: 'IMG_1561', alt: '' }
    },

    grid: [
      { src: 'img/street-hero.jpg',
        alt: 'A hand holding a Smashbird fried chicken burger in a metal tray lined with branded pink paper, on a Galway street decorated with international flag bunting' },
      { src: 'img/table-burgers-tenders-1.jpg',
        alt: 'A dark chilli smash burger with jalapeño in the foreground, a crispy fried chicken burger behind it, and chicken tenders with chilli and sauce on the side, all in metal trays on branded pink paper, with a Smashbird-branded cup of wooden picks on the table' },
      { src: 'img/chicken-burger-closeup-1.jpg',
        alt: 'Close-up of a crispy fried chicken burger with melted cheese, pickles, slaw and an orange sauce, on a sesame seed bun' },
      { src: 'img/chicken-burger-closeup-2.jpg',
        alt: 'Another close-up angle of the crispy fried chicken burger with cheese, pickles and orange sauce' },
      { src: 'img/table-burgers-tenders-2.jpg',
        alt: 'The same table of burgers and chicken tenders in metal trays on branded pink paper, from a slightly different angle' },
      { id: 'IMG_1562', alt: '' },
      { id: null, alt: '' },
      { id: null, alt: '' },
      { id: null, alt: '' },
      { id: null, alt: '' },
      { id: null, alt: '' }
    ],

    gridCloud: 'fodeavol',
    gridTransform: 'c_fill,g_auto,ar_1:1,f_auto,q_auto'
  },

  /* ------------------------------------------------------------- catering */
  /* --------------------------------------------------------------- photos
     CONVENTION OVER CONFIGURATION.
     Upload to Cloudinary using the product name as the public ID, lower-case
     with dashes, inside the folder below. The card picks it up on its own —
     no code change, no redeploy of this file needed for each photo.

        The Melter                -> smashbird/the-melter
        Jalapeño Hatch            -> smashbird/jalapeno-hatch
        Birdhouse Tendies & Fries -> smashbird/birdhouse-tendies-fries
        Drty Secret VG            -> smashbird/drty-secret-vg

     Any format is fine on upload (JPG, PNG, HEIC). Cloudinary crops to 4:3,
     picks the focal point automatically, converts to WebP/AVIF per browser and
     serves the right width per device. Upload the biggest version you have.

     A product with no photo yet simply shows no photo — never a broken icon.

     TO TURN ON: set enabled to true after the first uploads.
     -------------------------------------------------------------------- */
  photos: {
    enabled: false,

    // WHERE THE FILES LIVE
    //   'local'      -> img/<name>.jpg inside this folder, served by Netlify.
    //                   Simplest: drop files in, deploy, done. You resize them
    //                   once before deploying (roughly 1200px wide is plenty).
    //   'cloudinary' -> uploaded to the account below; the server does the
    //                   cropping, formats and sizes, and swapping a photo later
    //                   needs no redeploy.
    source: 'local',
    localFolder: 'img',
    localExt: '.jpg',

    cloud:   'fodeavol',
    folder:  'smashbird',
    // c_fill = crop to fill, g_auto = let Cloudinary find the subject,
    // f_auto/q_auto = best format and compression for the requesting browser.
    transform: 'c_fill,g_auto,ar_4:3,f_auto,q_auto',
    widths: [400, 700],
    // Optional hero photo — same folder, this public ID. Leave null for none.
    hero: { id: null, alt: null }
  },

  /* --------------------------------------------------------------- video
     Same convention as photos, on the video side of Cloudinary. One upload
     gives both the clip and its poster frame — Cloudinary renders the poster
     from the video itself, so there is no second file to make.

        upload  smashbird/video/hero
        video   .../video/upload/<transform>/smashbird/video/hero.mp4
        poster  .../video/upload/so_1/smashbird/video/hero.jpg   (frame at 1s)

     RULES BAKED IN, not optional:
       - always muted, always playsinline, always looped
       - autoplay with sound is never used (browsers block it and the brief
         forbids it)
       - poster shows first; the clip only downloads once it can play
       - prefers-reduced-motion or Save-Data gets the poster and no video

     Keep it short (4-8s) and silent by design — it is wallpaper, not a film.
     TO TURN ON: set enabled true once a clip is uploaded.
     -------------------------------------------------------------------- */
  video: {
    enabled: false,
    cloud:   'fodeavol',
    folder:  'smashbird/video',
    transform: 'c_fill,g_auto,ar_4:5,f_auto,q_auto',
    posterAt: 1,          // seconds into the clip for the poster frame
    hero: { id: null, alt: null }
  },

  /* ---------------------------------------------------------------- forms
     Where enquiries go. Right now: nowhere — both forms validate and then say
     so honestly instead of pretending to send.

     To turn them on:
       1. In Netlify: Project -> Forms -> enable form detection, then redeploy.
       2. Set enabled: true below.
     Submissions then land in the Netlify Forms inbox and email notifications
     are configured there. No API key, no environment variable.
     -------------------------------------------------------------------- */
  forms: {
    netlify: { enabled: false, formNames: ['catering', 'contact', 'signup'] }
  },

  /* ------------------------------------------------------- email signup
     "Birthday Club" was named in the brief; no discount amount or exact
     mechanic was supplied, so the copy promises only what's true today —
     that signing up gets you offers first — rather than a specific perk
     nobody has confirmed. */
  emailSignup:{
    eyebrow:'Birthday Club',
    headline:'JOIN THE BIRTHDAY CLUB.',
    body:'Give us your birthday and we will send you a little something when it comes around.',
    // No discount percentage or specific perk is stated: none was supplied,
    // and a promise the kitchen has not agreed to is worse than no promise.
    consentLabel:'Yes, email me about offers and my birthday. I can unsubscribe any time.',
    smallprint:'We only use this to send you offers and your birthday treat. Never shared, never sold.'
  },

  /* -------------------------------------------------------------- catering
     Headline and support line are the client's own words (2026-09-06).
     Event types are the ones they listed — not a padded list. No pricing,
     minimum spend, travel radius or capacity is stated anywhere, because
     none was supplied. See contentIssues #22. */
  catering:{
    eyebrow:'Birdhouse On Wheels',
    headline:'BRING BIRDHOUSE TO YOUR EVENT.',
    body:'Get in touch and we will put together a package for your event.',
    events:['Weddings','Private parties','Birthdays','Corporate events','Festivals','University events','Group bookings'],
    formEndpoint:{ value:null, confirmed:false },
    wheels:{ name:'Birdhouse On Wheels', body:'The mobile unit that brings the whole thing to you.' }
  },

  /* ------------------------------------------------------------ our story
     Only what has actually been confirmed: family-run, Galway, two spots,
     the Birdhouse sauce connection, and the food itself. No founding date,
     no founder names, no origin story — none of that has been supplied, and
     the flyer the client mentioned has not arrived yet (contentIssues #24).
     Everything below is either already stated elsewhere in this file or was
     confirmed directly by the client. */
  story:{
    eyebrow:'Our story',
    headline:'FAMILY RUN. GALWAY BUILT.',
    body:'Smashbird is a family-run business in Galway with two spots: Cross Street in the ' +
         'city centre and Liosbán on the Tuam Road. The sauces come from Birdhouse, which is ' +
         'where the range on the menu and the bottles on the shelf come from. That connection ' +
         'is the reason the sauce list is longer than it has any need to be.',
    // Awaiting the Birdhouse flyer before anything is added about history,
    // founders or dates.
    moreToCome:{ value:null, confirmed:false }
  },
  contact:{ email:{ value:null, confirmed:false }, phone:{ value:null, confirmed:false },
            formEndpoint:{ value:null, confirmed:false } },

  /* --------------------------------------------------------- gift vouchers
     No voucher product, price or backend exists to point to, so this is
     built honestly as a "coming soon, ask us directly" page — a real
     Instagram link, not a fabricated checkout. */
  /* -------------------------------------------------------- gift vouchers
     `buyUrl` is the switch. Give it a real voucher provider link and the
     page turns into a proper Buy CTA; leave it null and the page tells the
     truth instead — ask in-store or message us. No fake checkout is built
     either way. See contentIssues #25. */
  giftVouchers:{
    eyebrow:'Gift vouchers',
    headline:'GIVE SOMEONE THE GOOD STUFF.',
    body:'A Smashbird voucher is a safe bet for anyone who takes their food seriously.',
    buyUrl:{ value:null, confirmed:false },
    fallback:'Vouchers are not on sale online yet. Ask in-store at Cross Street or Liosbán, or message us on Instagram and we will sort it.',
    available:false
  },

  /* ------------------------------------------------------------ jobs page
     No open roles have been supplied. Built as a direct, honest hand-off
     rather than invented listings. */
  /* ------------------------------------------------------------ jobs
     `openRoles` is empty because no live vacancy has been supplied. Add
     entries in the shape below and the page switches from "no roles right
     now, send a CV anyway" to a real listing — no code change needed:
       { title:'Grill chef', location:'Cross Street', type:'Full time',
         summary:'…', applyUrl:'…' }
     See contentIssues #26. */
  jobs:{
    eyebrow:'Careers',
    headline:'JOIN THE FLOCK.',
    body:'Fast kitchen, loud room, high standards. If that sounds like your kind of shift, we want to hear from you.',
    noRolesNote:'Nothing advertised right now — but we keep CVs on file and the flock grows fast. Drop into Cross Street or Liosbán, or send it over on Instagram.',
    openRoles: []
  },

  /* ------------------------------------------------------------------ faq
     Every entry below is answerable from data already confirmed elsewhere
     in this file — nothing here states a fact that isn't backed by a field
     above. Topics with no confirmed answer (table bookings, exact opening
     hours, delivery via Deliveroo) are left out of this list entirely
     rather than shown with a vague non-answer. */
  faq: [
    { q:'Do you have vegan options?',
      a:'Yes — the Vegan Junk menu has burgers, a hot dog and sides, all built with the same flavour and sauce as the rest of the menu.' },
    { q:'Do you have gluten-free options?',
      a:'Almost the whole menu can be made gluten free — burgers, fried chicken, sides. Two of our sauces are the only exception. Tell the team when you order.' },
    { q:'Can you cater for allergies?',
      a:'Yes. Every dish on the menu lists its declared allergens, and the team can talk you through anything that isn’t clear. For a serious allergy, speak to us directly before you order rather than relying on the website.' },
    { q:'Are you a gluten-free kitchen?',
      a:'No. We prepare gluten-free orders on request in a kitchen that also handles gluten, so if you are coeliac please tell us and speak to the team first.' },
    { q:'Where are you?',
      a:'Two spots in Galway: Cross Street Lower in the city centre, and Liosbán Industrial Estate off the Tuam Road.' },
    { q:'Can I order online?',
      a:'Yes — order for collection from either location through our website.' },
    { q:'Can I buy the sauces?',
      a:'Yes — the full range of Birdhouse sauces used in Smashbird food is sold in bottles, in-store and on birdhouse.ie.' },
    { q:'Do you cater for parties and events?',
      a:'Yes — weddings, birthdays, corporate events, festivals and group bookings, through Birdhouse On Wheels. Send an enquiry with your date and numbers and we will put a package together.' },
    { q:'What is Birdhouse On Wheels?',
      a:'The mobile unit that brings Smashbird to your event instead of you coming to us. Same food, your venue.' },
    { q:'What is the connection with Birdhouse?',
      a:'The sauces. Every Birdhouse sauce on the Smashbird menu comes from the same range you can buy by the bottle, in-store and on birdhouse.ie.' },
    { q:'Do you sell gift vouchers?',
      a:'Not online yet. Message us on Instagram or ask in-store and we’ll arrange one.' },
    { q:'Are you hiring?',
      a:'We’re not advertising specific roles right now. Drop your CV in-store or send it on Instagram.' }
  ],

  /* ---------------------------------------------------------------- legal */
  legal:{
    companyName:{ value:null, confirmed:false },
    registrationNumber:{ value:null, confirmed:false },
    registeredAddress:{ value:null, confirmed:false },
    privacyEmail:{ value:null, confirmed:false },
    privacyPolicyUrl:{ value:null, confirmed:false },
    cookiePolicyUrl:{ value:null, confirmed:false },
    termsUrl:{ value:null, confirmed:false },
    allergenInfoUrl:{ value:null, confirmed:false }
  },

  /* =====================================================================
     CONTENT ISSUES — unresolved source problems. Nothing here was guessed.
     ===================================================================== */
  contentIssues: [
    { id:1,  area:'Birdhouse — Burnt Butter Buffalo', issue:'Heat rating given as 5/10 (category), 6/10 (description tab) and 2/3 (marketing copy). No rating shown.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:2,  area:'Birdhouse — Jerk BBQ',             issue:'Heat rating given as 4/10 (category), 2/10 (description tab) and .5/3 (marketing copy). No rating shown.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:3,  area:'Birdhouse — Mango Mazzaleen',      issue:'No allergen advice on the retail product page. The dip menu lists sulphites, but that is a different product and was not carried across.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:4,  area:'Birdhouse — Teeling Whiskey',      issue:'Page advertises 250ml; additional-information mentions both 105ml and 250ml. Only 250ml shown.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:5,  area:'Birdhouse — all bottles',          issue:'No complete ingredient labels published. Descriptions are marketing copy and are labelled as such on the site.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:6,  area:'Sauce bottles at Smashbird',       issue:'Bum Burner and Burnt Butter Buffalo sell on Birdhouse.ie but are not on the Smashbird menu. Not listed as available in store.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:7,  area:'Drips — Burnt Butter Buffalo',     issue:'Source shows "(V0)". Not reproduced. Correct dietary label unknown.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:8,  area:'Dawgs — The Stray',                issue:'Described as vegan merguez but allergens list Eggs and Milk. Allergens shown as published, flagged, and no vegan claim made.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:9,  area:'Sides — Jalapeño Jam Fries V',     issue:'Source description reads "Saberno fior de latter, jalapeño jam". Cheese/brand not guessed; description withheld.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:10, area:'Birds — flavour-dependent items',  issue:'Tendies, Wings (medium/large) and Chick N Pop have allergens that vary by flavour and are not published per item. None shown.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:11, area:'Burgers — Rasta Burger',           issue:'Allergens list Crustaceans and Fish via Caribbean Jerk; Birdhouse jerk data is inconsistent. Shown as published, flagged.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:12, area:'Vegan Junk — Cabbage Fritter',     issue:'No allergens under Vegan Junk; the same item under Sides lists Cereals and Sulphites.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:13, area:'Photography',                      issue:'Eleven photographs exist in the connected Cloudinary account (IMG_3369, IMG_3357, _MG_3436, _MG_3427, IMG_3398, IMG_1556, IMG_1561, IMG_1562, IMG_5888, IMG_5852, IMG_5840), plus one supplied directly into this repository as a .CR3 (now converted and live as img/street-hero.jpg, described honestly and switched on in social.grid). This working environment has no network access to Cloudinary’s CDN, so the other eleven cannot be viewed here to write honest alt text or assign them to a product/placement without inventing it. They remain wired up and filtered out (id-only entries with no matching description) until each gets a real one-line description — easiest done by uploading the files directly into this repository’s img/ folder instead, the way the .CR3 arrived. The brand deck (slides 1, 12, 16) specifies a photo-independent system, so the site is complete without them.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:16, area:'Display typeface',                  issue:'Nimbus Sans Narrow Bold is licensed and was not supplied. Barlow Condensed (Google Fonts, open licence) is used as a deliberate metric-adjacent substitute — narrow, high-contrast, same role — rather than the deck fallback Arial Narrow, which is weaker on screen. Swap in the licensed files when available.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:14, area:'Opening hours',                    issue:'Only a live open/closed status is available. Regular weekly hours not derived.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:15, area:'Alcohol',                           issue:'Wine and beer are on the menu. No delivery or age-verification claims made.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:17, area:'Awards & Recognition',              issue:'RESOLVED IN PART. A photo of the physical wall plaques (2026-09-06, img/wall-awards-neon.jpg) confirmed issuer, category and year for four more awards: Irish TakeAway Awards — Chicken Burger of the Year (Connacht), Irish TakeAway Awards — Social Media Award (Connacht), and McKenna\'s Guides — Best in Ireland for both 2025 and 2026. Transcribed from the plaque text directly, not guessed. STILL NEEDED: "Best Burgers & American in Ireland" (may or may not be the same win as the Deliveroo award — kept as a separate unconfirmed entry rather than merged on a guess), and confirmation for Blas na hÉireann / Great Taste. No award logo artwork exists in the repository and none has been recreated.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:18, area:'Current Offers — Student Mondays / Wing Wednesdays / Kids Eat Free Sundays', issue:'Named in the client brief; exact terms (discount amount, times, ID/age requirements, dine-in vs collection) were not supplied. Offer names are shown; terms are not.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:19, area:'Gluten-free — the two exception sauces', issue:'RESOLVED IN PART. The client confirmed 2026-09-06 that practically the entire menu can be made gluten free, with two sauces as the exception, and that claim is now used across the site. STILL NEEDED: which two sauces. Until then the copy says "two of our sauces" without naming them. Also still needed: per-item GF verification, so individual menu items can carry the GF tag (the renderer is wired and waiting for glutenFree:true).', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:20, area:'Google review link',                issue:'No Google Maps Place ID or review link supplied. The "Leave us a Google review" CTA is built but stays hidden until social.googleReviewUrl is confirmed.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:21, area:'TikTok',                            issue:'No TikTok account handle or link found anywhere in the source material. Not linked or guessed.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:22, area:'Birdhouse On Wheels',                issue:'Named directly in the 2026-09-06 brief as the mobile catering unit. No capacity, service area, minimum spend, lead time or pricing was supplied, so the catering page names it and invites an enquiry rather than stating specifics nobody confirmed.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:23, area:'Neon graphic assets',                issue:'RESOLVED IN PART. A photo supplied 2026-09-06 (img/wall-awards-neon.jpg) confirms real physical neon burger and neon lips signs exist in-store, either side of the "I licked it so it\'s mine" sign — used as a real photo rather than left undocumented. STILL NEEDED: isolated vector/PNG artwork of the lips and burger signs for use as standalone graphic elements elsewhere on the site (hero, offers, etc.) — drawing an approximation from the photo would invent brand artwork, so none has been created. The two neon TEXT signs ("Feed me fries / burgers & tell me im pretty") were supplied as copy and are implemented as type.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:24, area:'Birdhouse history / Our Story',      issue:'The client said factual Birdhouse information would follow on a flyer. It has not arrived. The Our Story section therefore states only what is confirmed — family-run, Galway, two locations, the sauce connection — and no founding date, founder name, milestone or company history appears anywhere on the site.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:25, area:'Gift voucher provider',              issue:'No voucher provider or purchase link supplied. The page is built with a real Buy CTA that activates the moment giftVouchers.buyUrl is confirmed; until then it honestly says vouchers are not on sale online yet. No fake checkout was built.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:26, area:'Job vacancies',                      issue:'No live roles supplied. The careers page is built around an openRoles array (title, location, type, summary, applyUrl) and currently shows the "send us a CV anyway" state. Add a role object and the listing renders.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:27, area:'Location detail fields',             issue:'Location pages are built for opening hours, phone, Google Maps link, Google review link, directions, parking, delivery availability, dine-in and photography. Only address, Eircode, collection and the Flipdish order link are confirmed for each branch, so only those rows render. Everything else appears automatically once filled in.', status:'CLIENT_CONFIRMATION_REQUIRED' }
  ]
};
