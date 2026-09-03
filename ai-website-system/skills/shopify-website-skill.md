# Skill: Shopify Website

## What This Skill Does
Loads Shopify-specific knowledge for building e-commerce websites for small brands, product businesses, and retail shops. Covers Shopify setup, theme development, conversion optimisation, and technical SEO for Shopify.

## When to Use
Activate when the client needs an online shop. Replace the default Astro/Tailwind tech stack with Shopify.

## Agent That Uses It
Frontend Dev Agent (Phase 7) + SEO Agent (Phase 8) + CRO Agent (Phase 9)

---

## SKILL INSTRUCTIONS

### SHOPIFY FUNDAMENTALS

#### When to Use Shopify
- Client is selling physical products online
- Client needs inventory management
- Client needs payment processing
- Client may want to expand to multiple sales channels (POS, social)
- Client is comfortable paying monthly fees for the platform

#### When NOT to Use Shopify
- Client only needs a brochure/service website
- Client is selling services, not products
- Client needs highly custom functionality that Shopify can't support

---

### SHOPIFY SETUP CHECKLIST

**Initial setup:**
- [ ] Store currency set correctly (EUR / GBP)
- [ ] Tax settings configured for market (Ireland: 23% VAT standard, 13.5% reduced, 0% zero)
- [ ] Payment providers set up (Shopify Payments + PayPal minimum)
- [ ] Shipping zones and rates configured
- [ ] Notification emails customised (branded, not default Shopify template)
- [ ] Legal pages: Privacy Policy, Terms of Service, Refund Policy (auto-generated + reviewed)
- [ ] Custom domain connected

**Theme development:**
- Use Shopify CLI for local development
- Use Dawn theme as base (or Debut for simpler stores) and customise heavily
- Implement custom CSS to match Visual Direction document exactly
- Never release an obviously unmodified Shopify theme

---

### SHOPIFY CRO ESSENTIALS

Key conversion points in Shopify stores:

**Product page:**
- Product title: specific and SEO-friendly
- Product description: benefits first, specs second
- Imagery: multiple angles, lifestyle shots, scale reference
- Price: clear, with VAT included stated
- CTA: "Add to Cart" must be above the fold
- Social proof: reviews visible below CTA
- Urgency (if genuine): "Only 3 left in stock"
- Variant selection: clean, clear, not confusing
- Cross-sells: "Customers also bought" implemented

**Cart:**
- Clear cart summary
- Free shipping threshold message (if applicable)
- Trust badges at checkout
- Easy to continue shopping or proceed to checkout

**Checkout:**
- Shopify's native checkout (don't customise this unless on Shopify Plus)
- Logo and brand colours in checkout
- Guest checkout enabled (never force account creation)

---

### SHOPIFY SEO SPECIFICS

Shopify SEO gotchas to fix:

- **Duplicate content:** Shopify creates `/collections/[handle]/products/[handle]` AND `/products/[handle]` — canonical tags must point to `/products/[handle]`
- **Pagination:** `/collections/[handle]?page=2` must be handled with rel="next/prev" or noindex
- **Sitemap:** Shopify generates this automatically at `/sitemap.xml` — verify it includes all products and pages
- **Image alt text:** Set on every product image (Shopify doesn't do this automatically)
- **Product schema:** Shopify themes usually include this, but verify it includes `offers`, `aggregateRating` if reviews enabled

---

### SHOPIFY APPS (RECOMMENDED)

Keep apps minimal. Every app adds load time.

| Need | Recommended App |
|------|----------------|
| Reviews | Judge.me (free, fast, SEO-friendly) |
| Email marketing | Klaviyo or Shopify Email |
| SEO | Shopify's built-in SEO is sufficient for most |
| Analytics | Google Analytics 4 via Shopify integration |
| Abandoned cart | Shopify built-in |
| Subscriptions | Recharge (if needed) |
| Returns | Loop Returns (if needed) |

**Avoid:** Any app that hasn't been updated in 6+ months, any app with poor reviews, any app that adds heavy scripts to every page.
