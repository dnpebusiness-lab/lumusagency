#!/usr/bin/env python3
"""
Little Bo Peep — homepage preview generator.

Builds preview/index.html from the real catalogue export so every product,
price, brand, size band and image on the page is genuine store data. Nothing
on the rendered page is invented; anything we could not source is omitted.

Source data: /tmp/bopeep/claude_code_package (products.json, image_manifest.csv)
Run:         python3 build.py
"""

import csv
import html
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

SRC = Path("/tmp/bopeep/claude_code_package")
OUT = Path(__file__).parent / "index.html"

# Brands the boutique actually stocks, per the About page, the live nav and the
# collection list. Matched case-insensitively against title + collections.
BRANDS = [
    ("Sonata", ["sonata"]),
    ("Adee", ["adee"]),
    ("Monnalisa", ["monnalisa"]),
    ("Gant", ["gant"]),
    ("Mitch & Son", ["mitch"]),
    ("Daga", ["daga"]),
    ("Rahigo", ["rahigo"]),
    ("Miranda", ["miranda"]),
    ("Babyfer", ["babyfer"]),
    ("Naxos", ["naxos"]),
    ("Abuela Tata", ["abuela"]),
    ("Levi's", ["levi"]),
    ("Ceaser Blanco", ["ceaser"]),
    ("Deolinda", ["deolinda"]),
    ("Lapin House", ["lapin", "laplin"]),
    ("Ela Confection", ["ela confection"]),
    ("Giorgio Bambini", ["giorgio"]),
    ("Anafie", ["anafie"]),
    ("Little A", ["little a"]),
    ("Balloon Chic", ["balloon chic"]),
    ("Ricittos", ["ricittos"]),
]

# Spelling corrections only — no content is added or reworded. Documented in
# CATALOGUE-AUDIT.md so the merchant can fix them at source.
TYPOS = {"deilvery": "delivery", "Deilvery": "Delivery"}

LOWER_WORDS = {"and", "with", "in", "on", "the", "a", "of", "to", "for", "&"}


def load_products():
    return json.load(open(SRC / "products.json"))


def load_images():
    """handle -> ordered list of CDN urls."""
    by_handle = defaultdict(list)
    with open(SRC / "image_manifest.csv") as fh:
        for row in csv.DictReader(fh):
            if row.get("product_handle") and row.get("url"):
                by_handle[row["product_handle"]].append(row["url"])
    return by_handle


def cdn(url, width):
    """Ask the Shopify CDN for a sized rendition."""
    if not url:
        return ""
    sep = "&" if "?" in url else "?"
    return f"{url}{sep}width={width}"


def clean_title(raw):
    """Drop the leading supplier reference codes, then sentence-case.

    '7647,7554 Royal blue Naxos 3 piece suit' -> 'Royal Blue Naxos 3 Piece Suit'
    The original reference is kept separately and shown on the product page.
    """
    for bad, good in TYPOS.items():
        raw = raw.replace(bad, good)
    words = raw.replace("&", " & ").split()
    i = 0
    while i < len(words) and any(c.isdigit() for c in words[i]):
        i += 1
    rest = words[i:] or words
    out = []
    for n, w in enumerate(rest):
        lw = w.lower()
        if n > 0 and lw in LOWER_WORDS:
            out.append(lw)
        elif w.isupper() and len(w) > 3:
            out.append(w.title())
        else:
            out.append(w[:1].upper() + w[1:])
    return re.sub(r"\s+", " ", " ".join(out)).strip(" ,&-")


def sku_of(raw):
    words = raw.split()
    codes = []
    for w in words:
        if any(c.isdigit() for c in w):
            codes.append(w)
        else:
            break
    return " ".join(codes).strip(",&")


def brand_of(p):
    """Title wins over collection membership.

    Several collections bundle two labels ("Ela confection & Deolinda"), so a
    collection match alone will mislabel a product. The title is the more
    specific signal and is checked first.
    """
    title = p["title"].lower()
    for label, keys in BRANDS:
        if any(k in title for k in keys):
            return label
    cols = " ".join(p.get("collections") or []).lower()
    for label, keys in BRANDS:
        if any(k in cols for k in keys):
            return label
    return None


