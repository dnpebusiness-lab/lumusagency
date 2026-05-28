/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RoomType, Amenity, LocationHighlight, FAQItem, Review } from './types';

export const IMAGES = {
  hero: "/src/assets/images/stays_hero_1779895532652.png",
  cafe: "/src/assets/images/stays_cafe_1779895551793.png",
  posterRoom: "/src/assets/images/stays_poster_1779895568395.png",
  deluxeQueen: "/src/assets/images/stays_queen_1779895586147.png",
  cosySingle: "/src/assets/images/stays_single_1779895608279.png",
  tripleRoom: "/src/assets/images/stays_triple_1779895626656.png",
};

export const CLOUDBEDS_BASE_URL = "https://www.cloudbeds.com/reservation/1997StaysGalway";

export const generateCloudbedsLink = (
  checkIn?: string,
  checkOut?: string,
  guests: number = 2,
  roomType?: string,
  promoCode?: string
): string => {
  const url = new URL(CLOUDBEDS_BASE_URL);
  if (checkIn) url.searchParams.set("checkin", checkIn);
  if (checkOut) url.searchParams.set("checkout", checkOut);
  if (guests) url.searchParams.set("guests", guests.toString());
  if (promoCode) url.searchParams.set("promo", promoCode);
  url.searchParams.set("source", "direct_booking_landing_page");
  url.searchParams.set("discount_applied", "10_percent_cafe");
  return url.toString();
};

export const ROOMS_DATA: RoomType[] = [
  {
    id: "poster-king",
    name: "Poster Room Kingsize",
    image: IMAGES.posterRoom,
    pricePerNight: 139,
    description: "Our signature, high-ceiling room featuring a majestic four-poster king size bed and cozy bespoke furnishings.",
    longDescription: "Step into our most luxurious option. The Poster Room features a handcrafted four-poster king bed draped in premium linens. Perfect for couples or single guests who appreciate spacious elegance. Set directly above Mocha Beans, the room catches the elegant morning atmosphere and offers unparalleled convenience to local landmarks. High-speed internet is fully integrated with smart bedside lighting.",
    minStay: 1,
    occupancy: "1 - 2 Guests",
    size: "24 m²",
    bedType: "Four-Poster King Bed",
    amenities: ["Contactless Check-In", "High-speed Wi-Fi", "Bespoke Work Space", "Premium Linen", "Tea & Coffee Dock", "Ironing Facilities"],
    features: ["1 minute walk to the University of Galway", "Galway University Hospital on your doorstep", "Cathedral around 5 minutes' stroll away", "City centre reachable in 12 mins via Salmon Weir Bridge"],
    cloudbedsUrl: generateCloudbedsLink("", "", 2, "poster-king")
  },
  {
    id: "deluxe-queen",
    name: "Deluxe Queen Double Bed",
    image: IMAGES.deluxeQueen,
    pricePerNight: 119,
    description: "An exceptionally styled queen room with gorgeous natural morning light and easy breakfast access downstairs.",
    longDescription: "The Deluxe Queen blends functionality with warm boutique elegance. Featuring a spacious queen double bed with thick custom duvets, it is ideal for professionals, visitors to Galway University Hospital, or couples on a quick west of Ireland city break.",
    minStay: 1,
    occupancy: "1 - 2 Guests",
    size: "18 m²",
    bedType: "Queen Double Bed",
    amenities: ["Contactless Check-In", "High-speed Wi-Fi", "Dedicated Coffee Station", "Premium Duvet Sheets", "Smart USB Outlets", "Hair Dryer"],
    features: ["Steps from the hospital and university campus", "Walk to Galway Cathedral in under 8 minutes", "Salthill shoreline close by for scenic coastal morning strolls", "10% café discount active at the till downstairs daily"],
    cloudbedsUrl: generateCloudbedsLink("", "", 2, "deluxe-queen")
  },
  {
    id: "triple",
    name: "Triple Room",
    image: IMAGES.tripleRoom,
    pricePerNight: 99,
    description: "A compact, highly functional room with a master double bed and an elevated overhead bunk.",
    longDescription: "Smart spatial layouts make this cozy room highly functional. Perfect for couples travelling with a child or small group weekenders. It features a private bathroom located diagonally across the hall, key-locked exclusively for your private use.",
    minStay: 1,
    occupancy: "2 Adults + 1 Child",
    size: "15 m²",
    bedType: "Double Bed & Overhead Single Bunk",
    amenities: ["Private Entrance Key", "Exclusive Private Bathroom (diagonally across)", "High-speed Wi-Fi", "Nearby Laundry Room access", "Express Check-In / Check-Out", "Towels & Toiletries"],
    features: ["Compact bed arrangement (bunk suitable for children)", "Private locked bathroom dedicated solely to this room", "Mocha Beans Café directly downstairs for food & drink", "Outstanding budget-friendly group layout in Newcastle Location"],
    cloudbedsUrl: generateCloudbedsLink("", "", 3, "triple")
  },
  {
    id: "cosy-single",
    name: "Cosy Single",
    image: IMAGES.cosySingle,
    pricePerNight: 79,
    description: "The ideal, quiet hideaway for solo academic researchers, business travellers, or hospital guests.",
    longDescription: "Thoughtfully optimized for the modern solo traveller. The Cosy Single features clever architectural styling, custom lightwood desk workspace, high-speed connection, and immediate proximity to everything Newcastle and Galway City have to offer.",
    minStay: 1,
    occupancy: "1 Guest",
    size: "12 m²",
    bedType: "Comfortable Single Bed",
    amenities: ["Contactless Check-In", "High-speed Wi-Fi", "Minimalist Custom Desk", "Fresh Bed Linens & Towels", "USB Smart Charging", "Warm Accent Lighting"],
    features: ["Ideal location for university faculty or clinical researchers", "Quiet, non-smoking premium private retreat", "Under 12 minutes to city center attractions and shopping", "Save 10% on fresh brunch and espresso downstairs daily"],
    cloudbedsUrl: generateCloudbedsLink("", "", 1, "cosy-single")
  }
];

