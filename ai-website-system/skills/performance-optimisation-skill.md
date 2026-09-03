# Skill: Performance Optimisation

## What This Skill Does
Loads advanced performance optimisation knowledge into the Performance Agent. Ensures all websites achieve excellent Core Web Vitals and fast load times.

## When to Use
Activate for Phase 10 (Performance) on every project.

## Agent That Uses It
Performance Agent (Phase 10) + Frontend Dev Agent (Phase 7, for implementation awareness)

---

## SKILL INSTRUCTIONS

### PERFORMANCE OPTIMISATION PLAYBOOK

#### Priority Order

Always fix in this order (highest impact first):
1. Images (usually responsible for 50–80% of page weight)
2. Render-blocking resources (CSS + JS in the head)
3. Font loading
4. Third-party scripts
5. Server response time
6. Everything else

---

### IMAGE OPTIMISATION (MOST IMPORTANT)

**Format:**
- Convert all images to WebP (or AVIF for even better compression)
- Use Astro's `<Image />` component (handles this automatically)
- Fallback to JPEG for browsers without WebP support (use `<picture>` element)

**Sizing:**
- Never serve a 2400px wide image for a 400px wide card
- Implement `srcset` for responsive images:
  ```html
  <img
    src="/images/hero.webp"
    srcset="/images/hero-400.webp 400w, /images/hero-800.webp 800w, /images/hero-1200.webp 1200w"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1200px"
    alt="Description"
    width="1200"
    height="675"
  />
  ```

**Loading:**
- Hero image: `loading="eager" fetchpriority="high"`
- All other images: `loading="lazy"`
- All images must have explicit `width` and `height` to prevent CLS

**File size targets:**
- Hero image: < 200KB
- Card images: < 80KB
- Thumbnail images: < 30KB
- Use Squoosh.app or Sharp for batch optimisation

---

### FONT LOADING OPTIMISATION

**Google Fonts (most common):**
```html
<!-- Preconnect to Google Fonts servers -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<!-- Load only the weights you actually use -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
```

**Self-hosted fonts (better performance, more reliable):**
```css
@font-face {
  font-family: 'Your Font';
  src: url('/fonts/yourfont-regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap; /* Prevents invisible text during load */
}
```

**Rules:**
- Never load more font weights than you use
- Always use `font-display: swap`
- Preload critical fonts:
  ```html
  <link rel="preload" href="/fonts/yourfont-700.woff2" as="font" type="font/woff2" crossorigin>
  ```

---

### JAVASCRIPT OPTIMISATION

**Load order:**
```html
<!-- Critical scripts (if any): at end of body -->
<script src="/js/critical.js" defer></script>

<!-- Third-party scripts: always defer or async -->
<script src="https://www.googletagmanager.com/gtm.js" async></script>
```

**Rules:**
- No `<script>` in `<head>` without `defer` or `async`
- Analytics scripts: use `async`
- Everything else: use `defer`
- Check for unused JavaScript: Chrome DevTools Coverage tab
- Target total JavaScript bundle: < 150KB parsed

**For Astro sites:**
- Astro ships zero JavaScript by default — leverage this
- Only add JavaScript where interaction is required
- Use `client:load`, `client:idle`, or `client:visible` directives appropriately

---

### CSS OPTIMISATION

**For Tailwind CSS:**
- Ensure PurgeCSS/content config is correct so unused classes are removed
- Check production bundle size — should be < 20KB for most sites
- No unused CSS files loaded

**Critical CSS:**
- For above-fold content, consider inlining critical CSS
- Astro handles this well with its bundling

---

### THIRD-PARTY SCRIPTS

Every third-party script is a performance risk. Audit all third-party scripts:

| Script | Load method | When to load |
|--------|-------------|-------------|
| Google Analytics (GA4) | `async` | Immediately (but use gtag.js not GTM for smaller sites) |
| Google Maps embed | `lazy` iframe | Only when visible (use Intersection Observer) |
| Social sharing buttons | On demand | Only on pages that need them |
| Chat widgets | `defer` + lazy | After page load complete |
| Cookie consent | `sync` | Must load early |

**Optimised Google Maps embed:**
Instead of the full Maps embed (which loads heavy JS), use a static image preview with link:
```html
<a href="https://maps.google.com/?q=[address]" target="_blank" rel="noopener">
  <img src="/images/map-preview.jpg" alt="Map showing [Business Name] location" loading="lazy">
</a>
```
This loads instantly and only opens Google Maps when clicked.

---

### CACHING & DELIVERY

**Netlify (default host):**
- CDN is active automatically (global edge network)
- Set cache headers in `netlify.toml`:
```toml
[[headers]]
  for = "/fonts/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/images/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

**Compression:**
- Netlify enables Brotli and gzip compression automatically
- Verify by checking response headers: `Content-Encoding: br` or `Content-Encoding: gzip`

---

### PERFORMANCE TESTING TOOLS

| Tool | What it measures | URL |
|------|-----------------|-----|
| PageSpeed Insights | Core Web Vitals + performance score | pagespeed.web.dev |
| GTmetrix | Detailed waterfall + recommendations | gtmetrix.com |
| WebPageTest | Multi-location, multi-device testing | webpagetest.org |
| Chrome DevTools | Real-time profiling, Coverage tab | Built into Chrome |
| Squoosh | Image optimisation | squoosh.app |

**Test from the correct location:**
For Irish/UK clients, test from London or Dublin servers, not US servers (which show artificially worse results).