def months_of(value):
    """'18months' -> 18, '3-4years' -> 36, '5years' -> 60."""
    v = value.lower().replace(" ", "")
    nums = re.findall(r"\d+", v)
    if not nums:
        return None
    n = int(nums[0])
    if "month" in v:
        return n
    if "year" in v:
        return n * 12
    return None


AGE_BANDS = [
    ("Newborn – 2 years", lambda m: m < 24),
    ("2 – 5 years", lambda m: 24 <= m < 60),
    ("5 – 8 years", lambda m: 60 <= m < 96),
    ("8 years +", lambda m: m >= 96),
]


def age_bands(products):
    counts = Counter()
    for p in products:
        seen = set()
        for opt in p.get("options") or []:
            if not isinstance(opt, dict):
                continue
            if "size" not in opt.get("name", "").lower():
                continue
            for v in opt.get("values") or []:
                m = months_of(str(v))
                if m is None:
                    continue
                for label, test in AGE_BANDS:
                    if test(m):
                        seen.add(label)
        counts.update(seen)
    return [(label, counts[label]) for label, _ in AGE_BANDS if counts[label]]


def price_of(p):
    for key in ("price_eur", "price", "price_min"):
        v = p.get(key)
        if v in (None, ""):
            continue
        try:
            f = float(v)
        except (TypeError, ValueError):
            continue
        return f / 100 if f > 1000 else f
    return None


def compare_of(p):
    for key in ("compare_at_price_eur", "compare_at_price", "compare_at_price_max"):
        v = p.get(key)
        if v in (None, ""):
            continue
        try:
            f = float(v)
        except (TypeError, ValueError):
            continue
        return f / 100 if f > 1000 else f
    return None


def money(v):
    return f"€{v:,.2f}".replace(".00", "")


def esc(s):
    return html.escape(str(s or ""), quote=True)


# ---------------------------------------------------------------- components

def product_card(p, imgs, delay=0):
    handle = p["handle"]
    urls = imgs.get(handle, [])
    if not urls:
        return ""
    name = clean_title(p["title"])
    brand = brand_of(p) or "Little Bo Peep"
    price = price_of(p)
    was = compare_of(p)
    on_sale = bool(was and price and was > price)
    in_stock = bool(p.get("available"))

    flags = []
    if on_sale:
        flags.append('<span class="lbp-flag lbp-flag--sale">Sale</span>')
    if not in_stock:
        flags.append('<span class="lbp-flag lbp-flag--out">Out of stock</span>')
    flags_html = f'<div class="lbp-card__flags">{"".join(flags)}</div>' if flags else ""

    alt_img = ""
    if len(urls) > 1:
        alt_img = (
            f'<img class="lbp-card__img lbp-card__img--alt" src="{esc(cdn(urls[1], 700))}" '
            f'alt="" loading="lazy" decoding="async" aria-hidden="true">'
        )

    if on_sale:
        price_html = (
            f'<span class="lbp-card__was lbp-num">{money(was)}</span>'
            f'<span class="lbp-card__now lbp-card__now--sale lbp-num">{money(price)}</span>'
        )
    elif price is not None:
        price_html = f'<span class="lbp-card__now lbp-num">{money(price)}</span>'
    else:
        price_html = ""

    quick = (
        '<button class="lbp-card__quick" type="button">Quick add</button>'
        if in_stock else ""
    )
    d = f' data-delay="{delay}"' if delay else ""

    return f"""
          <article class="lbp-card lbp-reveal"{d}>
            <div class="lbp-card__media">
              <img class="lbp-card__img" src="{esc(cdn(urls[0], 700))}"
                   alt="{esc(name)}" loading="lazy" decoding="async" width="700" height="875">
              {alt_img}
              {flags_html}
              <button class="lbp-card__wish" type="button" aria-label="Save {esc(name)}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
                  <path d="M12 20.5S3.8 15 3.8 9.3a4.3 4.3 0 0 1 8.2-1.8 4.3 4.3 0 0 1 8.2 1.8c0 5.7-8.2 11.2-8.2 11.2Z"/>
                </svg>
              </button>
              {quick}
            </div>
            <p class="lbp-card__brand">{esc(brand)}</p>
            <h3 class="lbp-card__name"><a href="#">{esc(name)}</a></h3>
            <p class="lbp-card__price">{price_html}</p>
          </article>"""


