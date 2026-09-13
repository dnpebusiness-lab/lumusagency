# Little Bo Peep — Design System

## Brand Identity
- **Name**: Little Bo Peep Spanish Wear Galway
- **Position**: Premium, independent children's boutique specialising in Spanish and designer childrenswear
- **Location**: Main Street, Spiddal, Galway, Ireland
- **Tone**: Warm, approachable, family-focused, premium but not corporate, editorial

## Visual Direction
**Keyword**: Colorato e playful (but premium, not cartoonish)

### Design Principles
1. **Mobile-first** — Primary experience optimized for mobile ecommerce
2. **Product-led** — Large, beautiful imagery takes priority
3. **Editorial** — Storytelling through photography and layout, not walls of text
4. **Boutique warmth** — Independent, carefully curated, personal
5. **Premium clarity** — Professional ecommerce UX (like Childrensalon) but with boutique soul (like Clark & Beau)
6. **Playful refinement** — Color and motion that feel sophisticated, not cheap or cartoon-ish

### Colour Palette
**Neutrals (primary):**
- Off-white: `#FAFAF8` (warm, creamy)
- Soft beige: `#F5F1E8` (light backgrounds)
- Charcoal: `#2C2C2C` (text, navigation)
- Muted grey: `#9A9A9A` (supporting text)

**Accents (playful, sophisticated):**
- Soft coral: `#E8A89B` (warm, playful)
- Muted sage: `#A8C5A8` (balance, nature)
- Powder blue: `#B8D4E8` (soft, gentle)
- Warm gold: `#D4A574` (luxury, accents)
- Soft blush: `#F0D4D0` (delicate)

**Use rule:** Neutrals dominate; accents appear in hero campaigns, badges, hover states, and category highlights. Never more than 2 accent colors per page.

### Typography
**Headings**: Georgia or similar elegant serif (tribute to boutique heritage)
- H1: 48px / 54px, bold, letter-spacing -0.02em
- H2: 36px / 42px, semi-bold
- H3: 28px / 32px, medium
- H4: 20px / 24px, medium

**Body**: Inter or similar clean sans-serif
- Body text: 16px / 1.6 line-height, charcoal
- Caption/supporting: 14px / 1.5 line-height, muted grey
- UI labels: 13px, uppercase, letter-spacing 0.05em (Montserrat style)

**Contrast**: Serif (Georgia) for emotional/editorial, Sans-serif for UX clarity

### Spacing System
- **Base unit**: 8px
- **Rhythm**: 8px, 16px, 24px, 32px, 48px, 64px, 96px
- **Section gutters**: 48px (desktop), 24px (mobile)
- **Card padding**: 16px (mobile), 24px (desktop)
- **Whitespace rule**: Every section has breathing room; no content is cramped

### Component Styling

#### Buttons
- **Primary**: Soft coral background, white text, 16px, rounded-md, 4px border-radius
- **Hover**: Slightly darker (opacity -10%), smooth 200ms transition
- **Secondary**: Transparent with charcoal border, charcoal text
- **Disabled**: Muted grey background, grey text, cursor not-allowed
- **Size**: 44px min height (touch target), 16px horizontal padding

#### Product Cards
- **Layout**: Image on top, 100% width
- **Image**: 1:1 aspect ratio (carousel on hover to show 2nd image)
- **Hover**: Slight image zoom (1.05), soft shadow (0 8px 16px rgba(0,0,0,0.1))
- **Title**: 16px, charcoal, line-clamp 2
- **Brand**: 13px, muted grey, uppercase
- **Price**: 18px, bold, charcoal; sale price in soft coral
- **Badge**: Powder blue, 12px, uppercase, rounded-full, 8px padding

#### Navigation
- **Desktop**: Sticky header, dark background (charcoal), white logo, mega-menu on hover
- **Mega menu**: 2-3 columns, includes category links + featured image + new-arrivals spotlight
- **Mobile**: Slide-in drawer, smooth 300ms animation, nested categories, search at top
- **Hover state**: Text underline (soft coral, 2px), smooth animation

#### Cart Drawer
- **Trigger**: Icon in header (sticky on mobile)
- **Animation**: Slide-in from right, 300ms ease-out, semi-transparent overlay
- **Content**: Product image, name, size, quantity, price; remove link; subtotal; checkout CTA
- **Confirmation**: Toast notification after add-to-cart, fade-in 300ms

### Motion & Animation
**Timing:**
- Micro-interactions (hover, click feedback): 150–250ms
- Menus, drawers: 250–400ms
- Section entrances: 400–700ms
- Hero reveals: 600–1000ms

**Techniques:**
- Prefer CSS transforms (scale, translateY, opacity)
- Use ease-out easing for natural motion
- Avoid aggressive parallax; use subtle reveals instead
- Loading states: skeleton screens, not spinners

**Examples:**
- Product card on load: fade-up + 50ms stagger
- Hero text: fade-in + soft scale-up on page load
- Section reveal: fade-in + small translateY as viewport enters
- Button hover: background color fade + slight scale (1.02)

### Responsive Breakpoints
- **Mobile**: 375px–768px
- **Tablet**: 768px–1024px
- **Desktop**: 1024px+
- **Max content width**: 1280px (desktop), 100% − 24px (mobile)