export const AMENITIES_DATA: Amenity[] = [
  { id: "contactless", name: "Contactless Self Check-In", description: "Enjoy keyless entry and complete flexibility. Receive access codes on the day of your arrival.", iconName: "Smartphone" },
  { id: "cafe", name: "Mocha Beans Café", description: "Ireland's favourite roastery sits directly downstairs. Get 10% off award-winning coffee, brunch, and lunch.", iconName: "Coffee" },
  { id: "speedy", name: "Express Check-In/Out", description: "Check in securely starting at 14:00, and checkout effortlessly by 12:00. No front desk waiting.", iconName: "Zap" },
  { id: "wifi", name: "Gigabit Internet Wi-Fi", description: "Blazing fast coverage in all rooms. Outstanding for remote work, academic research, and smart streaming.", iconName: "Wifi" },
  { id: "smoke-free", name: "100% Non-Smoking", description: "A pristine environment maintained across all guest rooms, hallways and common properties.", iconName: "Ban" },
  { id: "flexible", name: "24-Hour Access", description: "Come and go seamlessly at any hour with digital touchpad codes after your initial check-in time.", iconName: "KeyRound" }
];

export const LOCATION_HIGHLIGHTS: LocationHighlight[] = [
  { id: "uni", name: "University of Galway", distance: "50 metres", timeWalking: "1 min walk", description: "Directly across the street. Absolute premium choice for academic visitors, postgrad conferences, and family graduations.", category: "academic" },
  { id: "hosp", name: "Galway University Hospital", distance: "100 metres", timeWalking: "2 min walk", description: "Rounds on your doorstep. Ideal, stress-free lodging for visiting doctors, medical professionals, or family support stays.", category: "medical" },
  { id: "cathedral", name: "Galway Cathedral", distance: "500 metres", timeWalking: "5-7 min walk", description: "Stately historic cathedral overlooking the River Corrib, on the pathway connecting Newcastle to the city centre.", category: "culture" },
  { id: "town", name: "Galway City Centre (Shop Street)", distance: "1.0 km", timeWalking: "10-15 min walk", description: "Cross the newly built pedestrian Salmon Weir Bridge to enjoy live buskers, boutique shopping, and vibrant pubs.", category: "culture" },
  { id: "salthill", name: "Salthill Promenade & Seaside", distance: "2.4 km", timeWalking: "25 min walk / 5 min taxi", description: "Experience the Atlantic views. Salthill beaches, diving towers, and gorgeous morning scenery are easily accessible.", category: "coast" }
];

