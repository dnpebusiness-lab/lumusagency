# Smashbird — Strategic Photo Placement Guide

## Overview

Your 7 Cloudinary photos are now strategically placed throughout the site to drive engagement and conversion — not just grouped in a static grid.

Each placement serves a specific purpose in the customer journey. Assign your photos to the roles below based on **what each photo shows**.

---

## Placement Roles & Strategy

### **1. Hero Section** (Full-Width, Top of Page)
- **Purpose**: First impression. Stop scrolling, build desire.
- **Role**: `placements.hero`
- **Best for**: Your most dramatic food/preparation shot
  - Smashed burger close-up with visible crust and toppings
  - Fried chicken mid-fry with steam
  - Sauce dripping / food in action
  - Something visually striking that says "serious food"

### **2. Burgers Category** (Section Visual)
- **Purpose**: Break up text, represent the category, drive clicks.
- **Role**: `placements.burgers`
- **Best for**: A classic Smashbird smashed burger shot
  - Classic burgers look (pressed thin patties, melted cheese, pickles)
  - Shows preparation quality
  - Any Smashbird burger at its best

### **3. Fried Chicken Category** (Section Visual)
- **Purpose**: Show range, represent the Birds category.
- **Role**: `placements.birds`
- **Best for**: Crispy fried chicken or wings shot
  - Golden, crispy bird
  - Wings, tenders, or whole pieces
  - Clean, appetizing presentation

### **4. Vegan / Loaded Category** (Section Visual)
- **Purpose**: Represent alternative offerings, show quality.
- **Role**: `placements.vegan`
- **Best for**: Vegan burger, vegan junk, or loaded sides
  - Plant-based protein that looks hearty
  - Loaded fries or sides
  - Something colorful and texturally interesting

### **5. Cross Street Location** (Location Card)
- **Purpose**: Build trust, show physical presence.
- **Role**: `placements.location1`
- **Best for**: Cross Street storefront or interior detail
  - Storefront exterior (sign, entrance)
  - Interior counter/kitchen detail
  - Atmospheric shot of the space
  - Order counter or seating area

### **6. Liosban Location** (Location Card)
- **Purpose**: Build trust, show physical presence.
- **Role**: `placements.location2`
- **Best for**: Liosban storefront or interior detail
  - Storefront exterior (sign, entrance)
  - Interior counter/kitchen detail
  - Atmospheric shot of the space
  - Different angle/area than Cross Street

### **7. Social Proof Grid** (Up to 7 Photos)
- **Purpose**: Lifestyle, brand personality, social proof.
- **Role**: `social.grid` array
- **Best for**: Multiple photos that aren't assigned elsewhere
  - Customer moments
  - Behind-the-scenes prep
  - Sauce bottles or product detail shots
  - Team/brand atmosphere
  - Can be the same photos used above, or different ones

---

## How to Assign Photos

Edit `content.js` and find the `social.placements` section. For each placement, assign your Cloudinary ID:

```javascript
placements: {
  hero: { id: 'IMG_3369', alt: 'Smashbird smashed burger with melted cheese and pickles' },
  burgers: { id: 'IMG_3357', alt: 'Classic Smashbird double burger being pressed' },
  birds: { id: '_MG_3427', alt: 'Golden fried chicken wings with crispy coating' },
  vegan: { id: 'IMG_3398', alt: 'Loaded vegan burger with fresh toppings' },
  location1: { id: 'IMG_1556', alt: 'Cross Street storefront entrance' },
  location2: { id: 'IMG_1561', alt: 'Liosban location interior' }
}
```

For the social grid, list any additional photos (can be the ones used above, or new ones):

```javascript
grid: [
  { id: 'IMG_1562', alt: 'Sauce bottles on shelf' },
  { id: null, alt: '' },    // Leave null if you don't have this many photos yet
  { id: null, alt: '' }
]
```

---

## What Happens Where

| Location | What Users See | When |
|----------|---|---|
| **Hero** | Large photo behind the brand lines | Immediately on load (above the fold) |
| **Burgers section** | Photo on left, text on right | When scrolling to Burgers category description |
| **Birds section** | Photo on right, text on left | When scrolling to Fried Chicken description |
| **Vegan section** | Photo on left, text on right | When scrolling to Vegan Junk description |
| **Locations page** | Small photo at top of each location card | When user goes to Locations page |
| **Instagram section** | Square grid of photos | At bottom of page (social proof) |

---

## Important Rules

1. **Only assign photos you can identify.** Leave `id: null` for slots you're unsure about.
2. **Alt text is mandatory.** Describe what's in each photo in simple terms (for accessibility).
3. **Photos integrate as they arrive.** Don't have a location photo yet? Leave it null. The site renders fine without it.
4. **Each photo can appear in multiple places** — you could use the same hero photo in the social grid if it fits.
5. **No photos will break the site.** If a photo fails to load, it quietly removes itself.

---

## Photo Assignment Template

Print this and fill in as you review each photo:

```
IMG_3369: [best burger / prep shot / location / atmosphere / other?]
IMG_3357: [best burger / prep shot / location / atmosphere / other?]
_MG_3427: [best burger / prep shot / location / atmosphere / other?]
IMG_3398: [best burger / prep shot / location / atmosphere / other?]
IMG_1556: [best burger / prep shot / location / atmosphere / other?]
IMG_1561: [best burger / prep shot / location / atmosphere / other?]
IMG_1562: [best burger / prep shot / location / atmosphere / other?]
```

Once you identify each one, match them to the placement roles above and update `content.js`.

---

## Next Steps

1. Review each of your 7 photos and note what they show
2. Assign them to the placement roles that best fit
3. Fill in the alt text descriptions
4. Update `content.js` with the assignments
5. Redeploy to Netlify
6. The site now shows photos at strategic moments in the customer journey

No more empty placeholders. No more static grid. Photos at work.