### Images
- **Product grid desktop**: 3–4 columns depending on screen
- **Product grid mobile**: 2 columns, full bleed
- **Hero**: Full-width, 60vh on desktop, 70vh on mobile
- **Editorial blocks**: 1:1 to 4:3 aspect ratio, image priority
- **Loading**: Use `loading="lazy"` and blurred placeholder (LQIP) where supported

### Form Styling
- **Inputs**: 44px height, 16px padding, soft grey border (#E8E8E8), 4px border-radius
- **Focus**: Soft coral border (2px), no outline
- **Labels**: 14px, charcoal, 8px above input, uppercase
- **Validation**: Error text in soft coral, success in muted sage

### Trust Elements
- **Delivery info**: Clear in header/footer + near CTA on product pages
- **Returns policy**: Accessible in footer (14 days, perfect condition, tags on)
- **Size guide**: Dropdown/modal on product page with visual chart
- **FAQ**: Dedicated page + accordion sections
- **Social proof**: Customer testimonials (optional), Instagram feed (optional)

### Accessibility
- **Color contrast**: WCAG AA minimum (4.5:1 for text)
- **Focus states**: Visible outline or underline on all interactive elements
- **Motion**: Respect `prefers-reduced-motion`; offer simplified experience
- **Keyboard nav**: Tab through header, mega-menu, product grid, footer
- **Alt text**: All images have meaningful alt text
- **Form labels**: Always associated with inputs

### Performance Targets
- **Lighthouse**: 90+ across all categories
- **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1
- **Mobile speed**: First Contentful Paint <1.8s on 4G
- **Images**: WebP where supported, srcset for responsiveness, lazy loading
- **CSS/JS**: Minified, no render-blocking resources, async script loading

---

## Page Templates

### Homepage
1. **Announcement bar** — Promo code or message (e.g., "Use code FIRST for 10% off")
2. **Header** — Logo, navigation (New In, Girls, Boys, Baby, Spanish Clothing, Occasionwear, Brands, Sale), search, cart, account
3. **Hero section** — Full-width lifestyle image + campaign text + CTA ("Shop New In" or seasonal message)
4. **Category cards** — 6–8 buttons/tiles (Girls, Boys, Baby, Spanish Clothing, Occasionwear, New In, Best Sellers, Sale)
5. **Featured collection** — "Little Bo Peep Smocks" or current seasonal highlight with 4–6 products
6. **"Shop by" section** — Age/gender/occasion (optional editorial block)
7. **New arrivals** — Horizontal scroller or grid, 6–8 products
8. **Best sellers** — Curated products, 4 per row desktop / 2 per row mobile
9. **Brand spotlight** — Editorial block featuring a partner brand (e.g., Miranda, Sonata)
10. **Social proof** — Instagram feed or customer testimonials (optional)
11. **Newsletter signup** — "Join the Little Bo Peep family" + email input + soft CTA
12. **Footer** — Links (Shop, About, FAQ, Contact, Delivery, Returns, Blog, Social), payment icons, copyright

### Collection Page
- **Header** — Collection title, optional short description
- **Filters** (desktop sidebar / mobile bottom sheet) — Age, Size, Gender, Brand, Category, Color, Price, Availability
- **Sort** — Default (featured), Price (low–high, high–low), Newest, Bestselling
- **Product count** — "Showing X of Y products"
- **Product grid** — 3–4 columns (desktop), 2 columns (mobile), with staggered fade-up animation on load
- **Pagination** — Load More button or page numbers

### Product Page
- **Image gallery** — Large primary image + carousel/thumbnails, swipeable on mobile
- **Product info** — Title, Brand, Price (with sale price if applicable), Star rating (optional)
- **Variant selector** — Size + Color dropdowns with visual swatches
- **Stock status** — "In stock" / "Low stock" / "Out of stock"
- **Add to Bag CTA** — Prominent button, 44px, full-width on mobile
- **Tabs** — Description, Materials, Care, Delivery, Returns
- **You May Also Like** — Related products (4 per row desktop, 2 per row mobile)
- **Recently Viewed** — Horizontal scroller (optional)

### About Page
- **Hero** — Brand image + "About Little Bo Peep"
- **Story section** — 1–2 paragraphs + image
- **Values** — 3–4 visual blocks (Quality, Heritage, Curated, Service)
- **Brands we stock** — Grid of partner logos
- **Contact info** — Address, email, phone, hours

### FAQ Page
- **Accordion sections** — Returns, Delivery, Sizing, Payments, General
- **Search** — Filter FAQs by keyword (optional)

---

## Implementation Notes
- **No template copying** — Each page built from scratch respecting the design system
- **All copy is original** — Use real content from extracted data (products.json, site_pages.json)
- **Images from manifest** — Use local/extracted images mapped via image_manifest.csv
- **Shopify Liquid** — All templates use liquid syntax, not HTML
- **Modularity** — Reusable sections for flexibility in Shopify theme customizer
- **Performance first** — Every decision prioritizes Core Web Vitals
- **Mobile is primary** — Design mobile-first, enhance for desktop
