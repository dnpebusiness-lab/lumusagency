# Skill: Technical SEO

## What This Skill Does
Loads advanced technical SEO knowledge into the SEO Agent. Ensures all technical foundations are correct for indexing, crawling, and Core Web Vitals.

## When to Use
Activate for Phase 8 (SEO Setup) on all projects. Combine with `local-seo-skill.md` for local businesses.

## Agent That Uses It
SEO Agent (Phase 8) + Performance Agent (Phase 10)

---

## SKILL INSTRUCTIONS

### TECHNICAL SEO FOUNDATION CHECKLIST

#### Crawlability & Indexing

- [ ] robots.txt exists at `/robots.txt` and is correctly configured
  - Allow all legitimate crawlers
  - Block admin/backend paths if applicable
  - Reference sitemap URL
  ```
  User-agent: *
  Allow: /
  Disallow: /admin/
  Sitemap: https://[domain.com]/sitemap.xml
  ```

- [ ] XML sitemap exists at `/sitemap.xml`
  - Includes all indexable pages
  - Excludes thank-you pages, admin pages, noindex pages
  - Uses absolute URLs
  - `<lastmod>` dates accurate
  - Submitted to Google Search Console

- [ ] No valuable pages accidentally set to noindex
- [ ] No valuable pages blocked in robots.txt
- [ ] Pagination handled correctly (if applicable)
- [ ] Google Search Console set up and site verified
- [ ] Search Console has no manual actions or security issues

---

#### URL Structure

- [ ] URLs are lowercase
- [ ] URLs use hyphens (not underscores or spaces)
- [ ] URLs are descriptive and readable: `/about-us` not `/page?id=2`
- [ ] Canonical URLs set on all pages
- [ ] Canonical URLs use the preferred domain (www or non-www, https)
- [ ] 301 redirects in place for any changed URLs
- [ ] No redirect chains (A → B → C — should be A → C direct)

---

#### On-Page Technical

- [ ] One H1 per page only
- [ ] H1 → H2 → H3 hierarchy is logical (no skipping levels)
- [ ] All images have alt text (descriptive, keyword-aware, not empty or "image1")
- [ ] Image file names are descriptive: `restaurant-interior-cork.jpg` not `IMG_4872.jpg`
- [ ] All images are WebP format
- [ ] Lazy loading on all images except above-fold
- [ ] Internal links use descriptive anchor text (not "click here")
- [ ] External links to low-quality sites use `rel="nofollow"`

---

#### Metadata

- [ ] Every page has a unique `<title>` tag (55–60 characters)
- [ ] Every page has a unique `<meta name="description">` (150–155 characters)
- [ ] Title tag format: `[Primary Keyword] | [Business Name]` for inner pages, `[Business Name] | [Primary Keyword]` for homepage
- [ ] OG tags set: `og:title`, `og:description`, `og:image`, `og:url`
- [ ] `og:image` is 1200x630px minimum, the right image for sharing
- [ ] Twitter card tags set
- [ ] `lang` attribute set on `<html>` tag (e.g., `<html lang="en">`)

---

#### Structured Data / Schema

- [ ] LocalBusiness schema (or specific type) implemented on homepage
- [ ] BreadcrumbList schema on all inner pages
- [ ] WebSite schema with sitelinks searchbox on homepage (optional but good)
- [ ] FAQPage schema if FAQ section exists
- [ ] Review/AggregateRating schema if genuine reviews are shown
- [ ] All schema validates at `https://validator.schema.org/`
- [ ] No schema errors or warnings in Google's Rich Results Test

---

#### HTTPS & Security

- [ ] Site runs on HTTPS
- [ ] HTTP redirects to HTTPS (301)
- [ ] SSL certificate valid and not expiring soon
- [ ] No mixed content warnings (HTTP resources on HTTPS page)
- [ ] Security headers set (at hosting level): X-Frame-Options, Content-Security-Policy, X-Content-Type-Options

---

#### Mobile

- [ ] Viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1">`
- [ ] No clickable elements too close together (mobile tap targets ≥ 44px)
- [ ] No horizontal scrolling on mobile
- [ ] Google Mobile-Friendly Test passes

---

#### Core Web Vitals (Technical)

**LCP (Largest Contentful Paint) — target < 2.5s:**
- Hero image is the LCP element on most pages — optimise it specifically
- Use `fetchpriority="high"` on hero image
- Use `loading="eager"` on hero image
- Preload hero image: `<link rel="preload" as="image" href="hero.webp">`
- Avoid hero images > 200KB

**CLS (Cumulative Layout Shift) — target < 0.1:**
- Every image must have explicit `width` and `height` attributes
- Font display: `font-display: swap` to prevent invisible text
- No content injected above existing content (ads, cookie banners)
- Reserve space for late-loading elements

**INP (Interaction to Next Paint) — target < 200ms:**
- Minimise main thread blocking JavaScript
- Defer non-critical JavaScript
- Use passive event listeners for scroll/touch
- Break up long JavaScript tasks
