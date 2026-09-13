# Little Bo Peep — Catalogue Audit

Measured against the full export of the live store (691 products, 1,730 images,
26 collections). Every figure below comes from the data, not from an estimate.

This matters because the brief asks for filtering by size, age, brand, gender,
category, colour and price, and for a Girls / Boys / Baby navigation. **Most of
that data does not currently exist in the store.** No amount of front-end work
creates it. This page states exactly what is missing and what it costs to fix.

---

## 1. What is strong

| Finding | Figure |
|---|---|
| Products with at least one photograph | 683 of 691 (98.8%) |
| In stock | 603 |
| Designer labels identifiable | 17 |
| Price range | €5 – €490, median €65 |
| Products in the exclusive smock collection | 22 |
| Location photography (multi-image lifestyle shoots) | 292 products carry 2+ images |

The Spanish label photography is the single best asset the business owns.
Sonata, Naxos, Rahigo and Abuela Tata are shot on location in Spain — warm
daylight, garden and street settings, real children. That is editorial-grade
imagery most Irish boutiques do not have, and the design leans on it heavily.

---

## 2. What blocks the brief

### 2.1 Brand is not a field — it is buried in the product title

Every one of the 691 products has `vendor = "LittleBoPeep"`. The real labels
(Miranda, Sonata, Naxos, Monnalisa, Rahigo, Daga, Adee, Gant, Abuela Tata,
Deolinda, Lapin House, Ela Confection, Ceaser Blanco, Giorgio Bambini, Anafie,
Mitch & Son, Levi's, Balloon Chic, Ricittos, Babyfer, Little A) appear only
inside titles and collection names.

- Brand detectable from text: **348 products (51%)**
- Brand not detectable at all: **343 products (49%)**

**Consequence:** a "Shop by Designer" filter cannot be built from current data,
and half the catalogue would be missing from it.

**Fix:** set `vendor` per product. One-off job, mostly bulk-editable by
collection since the collections are already brand-named.

### 2.2 No product type, effectively no tags

`product_type` is empty on all 691 products. The only tag in use anywhere is
`Preorder` (58 products).

**Consequence:** no category filter, no "Dresses / Sets / Knitwear / Coats"
navigation, no automated collections.

**Fix:** assign `product_type` on import. This is the highest-value single
change in this document.

### 2.3 Gender is unknown for most of the catalogue

Derived from title and collection text:

| | Products | Share |
|---|---|---|
| Not determinable | 426 | 61% |
| Girl | 119 | 17% |
| Boy | 110 | 15% |
| Baby | 34 | 5% |
| Both | 2 | — |

**Consequence:** the Girls / Boys / Baby top-level navigation in the brief
cannot be delivered honestly today. Six out of ten products would be absent
from whichever section a shopper picked — which is worse than not offering the
navigation at all.

**Design response:** the homepage leads with **Designers, Smocks, Christening
and Shop by Age** instead. Those map to data that genuinely exists, and they
happen to match how this boutique actually sells. Girls / Boys / Baby can be
added the moment the products are tagged, without redesign.

### 2.4 Size values are inconsistent

The same age is expressed three different ways across the catalogue:

```
3months · 6months · 9months · 12months · 18months · 24months · 36months
2years · 3years · 4years … 12years
1-2years · 2-3years · 3-4years · 4-5years · 5-6years · 6-7years · 7-8years …
```

Option names are also inconsistent: `Size` (594), `Title` (80), `Color` (10),
`Shoe size` (9), and `Size ` **with a trailing space** (7).

**Consequence:** a size filter built directly on these values would show
`3years`, `3-4years` and `36months` as three unrelated options.

**Design response:** the build normalises everything to months and buckets it
into four bands. Counts of products available in each band:

| Band | Products |
|---|---|
| Newborn – 2 years | 400 |
| 2 – 5 years | 530 |
| 5 – 8 years | 435 |
| 8 years + | 329 |

This is implemented in `preview/build.py` (`months_of`, `AGE_BANDS`) and
carries over to the theme. It works today, but normalising at source is still
worth doing.

### 2.5 Product titles lead with supplier reference codes

Real examples from the live store:

```
122-23 boys beige
252E2430& 252E3337 Cream Laplin house top & gold skirt
7647,7554 Royal blue Naxos 3 piece suit
158VB Girls Miranda dress & knickers
```

**Consequence:** unreadable in search results, in Google, in the bag, on the
order confirmation, and in any ad. It reads as a wholesaler's spreadsheet, not
a premium boutique.

**Design response:** the build strips the leading reference and sentence-cases
the remainder for display, keeping the original code to show as a reference on
the product page. `7647,7554 Royal blue Naxos 3 piece suit` renders as
**Royal Blue Naxos 3 Piece Suit**.

This is presentation only. Correcting the titles at source is strongly
recommended — it affects SEO, which the front end cannot fix.

### 2.6 Smaller data issues

| Issue | Detail | Action |
|---|---|---|
| Single-image products | 399 of 691 (58%) have exactly one photograph | Card hover-crossfade is built as progressive enhancement, never assumed |
| No image at all | 8 products | Excluded from the preview; needs photography or delisting |
| Duplicate collection | "Got" appears twice | Merge |
| Spelling | `deilvery` appears in live product titles | Corrected on display, should be fixed at source |
| Out of stock | 81 products still listed | Decide: hide, or show with "notify me" |
| Instagram screenshot used as product photo | e.g. `baby-blue-girls-sa` | Replace |
| Shop-floor phone snaps with price tags visible | several baby items | Replace — they sit beside location-shot Spanish imagery and the gap is obvious |

---

## 3. Recommended sequence

1. **Set `product_type` and `vendor` on all 691 products.** Unlocks brand
   navigation, category navigation and automated collections. Largest single
   return of anything in this list.
2. **Normalise size option values and option names.** Enables a real size filter.
3. **Rewrite product titles**, moving supplier codes to the SKU field.
4. **Tag gender** where it applies.
5. **Reshoot or remove** the shop-floor snaps and the Instagram screenshot.
6. **Merge the duplicate collection**, decide the out-of-stock policy.

Steps 1, 2 and 4 are bulk operations via CSV export/import or the Shopify
Admin API — they are a data task, not a design task, and can run in parallel
with the build.

---

## 4. What the design does in the meantime

Nothing on the homepage is invented. Where data is missing, the element is
omitted rather than filled with a placeholder:

- Navigation leads with Designers, Smocks, Christening, Shop by Age — all
  backed by real data.
- Brand shown on a product card falls back to "Little Bo Peep" when no label
  can be identified, which is accurate rather than blank.
- No review section, no star ratings, no customer testimonials — the export
  contains none, and inventing them was explicitly out of bounds.
- No "trusted by" counts, no awards, no fabricated statistics.
- Trust copy uses only stated policy: 14-day returns, worldwide shipping,
  payment plans, and the Spiddal location. All of it is on the current site.
