# FIXES NOTES — 1997 Stays Standalone

## 1. Cloudbeds Booking

**What changed:**
The old `<script src=".../widget/load/[ID]/vert?newWindow=0">` approach rendered a Cloudbeds button that navigated the user away from the website (to a separate Cloudbeds page in the same tab). This is a Cloudbeds limitation — the widget script does not support true inline/embedded booking.

**New approach:**
- The widget script has been replaced with a "Check Availability →" button.
- Clicking any booking trigger (nav Book button, sticky button, CTA, room "Book this room" links, section button) opens a full-screen modal overlay.
- The modal lazy-loads an `<iframe>` pointing to the Cloudbeds reservation page:
  - Galway: `https://hotels.cloudbeds.com/en/reservation/Sa32sZ`
  - Westport: `https://mochabeansgroup.cloudbeds.com/en/reservas/1jTOWB?referral_id=197466&association_direct=1&currency=eur`
- The modal can be closed with the ✕ button, clicking the overlay, or pressing Escape.

**Iframe embedding status:**
Cloudbeds reservation pages generally allow iframe embedding. If Cloudbeds ever adds `X-Frame-Options: DENY` or `Content-Security-Policy: frame-ancestors 'none'` headers, the iframe will appear blank. In that case, replace the iframe with a styled redirect to the same Cloudbeds URL. The "Book Direct" fallback link below the section button handles this gracefully.

**Remaining requirement from client:**
No additional Cloudbeds credentials needed — widget IDs (Sa32sZ / 1jTOWB) are already embedded.

---

## 2. Image Paths Fixed

### galway.html
| Before | After | Status |
|--------|-------|--------|
| `images/galway-hero.png` | `images/DSCF1908-Migliorato-NR.jpg` | Fixed — corridor/clock shot (NR = Newcastle Road) |
| `images/galway-poster-room.png` | unchanged | Working — file exists |
| `images/galway-queen-room.png` | unchanged | Working — file exists |
| `images/galway-triple-room.png` | unchanged | Working — file exists |
| `images/galway-single-room.png` | unchanged | Working — file exists |
| `images/stays_cafe_1779895551793.png` | unchanged | Working — file exists |

### westport.html
All 6 images were pointing to missing files. Fixed:

| Before | After |
|--------|-------|
| `images/westport-hero.jpg` | `images/DSCF1847.jpg` |
| `images/westport-room-double.jpg` | `images/DSCF1873.jpg` |
| `images/westport-room-twin.jpg` | `images/DSCF1867.jpg` |
| `images/westport-room-family.jpg` | `images/DSCF1853.jpg` |
| `images/westport-room-single.jpg` | `images/DSCF1887.jpg` |
| `images/westport-cafe.jpg` | `images/stays_cafe_1779895551793.png` (shared café image) |

### index.html
| Before | After |
|--------|-------|
| `images/galway-hero.png` | `images/DSCF1908-Migliorato-NR.jpg` |
| `images/westport-hero.jpg` | `images/DSCF1873.jpg` |

---

## 3. Animations Added

### index.html
- **Entry animation**: Left panel enters with perspective translateX + rotateY from the left; right panel mirrors from the right. Duration 1.1s, cubic-bezier easing.
- **Cursor-following 3D tilt** (desktop only): Panels tilt on mouse move using `perspective(1400px) rotateX/Y`. Background image moves in counter-direction for parallax depth. Disabled on touch devices and when `prefers-reduced-motion` is set.

### galway.html + westport.html
- **Hero parallax**: `.hero-bg` translates on scroll at 0.22× speed (combined with existing Ken Burns scale). Disabled on reduced-motion.
- **Room card 3D tilt** (desktop only): Hovering a room card or featured room applies `perspective(900px) rotateX/Y` tilt with shadow lift. Returns to flat on mouse-leave.
- **Room image scale on hover**: All room images (featured, card, single-row) scale to 1.04–1.06 with brightness increase on parent hover, using `cubic-bezier(0.25,0.46,0.45,0.94)` easing.
- **Enhanced `.fade-up` reveals** (galway only): Scroll-triggered reveal now includes `rotateX(5deg)` for a subtle 3D fold-in effect as elements enter the viewport.

### Technical notes
- All animations use `transform` and `opacity` only — no layout-triggering properties.
- `will-change: transform` set only on animated elements.
- `prefers-reduced-motion: reduce` disables parallax and tilt JS. Fade-up elements marked visible immediately.
- Mobile: JS tilt runs only on `(hover: hover)` devices. CSS animations remain but are gentler.

---

## Remaining limitations

1. **Cloudbeds iframe**: If Cloudbeds blocks iframe embedding, the modal will appear blank. The "Book Direct" link below each booking section always works as fallback.
2. **Westport room naming**: Room names/prices marked TODO in HTML — confirm actual room types from Cloudbeds dashboard and update copy.
3. **Westport café image**: Currently reusing the Galway Mocha Beans café photo. Replace with `images/westport-cafe.jpg` once a Westport-specific photo is available.