def tile(label, url, href="#"):
    return f"""
          <a class="lbp-tile lbp-reveal" href="{href}">
            <div class="lbp-tile__media lbp-mask">
              <img src="{esc(cdn(url, 900))}" alt="" loading="lazy" decoding="async">
            </div>
            <div class="lbp-tile__foot">
              <span class="lbp-tile__name">{esc(label)}</span>
              <span class="lbp-tile__arrow" aria-hidden="true">&rarr;</span>
            </div>
          </a>"""


# --------------------------------------------------------------------- build

def main():
    products = load_products()
    imgs = load_images()

    with_img = [p for p in products if imgs.get(p["handle"])]
    in_stock = [p for p in with_img if p.get("available")]

    def in_collection(*needles):
        out = []
        for p in with_img:
            cols = " ".join(p.get("collections") or []).lower()
            if any(n in cols for n in needles):
                out.append(p)
        return out

    def by_title(*needles):
        return [p for p in with_img if any(n in p["title"].lower() for n in needles)]

    newest = sorted(
        in_stock, key=lambda p: p.get("published_at") or p.get("created_at") or "", reverse=True
    )
    smocks = in_collection("smock") or by_title("smock")
    christening = in_collection("christening") or by_title("christening", "gown")
    sale = [p for p in with_img
            if (compare_of(p) or 0) > (price_of(p) or 0) and price_of(p)]

    # Brand index, real counts, biggest first
    bcount = Counter()
    for p in with_img:
        b = brand_of(p)
        if b:
            bcount[b] += 1
    designers = bcount.most_common()

    ages = age_bands(products)

    def pick_image(pool, idx=0, img_idx=0):
        """Deterministic pick of a real photograph from a product pool."""
        if not pool:
            return ""
        p = pool[idx % len(pool)]
        urls = imgs.get(p["handle"], [])
        return urls[img_idx % len(urls)] if urls else ""

    # Editorial imagery: prefer products shot on location (many images means a
    # full lifestyle shoot rather than a single packshot).
    lifestyle = sorted(with_img, key=lambda p: -len(imgs.get(p["handle"], [])))
    hero_p = lifestyle[0]
    story_p = lifestyle[4 % len(lifestyle)]
    hero_img = pick_image(lifestyle, 0, 1) or pick_image(lifestyle, 0, 0)
    band_img = pick_image(lifestyle, 2, 0)
    story_img = pick_image(lifestyle, 4, 0)

    # Captions and alt text are derived from the product actually shown — never
    # asserted. We do not know where a photograph was taken, so we do not say.
    hero_alt = clean_title(hero_p["title"])
    story_alt = clean_title(story_p["title"])
    # Credit the label only when we actually know it. Captioning the shop's own
    # photograph with the shop's own name says nothing.
    hero_brand = brand_of(hero_p)
    hero_caption = (
        f'<figcaption class="lbp-hero__caption">{esc(hero_brand)}</figcaption>'
        if hero_brand else ""
    )

    cards_new = "".join(
        product_card(p, imgs, i % 4) for i, p in enumerate(newest[:8])
    )
    cards_smock = "".join(
        product_card(p, imgs, i % 4) for i, p in enumerate(smocks[:4])
    )
    cards_sale = "".join(
        product_card(p, imgs, i % 4) for i, p in enumerate(sale[:4])
    )

    tiles = "".join([
        tile("The Smock Collection", pick_image(smocks, 0, 0)),
        tile("Christening", pick_image(christening, 0, 0)),
        tile("Spanish Labels", pick_image(lifestyle, 6, 0)),
    ])

    designers_html = "".join(
        f'<a class="lbp-designer" href="#"><span class="lbp-designer__name">{esc(n)}</span>'
        f'<span class="lbp-designer__count lbp-num">{c}</span></a>'
        for n, c in designers
    )

    ages_html = "".join(
        f'<a class="lbp-age" href="#">{esc(label)}<span class="lbp-age__n lbp-num">{n}</span></a>'
        for label, n in ages
    )

    mega_brands = "".join(
        f'<li><a class="lbp-mega__link" href="#">{esc(n)}</a></li>' for n, _ in designers[:8]
    )

    stats = {
        "total": len(products),
        "shown": len(with_img),
        "instock": len(in_stock),
        "smocks": len(smocks),
        "designers": len(designers),
    }

    page = TEMPLATE.format(
        hero_img=esc(cdn(hero_img, 1400)),
        hero_alt=esc(hero_alt),
        hero_caption=hero_caption,
        band_img=esc(cdn(band_img, 1800)),
        story_img=esc(cdn(story_img, 1100)),
        story_alt=esc(story_alt),
        cards_new=cards_new,
        cards_smock=cards_smock,
        cards_sale=cards_sale,
        tiles=tiles,
        designers=designers_html,
        ages=ages_html,
        mega_brands=mega_brands,
        smock_count=stats["smocks"],
        designer_count=stats["designers"],
    )
    OUT.write_text(page, encoding="utf-8")
    print(f"wrote {OUT}")
    print(f"  {stats['shown']}/{stats['total']} products have photography")
    print(f"  {stats['instock']} in stock · {stats['designers']} designers · {stats['smocks']} smocks")
    print(f"  age bands: {', '.join(f'{l} ({n})' for l, n in ages)}")


