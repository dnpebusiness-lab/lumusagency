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
    // CLIENT_CONFIRMATION_REQUIRED — official logo files not supplied.
    // The mark in index.html is a hand-drawn SVG approximation and MUST be
    // replaced with the supplied artwork before launch.
    logo: {
      stacked:    { src: null, confirmed: false },
      horizontal: { src: null, confirmed: false },
      avatar:     { src: null, confirmed: false }
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

  /* ----------------------------------------------------------- proof strip */
  proof: [
    { text:'WINNER — BEST BURGER & AMERICAN, DELIVEROO RESTAURANT AWARDS 2025', confirmed:true },
    { text:'VEGAN & GLUTEN-FREE OPTIONS',  confirmed:true },
    { text:'TWO GALWAY LOCATIONS',         confirmed:true },
    { text:'BIRDHOUSE SAUCES',             confirmed:true }
  ],

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
  locations: [
    {
      id:'cross-street', name:'Smashbird – Cross Street', short:'Cross Street',
      address:   { value:'3 Cross Street Lower, Galway, H91 T995', confirmed:true },
      mapsUrl:   { value:null, confirmed:false },
      hours:     { value:null, confirmed:false },   // live open/closed status is not weekly hours
      phone:     { value:null, confirmed:false },
      dineIn:    { value:null, confirmed:false },
      collection:{ value:'Collection', confirmed:true },
      delivery:  { value:null, confirmed:false },
      orderUrl:  { value:'https://www.smashbirdgalway.ie/order#/restaurant/36246/collection/76036', confirmed:true },
      image:     { src:null, alt:null, confirmed:false }
    },
    {
      id:'liosban', name:'Smashbird Liosbán', short:'Liosbán',
      address:   { value:'Unit 8, Liosban Industrial Estate, 1 Kilkerrian Park, Tuam Rd, Galway, H91 D8VP', confirmed:true },
      mapsUrl:   { value:null, confirmed:false },
      hours:     { value:null, confirmed:false },
      phone:     { value:null, confirmed:false },
      dineIn:    { value:null, confirmed:false },
      collection:{ value:'Collection', confirmed:true },
      delivery:  { value:null, confirmed:false },
      orderUrl:  { value:'https://www.smashbirdgalway.ie/order#/restaurant/36246/collection/76715', confirmed:true },
      image:     { src:null, alt:null, confirmed:false }
    }
    // Dominick Street closed 31 December 2025 — deliberately absent. The old
    // address still shown on Birdhouse.ie must never be copied in here.
  ],
  menuNote:'Cross Street and Liosbán currently show the same menu and prices.',

  ordering:{ platforms:{ flipdish:{ confirmed:true }, deliveroo:{ confirmed:false } } },

  /* -------------------------------------------------------------- reviews */
  reviews: [],
  social: {
    instagram:{ url:'https://www.instagram.com/smashbird_galway/', handle:'@smashbird_galway', confirmed:true },
    grid: []
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
    netlify: { enabled: false, formNames: ['catering', 'contact'] }
  },

  catering:{
    headline:'BRING SMASHBIRD TO THE PARTY.',
    body:'Birthdays, work parties, weddings or private events — bring the Smashbird and Birdhouse flavour to your crowd.',
    formEndpoint:{ value:null, confirmed:false }
  },
  contact:{ email:{ value:null, confirmed:false }, phone:{ value:null, confirmed:false },
            formEndpoint:{ value:null, confirmed:false } },

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
    { id:13, area:'Photography',                      issue:'All photography removed at client request; the site now runs on CSS 3D instead. Real food photography is still needed before launch — a menu without product images converts worse.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:14, area:'Opening hours',                    issue:'Only a live open/closed status is available. Regular weekly hours not derived.', status:'CLIENT_CONFIRMATION_REQUIRED' },
    { id:15, area:'Alcohol',                           issue:'Wine and beer are on the menu. No delivery or age-verification claims made.', status:'CLIENT_CONFIRMATION_REQUIRED' }
  ]
};