export const REVIEWS_DATA: Review[] = [
  { id: "rev-1", author: "Dr. Rachel Jenkins", rating: 5, stayDate: "April 2026", comment: "The absolute best location for university researchers. Literally across the street. The self check-in was seamless, and showing the booking reference downstairs at Mocha Beans saved me a small fortune on fantastic breakfasts!", roomStayed: "Poster Room Kingsize" },
  { id: "rev-2", author: "Liam O'Connor", rating: 5, stayDate: "May 2026", comment: "Cozy, beautifully designed room that felt much more personal than a big corporate hotel. Having a top-tier coffee roastery downstairs was incredible. Highly recommend the Deluxe Queen for city breaks.", roomStayed: "Deluxe Queen Double Bed" },
  { id: "rev-3", author: "Sarah & Josh", rating: 4.8, stayDate: "March 2026", comment: "We stayed in the Triple Room with our nine-year-old. Bunk was great for him. Very cleanly managed, quiet street noise, and easy walking distance across the Salmon Weir bridge onto Shop Street. Recommended!", roomStayed: "Triple Room" }
];

export const FAQS_DATA: FAQItem[] = [
  { id: "faq-1", question: "What time is check-in and check-out?", answer: "Check-in begins at 14:00 (2:00 PM), allowing you to settle in comfortably. Check-out is up until 12:00 (12:00 PM), giving you plenty of time in the morning to grab a coffee downstairs and ease out your day.", category: "General" },
  { id: "faq-2", question: "How do I claim my 10% Mocha Beans Café discount?", answer: "Simply display your digital booking confirmation email or room key correspondence to the baristas at the till in Mocha Beans Café downstairs. You will immediately receive 10% off all your craft coffees, tasty brunches, and lunches.", category: "Café Discount" },
  { id: "faq-3", question: "Does the Triple Room have a private bathroom?", answer: "Yes, the Triple Room has its own private bathroom designated exclusively for its guests. It is located diagonally across the hallway from the room door. It is fully locked and private to your room, with a laundry facility situated directly adjacent.", category: "Amenities" },
  { id: "faq-4", question: "Is the check-in contactless or virtual?", answer: "Absolutely. We employ an express, contactless digital check-in. On the day of your arrival, you will receive customized PIN codes via email/text to access both the main exterior entry and your specific room door. This offers 24-hour flexibility to arrive whenever is best for you after 14:00.", category: "Amenities" },
  { id: "faq-5", question: "How far is the property from Galway City Centre?", answer: "It is an extremely pleasant 10 to 15-minute walk (around 1 km). The route is beautiful, taking you past the Galway Cathedral and across the peaceful Salmon Weir Bridge that leads straight to Shop Street's buzzing heart.", category: "Location" },
  { id: "faq-6", question: "Is parking available nearby?", answer: "While we do not have a dedicated private multi-car garage, street parking is available along Lower Newcastle and around the University of Galway/Hospital properties. There are public pay-and-display options and accessible loading spots right outside our doors.", category: "General" },
  { id: "faq-7", question: "Is the property suitable for University of Galway or Hospital visits?", answer: "It is arguably the best-suited guest house in all of Galway. We are directly across the street from the University of Galway campus gates and just a 2-minute walk from the Galway University Hospital diagnostic wings and ward entries.", category: "Location" },
  { id: "faq-8", question: "Is there Wi-Fi included and is remote work possible?", answer: "Yes, we have high-speed commercial gigabit Wi-Fi running throughout the property. Every room acts as a peaceful study space, especially the Cosy Single and King Poster Rooms, which boast dedicated study/desk workspace setups.", category: "Amenities" }
];