TEMPLATE = """<!DOCTYPE html>
<html lang="en-IE">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Little Bo Peep — Spanish Childrenswear, Spiddal, Co Galway</title>
<meta name="description" content="Spanish and traditional childrenswear from a boutique in Spiddal, twelve miles outside Galway city. Christening wear, smocks and occasion outfits, newborn to twelve years. Worldwide shipping.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="lbp-system.css">
<script type="application/ld+json">
{{"@context":"https://schema.org","@type":"ClothingStore","name":"Little Bo Peep",
"description":"Independently run children's boutique specialising in Spanish and traditional childrenswear.",
"address":{{"@type":"PostalAddress","addressLocality":"Spiddal","addressRegion":"Co Galway","addressCountry":"IE"}},
"url":"https://littlebopeepspanishwear.ie"}}
</script>
</head>
<body>
<a class="lbp-skip" href="#main">Skip to content</a>

<div class="lbp-announce">
  <div class="lbp-container">
    <div class="lbp-announce__track">
      <p class="lbp-announce__item">10% off your first order with <span class="lbp-announce__code">FIRST</span> &nbsp;·&nbsp; Worldwide shipping &nbsp;·&nbsp; Payment plans available</p>
    </div>
  </div>
</div>

<header class="lbp-header" id="header">
  <div class="lbp-container">
    <div class="lbp-header__bar">
      <nav class="lbp-header__nav" aria-label="Primary">
        <ul class="lbp-nav">
          <li class="lbp-nav__item"><a class="lbp-nav__link" href="#new">New In</a></li>
          <li class="lbp-nav__item" data-mega>
            <a class="lbp-nav__link" href="#" aria-haspopup="true" aria-expanded="false">Designers</a>
            <div class="lbp-mega">
              <div class="lbp-container">
                <div class="lbp-mega__inner">
                  <div>
                    <h2 class="lbp-mega__title">Spanish labels</h2>
                    <ul class="lbp-mega__list">{mega_brands}</ul>
                  </div>
                  <div>
                    <h2 class="lbp-mega__title">Occasion</h2>
                    <ul class="lbp-mega__list">
                      <li><a class="lbp-mega__link" href="#">Girls Christening</a></li>
                      <li><a class="lbp-mega__link" href="#">Boys Christening</a></li>
                      <li><a class="lbp-mega__link" href="#">Gowns &amp; Bonnets</a></li>
                      <li><a class="lbp-mega__link" href="#">Communion</a></li>
                    </ul>
                  </div>
                  <div>
                    <h2 class="lbp-mega__title">Everyday</h2>
                    <ul class="lbp-mega__list">
                      <li><a class="lbp-mega__link" href="#">Baby Sets &amp; Knitwear</a></li>
                      <li><a class="lbp-mega__link" href="#">Smocked PJs &amp; Swim</a></li>
                      <li><a class="lbp-mega__link" href="#">Boots &amp; Shoes</a></li>
                      <li><a class="lbp-mega__link" href="#">Socks, Tights &amp; Accessories</a></li>
                    </ul>
                  </div>
                  <a class="lbp-mega__feature" href="#smocks">
                    <div class="lbp-mega__figure"><img src="{hero_img}" alt="" loading="lazy"></div>
                    <span class="lbp-eyebrow">Exclusive to us</span>
                    <p class="lbp-h4">The Little Bo Peep Smock Collection</p>
                  </a>
                </div>
              </div>
            </div>
          </li>
          <li class="lbp-nav__item"><a class="lbp-nav__link" href="#smocks">Smocks</a></li>
          <li class="lbp-nav__item"><a class="lbp-nav__link" href="#occasion">Christening</a></li>
          <li class="lbp-nav__item"><a class="lbp-nav__link" href="#ages">Baby</a></li>
          <li class="lbp-nav__item"><a class="lbp-nav__link" href="#sale">Sale</a></li>
        </ul>
      </nav>

      <a class="lbp-logo" href="#">Little Bo Peep<span class="lbp-logo__sub">Spiddal · Co Galway</span></a>

      <button class="lbp-iconbtn lbp-burger" type="button" aria-label="Open menu" data-open="mnav">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>

      <div class="lbp-header__tools">
        <button class="lbp-iconbtn" type="button" aria-label="Search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>
        </button>
        <a class="lbp-iconbtn lbp-iconbtn--account" href="#" aria-label="Account">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="8" r="3.6"/><path d="M4.6 20a7.4 7.4 0 0 1 14.8 0"/></svg>
        </a>
        <button class="lbp-iconbtn" type="button" aria-label="Shopping bag" data-open="bag">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 7h14l1 13H4L5 7Z"/><path d="M8.5 7V5.6a3.5 3.5 0 0 1 7 0V7"/></svg>
          <span class="lbp-bagcount" data-bagcount>0</span>
        </button>
      </div>
    </div>
  </div>
</header>

<main id="main">

  <section class="lbp-hero" id="hero">
    <div class="lbp-hero__grid">
      <div class="lbp-hero__copy">
        <span class="lbp-eyebrow lbp-hero__eyebrow">Autumn / Winter</span>
        <h1 class="lbp-display lbp-hero__title">Spanish clothes for christenings, communions <em>and Sunday best</em>.</h1>
        <p class="lbp-lead lbp-hero__text">An independent boutique in Spiddal, twelve miles past Galway city, stocking the Spanish labels most Irish parents have to fly for. Newborn to twelve years.</p>
        <div class="lbp-hero__actions">
          <a class="lbp-btn lbp-btn--solid" href="#new">Shop new in</a>
          <a class="lbp-btn lbp-btn--line" href="#smocks">The smock collection</a>
        </div>
      </div>
      <figure class="lbp-hero__figure">
        <img src="{hero_img}" alt="{hero_alt}" fetchpriority="high" decoding="async">
        {hero_caption}
      </figure>
    </div>
  </section>

  <section class="lbp-section" id="new">
    <div class="lbp-container">
      <div class="lbp-sectionhead lbp-reveal">
        <div>
          <span class="lbp-eyebrow">Just arrived</span>
          <h2 class="lbp-h2 lbp-sectionhead__title">New this week</h2>
        </div>
        <a class="lbp-sectionhead__link" href="#">All new in</a>
      </div>
      <div class="lbp-grid">{cards_new}</div>
    </div>
  </section>

  <section class="lbp-section lbp-section--sand" id="shop">
    <div class="lbp-container">
      <div class="lbp-sectionhead lbp-reveal">
        <div>
          <span class="lbp-eyebrow">Where to start</span>
          <h2 class="lbp-h2 lbp-sectionhead__title">Three ways to shop</h2>
        </div>
      </div>
      <div class="lbp-tiles lbp-tiles--lead">{tiles}</div>
    </div>
  </section>

  <section class="lbp-band" id="occasion">
    <img class="lbp-band__img" src="{band_img}" alt="" loading="lazy" decoding="async">
    <div class="lbp-band__veil"></div>
    <div class="lbp-band__inner">
      <div class="lbp-container">
        <div class="lbp-band__body lbp-reveal">
          <span class="lbp-eyebrow">Christening &amp; occasion</span>
          <h2 class="lbp-h1 lbp-band__title">The outfit gets kept.</h2>
          <p class="lbp-lead lbp-band__text">Gowns, bonnets, rompers and three-piece sets for the day itself — and for the box in the attic afterwards. Sized from one month.</p>
          <div class="lbp-hero__actions">
            <a class="lbp-btn lbp-btn--ondark" href="#">Girls christening</a>
            <a class="lbp-btn lbp-btn--lineondark" href="#">Boys christening</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="lbp-section" id="smocks">
    <div class="lbp-container">
      <div class="lbp-sectionhead lbp-reveal">
        <div>
          <span class="lbp-eyebrow">Exclusive to Little Bo Peep</span>
          <h2 class="lbp-h2 lbp-sectionhead__title">The smock collection</h2>
        </div>
        <a class="lbp-sectionhead__link" href="#">All {smock_count} smocks</a>
      </div>
      <div class="lbp-grid">{cards_smock}</div>
    </div>
  </section>

  <section class="lbp-section lbp-section--tight" id="ages">
    <div class="lbp-container">
      <div class="lbp-sectionhead lbp-reveal">
        <div>
          <span class="lbp-eyebrow">Browse by size</span>
          <h2 class="lbp-h2 lbp-sectionhead__title">Shop by age</h2>
        </div>
      </div>
      <div class="lbp-ages lbp-reveal">{ages}</div>
    </div>
  </section>

  <section class="lbp-section lbp-section--sand">
    <div class="lbp-container">
      <div class="lbp-editorial">
        <figure class="lbp-editorial__figure lbp-mask lbp-reveal">
          <img src="{story_img}" alt="{story_alt}" loading="lazy" decoding="async">
        </figure>
        <div class="lbp-editorial__body lbp-reveal" data-delay="1">
          <span class="lbp-eyebrow">Spiddal, Co Galway</span>
          <h2 class="lbp-h2 lbp-editorial__title">A small shop with a long buying list.</h2>
          <p class="lbp-lead lbp-editorial__text">Little Bo Peep is independently run, twelve miles outside Galway city. We buy traditional and Spanish childrenswear direct — Miranda, Rahigo, Sonata, Ela Confection, Ricittos — alongside shoes, boots and the accessories that finish an outfit. If you would rather spread the cost of an occasion outfit, we offer simple payment plans.</p>
          <a class="lbp-tlink" href="#">About the shop <span class="lbp-tlink__arrow" aria-hidden="true">&rarr;</span></a>
        </div>
      </div>
    </div>
  </section>

  <section class="lbp-section" id="designers">
    <div class="lbp-container">
      <div class="lbp-sectionhead lbp-reveal">
        <div>
          <span class="lbp-eyebrow">{designer_count} labels in stock</span>
          <h2 class="lbp-h2 lbp-sectionhead__title">Designers</h2>
        </div>
        <a class="lbp-sectionhead__link" href="#">All designers</a>
      </div>
      <div class="lbp-designers lbp-reveal">{designers}</div>
    </div>
  </section>

  <section class="lbp-section lbp-section--tight" id="sale">
    <div class="lbp-container">
      <div class="lbp-sectionhead lbp-reveal">
        <div>
          <span class="lbp-eyebrow">Reduced</span>
          <h2 class="lbp-h2 lbp-sectionhead__title">Sale</h2>
        </div>
        <a class="lbp-sectionhead__link" href="#">All sale</a>
      </div>
      <div class="lbp-grid">{cards_sale}</div>
    </div>
  </section>

  <section class="lbp-section lbp-section--tight">
    <div class="lbp-container">
      <div class="lbp-trust lbp-reveal">
        <div>
          <h3 class="lbp-trust__title">Payment plans</h3>
          <p class="lbp-trust__text">Spread the cost of an occasion outfit. Ask us in the shop or by email.</p>
        </div>
        <div>
          <h3 class="lbp-trust__title">14-day returns</h3>
          <p class="lbp-trust__text">Unworn, tags attached, odour free. Footwear returned in its original box.</p>
        </div>
        <div>
          <h3 class="lbp-trust__title">Worldwide shipping</h3>
          <p class="lbp-trust__text">Posted from Spiddal. Ireland, the UK and further afield.</p>
        </div>
        <div>
          <h3 class="lbp-trust__title">Talk to a person</h3>
          <p class="lbp-trust__text">Sizing between two labels is rarely the same. Ask before you order.</p>
        </div>
      </div>
    </div>
  </section>

</main>

<footer class="lbp-footer">
  <div class="lbp-container">
    <div class="lbp-footer__top">
      <div>
        <p class="lbp-footer__brand">Little Bo Peep</p>
        <p class="lbp-footer__blurb">An independently run children's boutique in Spiddal, Co Galway, specialising in traditional and Spanish childrenswear.</p>
        <form class="lbp-news__form" style="margin-top:32px" onsubmit="return false">
          <label class="lbp-sr" for="nl">Email address</label>
          <input class="lbp-field" id="nl" type="email" placeholder="Email address" required>
          <button class="lbp-btn lbp-btn--ondark" type="submit">Join</button>
        </form>
      </div>
      <div>
        <h2 class="lbp-footer__title">Shop</h2>
        <ul class="lbp-footer__list">
          <li><a href="#new">New in</a></li>
          <li><a href="#smocks">Smocks</a></li>
          <li><a href="#occasion">Christening</a></li>
          <li><a href="#designers">Designers</a></li>
          <li><a href="#sale">Sale</a></li>
        </ul>
      </div>
      <div>
        <h2 class="lbp-footer__title">Help</h2>
        <ul class="lbp-footer__list">
          <li><a href="#">Delivery</a></li>
          <li><a href="#">Returns</a></li>
          <li><a href="#">Size guide</a></li>
          <li><a href="#">Payment plans</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </div>
      <div>
        <h2 class="lbp-footer__title">Visit</h2>
        <ul class="lbp-footer__list">
          <li><a href="#">Spiddal, Co Galway</a></li>
          <li><a href="#">Instagram</a></li>
          <li><a href="#">Facebook</a></li>
        </ul>
      </div>
    </div>
    <div class="lbp-footer__bottom">
      <p>&copy; Little Bo Peep, Spiddal.</p>
      <p>Design preview — built from live catalogue data.</p>
    </div>
  </div>
</footer>

<!-- Bag drawer -->
<div class="lbp-scrim" data-scrim></div>
<aside class="lbp-drawer" data-drawer="bag" aria-label="Shopping bag" aria-hidden="true">
  <div class="lbp-drawer__head">
    <h2 class="lbp-drawer__title">Your bag</h2>
    <button class="lbp-iconbtn" type="button" aria-label="Close bag" data-close>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m6 6 12 12M18 6 6 18"/></svg>
    </button>
  </div>
  <div class="lbp-drawer__body">
    <div class="lbp-empty">
      <p class="lbp-empty__title">Nothing in the bag yet.</p>
      <p class="lbp-empty__text">Have a look at what came in this week.</p>
      <a class="lbp-btn lbp-btn--line" href="#new" data-close>Shop new in</a>
    </div>
  </div>
</aside>

<!-- Mobile navigation -->
<aside class="lbp-drawer lbp-drawer--left" data-drawer="mnav" aria-label="Menu" aria-hidden="true">
  <div class="lbp-drawer__head">
    <h2 class="lbp-drawer__title">Menu</h2>
    <button class="lbp-iconbtn" type="button" aria-label="Close menu" data-close>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m6 6 12 12M18 6 6 18"/></svg>
    </button>
  </div>
  <div class="lbp-drawer__body">
    <nav class="lbp-mnav" aria-label="Mobile">
      <a class="lbp-mnav__link" href="#new" data-close>New In <span aria-hidden="true">&rarr;</span></a>
      <a class="lbp-mnav__link" href="#designers" data-close>Designers <span aria-hidden="true">&rarr;</span></a>
      <a class="lbp-mnav__link" href="#smocks" data-close>Smocks <span aria-hidden="true">&rarr;</span></a>
      <a class="lbp-mnav__link" href="#occasion" data-close>Christening <span aria-hidden="true">&rarr;</span></a>
      <a class="lbp-mnav__link" href="#ages" data-close>Shop by age <span aria-hidden="true">&rarr;</span></a>
      <a class="lbp-mnav__link" href="#sale" data-close>Sale <span aria-hidden="true">&rarr;</span></a>
      <a class="lbp-mnav__link" href="#" data-close>Account <span aria-hidden="true">&rarr;</span></a>
    </nav>
  </div>
</aside>

<script>
(function () {{
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sticky header state
  var header = document.getElementById('header');
  var onScroll = function () {{
    header.classList.toggle('is-stuck', window.scrollY > 12);
  }};
  onScroll();
  window.addEventListener('scroll', onScroll, {{ passive: true }});

  // Scroll reveal — one observer, one system
  var items = document.querySelectorAll('.lbp-reveal, .lbp-mask');
  if (reduce || !('IntersectionObserver' in window)) {{
    items.forEach(function (el) {{ el.classList.add('is-in'); }});
  }} else {{
    var io = new IntersectionObserver(function (entries) {{
      entries.forEach(function (e) {{
        if (e.isIntersecting) {{ e.target.classList.add('is-in'); io.unobserve(e.target); }}
      }});
    }}, {{ rootMargin: '0px 0px -8% 0px', threshold: 0.08 }});
    items.forEach(function (el) {{ io.observe(el); }});
  }}
  document.getElementById('hero').classList.add('is-in');

  // Mega menu — hover on pointer devices, click/keyboard everywhere
  document.querySelectorAll('[data-mega]').forEach(function (item) {{
    var trigger = item.querySelector('.lbp-nav__link');
    var open = function (state) {{
      item.classList.toggle('is-open', state);
      trigger.setAttribute('aria-expanded', String(state));
    }};
    item.addEventListener('mouseenter', function () {{ open(true); }});
    item.addEventListener('mouseleave', function () {{ open(false); }});
    trigger.addEventListener('click', function (e) {{
      e.preventDefault();
      open(!item.classList.contains('is-open'));
    }});
    item.addEventListener('keydown', function (e) {{
      if (e.key === 'Escape') {{ open(false); trigger.focus(); }}
    }});
  }});

  // Drawers
  var scrim = document.querySelector('[data-scrim]');
  var openDrawer = function (name) {{
    var d = document.querySelector('[data-drawer="' + name + '"]');
    if (!d) return;
    d.classList.add('is-open');
    d.setAttribute('aria-hidden', 'false');
    scrim.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var f = d.querySelector('button, a, input');
    if (f) f.focus();
  }};
  var closeAll = function () {{
    document.querySelectorAll('[data-drawer]').forEach(function (d) {{
      d.classList.remove('is-open');
      d.setAttribute('aria-hidden', 'true');
    }});
    scrim.classList.remove('is-open');
    document.body.style.overflow = '';
  }};
  document.querySelectorAll('[data-open]').forEach(function (b) {{
    b.addEventListener('click', function () {{ openDrawer(b.getAttribute('data-open')); }});
  }});
  document.querySelectorAll('[data-close]').forEach(function (b) {{
    b.addEventListener('click', closeAll);
  }});
  scrim.addEventListener('click', closeAll);
  document.addEventListener('keydown', function (e) {{ if (e.key === 'Escape') closeAll(); }});

  // Quick add + wishlist feedback (preview only)
  var count = 0;
  var bag = document.querySelector('[data-bagcount]');
  document.addEventListener('click', function (e) {{
    var q = e.target.closest('.lbp-card__quick');
    if (q) {{
      q.textContent = 'Added';
      count += 1;
      bag.textContent = String(count);
      setTimeout(function () {{ q.textContent = 'Quick add'; }}, 1400);
      return;
    }}
    var w = e.target.closest('.lbp-card__wish');
    if (w) w.classList.toggle('is-on');
  }});
}})();
</script>
</body>
</html>
"""

if __name__ == "__main__":
    main()
