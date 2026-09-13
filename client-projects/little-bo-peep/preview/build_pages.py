#!/usr/bin/env python3
"""
Little Bo Peep — product and collection page previews.

Like build.py, everything rendered comes from the real catalogue export:
variants, stock per size, prices, descriptions where they exist (only 4% of
products have one), and photography from the store's own CDN.

Run:  python3 build_pages.py            # CDN imagery
      python3 build_pages.py --embed    # offline, photos sliced from contact sheets
"""

import sys
from collections import Counter
from pathlib import Path

import build
from build import (AGE_BANDS, brand_of, clean_title, cdn, compare_of, esc,
                   load_images, load_products, money, months_of, price_of,
                   product_card, sku_of)

HERE = Path(__file__).parent


def head(title, desc, extra=""):
    return f"""<!DOCTYPE html>
<html lang="en-IE">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="lbp-system.css">
{extra}
</head>
<body>
<a class="lbp-skip" href="#main">Skip to content</a>
"""


HEADER = """
<div class="lbp-announce"><div class="lbp-container"><div class="lbp-announce__track">
<p class="lbp-announce__item">10% off your first order with <span class="lbp-announce__code">FIRST</span> &nbsp;·&nbsp; Worldwide shipping &nbsp;·&nbsp; Payment plans available</p>
</div></div></div>

<header class="lbp-header" id="header"><div class="lbp-container"><div class="lbp-header__bar">
  <nav class="lbp-header__nav" aria-label="Primary"><ul class="lbp-nav">
    <li class="lbp-nav__item"><a class="lbp-nav__link" href="index.html#new">New In</a></li>
    <li class="lbp-nav__item"><a class="lbp-nav__link" href="collection.html">Designers</a></li>
    <li class="lbp-nav__item"><a class="lbp-nav__link" href="index.html#smocks">Smocks</a></li>
    <li class="lbp-nav__item"><a class="lbp-nav__link" href="index.html#occasion">Christening</a></li>
    <li class="lbp-nav__item"><a class="lbp-nav__link" href="index.html#ages">Baby</a></li>
    <li class="lbp-nav__item"><a class="lbp-nav__link" href="index.html#sale">Sale</a></li>
  </ul></nav>
  <button class="lbp-iconbtn lbp-burger" type="button" aria-label="Open menu" data-open="mnav">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
  </button>
  <a class="lbp-logo" href="index.html">Little Bo Peep<span class="lbp-logo__sub">Spiddal · Co Galway</span></a>
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
</div></div></header>
"""

FOOTER = """
<footer class="lbp-footer"><div class="lbp-container">
  <div class="lbp-footer__top">
    <div>
      <p class="lbp-footer__brand">Little Bo Peep</p>
      <p class="lbp-footer__blurb">An independently run children's boutique in Spiddal, Co Galway, specialising in traditional and Spanish childrenswear.</p>
    </div>
    <div><h2 class="lbp-footer__title">Shop</h2><ul class="lbp-footer__list">
      <li><a href="index.html#new">New in</a></li><li><a href="collection.html">Designers</a></li>
      <li><a href="index.html#smocks">Smocks</a></li><li><a href="index.html#sale">Sale</a></li></ul></div>
    <div><h2 class="lbp-footer__title">Help</h2><ul class="lbp-footer__list">
      <li><a href="#">Delivery</a></li><li><a href="#">Returns</a></li>
      <li><a href="#">Size guide</a></li><li><a href="#">Payment plans</a></li></ul></div>
    <div><h2 class="lbp-footer__title">Visit</h2><ul class="lbp-footer__list">
      <li><a href="#">Spiddal, Co Galway</a></li><li><a href="#">Instagram</a></li></ul></div>
  </div>
  <div class="lbp-footer__bottom"><p>&copy; Little Bo Peep, Spiddal.</p><p>Design preview — built from live catalogue data.</p></div>
</div></footer>

<div class="lbp-scrim" data-scrim></div>
<aside class="lbp-drawer" data-drawer="bag" aria-label="Shopping bag" aria-hidden="true">
  <div class="lbp-drawer__head"><h2 class="lbp-drawer__title">Your bag</h2>
    <button class="lbp-iconbtn" type="button" aria-label="Close bag" data-close>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
  <div class="lbp-drawer__body" data-bagbody>
    <div class="lbp-empty"><p class="lbp-empty__title">Nothing in the bag yet.</p>
      <p class="lbp-empty__text">Have a look at what came in this week.</p>
      <a class="lbp-btn lbp-btn--line" href="index.html#new">Shop new in</a></div>
  </div>
</aside>
<aside class="lbp-drawer lbp-drawer--left" data-drawer="mnav" aria-label="Menu" aria-hidden="true">
  <div class="lbp-drawer__head"><h2 class="lbp-drawer__title">Menu</h2>
    <button class="lbp-iconbtn" type="button" aria-label="Close menu" data-close>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
  <div class="lbp-drawer__body"><nav class="lbp-mnav" aria-label="Mobile">
    <a class="lbp-mnav__link" href="index.html#new" data-close>New In <span aria-hidden="true">&rarr;</span></a>
    <a class="lbp-mnav__link" href="collection.html" data-close>Designers <span aria-hidden="true">&rarr;</span></a>
    <a class="lbp-mnav__link" href="index.html#smocks" data-close>Smocks <span aria-hidden="true">&rarr;</span></a>
    <a class="lbp-mnav__link" href="index.html#sale" data-close>Sale <span aria-hidden="true">&rarr;</span></a>
  </nav></div>
</aside>
"""

SHARED_JS = """
<script>
(function(){
  var header=document.getElementById('header');
  var onScroll=function(){header.classList.toggle('is-stuck',window.scrollY>12);};
  onScroll(); window.addEventListener('scroll',onScroll,{passive:true});

  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items=document.querySelectorAll('.lbp-reveal,.lbp-mask');
  if(reduce||!('IntersectionObserver' in window)){items.forEach(function(e){e.classList.add('is-in');});}
  else{var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target);}});},
    {rootMargin:'0px 0px -8% 0px',threshold:0.08});
    items.forEach(function(e){io.observe(e);});}

  var scrim=document.querySelector('[data-scrim]');
  var closeAll=function(){document.querySelectorAll('[data-drawer]').forEach(function(d){
      d.classList.remove('is-open'); d.setAttribute('aria-hidden','true');});
    scrim.classList.remove('is-open'); document.body.style.overflow='';};
  document.querySelectorAll('[data-open]').forEach(function(b){b.addEventListener('click',function(){
    var d=document.querySelector('[data-drawer="'+b.getAttribute('data-open')+'"]'); if(!d)return;
    d.classList.add('is-open'); d.setAttribute('aria-hidden','false');
    scrim.classList.add('is-open'); document.body.style.overflow='hidden';
    var f=d.querySelector('button,a,input'); if(f)f.focus();});});
  document.querySelectorAll('[data-close]').forEach(function(b){b.addEventListener('click',closeAll);});
  scrim.addEventListener('click',closeAll);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeAll();});
})();
</script>
"""


# ----------------------------------------------------------------- product

def build_product(products, imgs):
    # Show the page at its best: a product with a real description, several
    # photographs and a full size run. Only 24 of 691 products have any
    # description at all, which is why the layout below must also work without.
    def score(p):
        return (len((p.get("description_plain") or "").strip()) > 40,
                len(imgs.get(p["handle"], [])),
                len(p.get("variants") or []))
    p = max((x for x in products if imgs.get(x["handle"])), key=score)

    urls = imgs[p["handle"]]
    name = clean_title(p["title"])
    brand = brand_of(p)
    ref = sku_of(p["title"])
    price, was = price_of(p), compare_of(p)
    on_sale = bool(was and price and was > price)
    desc = (p.get("description_plain") or "").strip()

    variants = [v for v in (p.get("variants") or []) if v.get("title")]
    sizes = "".join(
        f'<button class="lbp-size" type="button" data-size="{esc(v["title"])}"'
        f'{"" if v.get("available") else " disabled"}>{esc(v["title"])}</button>'
        for v in variants
    )
    n_avail = sum(1 for v in variants if v.get("available"))

    main = f"""
      <figure class="lbp-gallery__main">
        <img id="pdp-main" src="{esc(cdn(urls[0], 1000))}" alt="{esc(name)}" fetchpriority="high">
        <button class="lbp-gallery__zoom" type="button" aria-label="Zoom image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6M11 8.5v5M8.5 11h5"/></svg>
        </button>
      </figure>"""
    thumbs = "".join(
        f'<button class="lbp-thumb{" is-on" if i == 0 else ""}" type="button" '
        f'data-full="{esc(cdn(u, 1000))}" aria-label="View image {i+1}">'
        f'<img src="{esc(cdn(u, 200))}" alt=""></button>'
        for i, u in enumerate(urls)
    )
    strip = "".join(
        f'<figure><img src="{esc(cdn(u, 800))}" alt="{esc(name) if i == 0 else ""}" '
        f'loading="{"eager" if i == 0 else "lazy"}"></figure>'
        for i, u in enumerate(urls)
    )

    if on_sale:
        price_html = (f'<span class="lbp-buy__was lbp-num">{money(was)}</span>'
                      f'<span class="lbp-buy__now--sale lbp-num">{money(price)}</span>')
    else:
        price_html = f'<span class="lbp-num">{money(price)}</span>' if price else ""

    # Description panel only exists when there is one to show.
    desc_panel = ""
    if desc:
        desc_panel = f"""
        <div class="lbp-acc__item">
          <button class="lbp-acc__btn" type="button" aria-expanded="true">Description
            <span class="lbp-acc__icon" aria-hidden="true">+</span></button>
          <div class="lbp-acc__panel is-open"><div class="lbp-acc__inner"><p>{esc(desc)}</p></div></div>
        </div>"""

    related = [q for q in products
               if q is not p and brand and brand_of(q) == brand and imgs.get(q["handle"])][:4]
    if len(related) < 4:
        related += [q for q in products
                    if q is not p and q not in related and imgs.get(q["handle"])][:4 - len(related)]
    related_html = "".join(product_card(q, imgs, i % 4) for i, q in enumerate(related))

    schema = (
        '{"@context":"https://schema.org","@type":"Product",'
        f'"name":{__import__("json").dumps(name)},'
        f'"brand":{{"@type":"Brand","name":{__import__("json").dumps(brand or "Little Bo Peep")}}},'
        f'"offers":{{"@type":"Offer","priceCurrency":"EUR","price":"{price or 0}",'
        f'"availability":"https://schema.org/{"InStock" if n_avail else "OutOfStock"}"}}}}'
    )

    body = f"""
<main id="main"><div class="lbp-container">

  <nav class="lbp-crumb" aria-label="Breadcrumb">
    <a href="index.html">Home</a><span class="lbp-crumb__sep">/</span>
    <a href="collection.html">{esc(brand or "All products")}</a><span class="lbp-crumb__sep">/</span>
    <span aria-current="page">{esc(name)}</span>
  </nav>

  <div class="lbp-pdp">
    <div class="lbp-gallery">
      {main}
      <div class="lbp-gallery__strip">{strip}</div>
      <div class="lbp-thumbs">{thumbs}</div>
    </div>

    <div class="lbp-buy">
      {f'<p class="lbp-eyebrow lbp-buy__brand">{esc(brand)}</p>' if brand else ""}
      <h1 class="lbp-h2 lbp-buy__title">{esc(name)}</h1>
      <p class="lbp-buy__price">{price_html}</p>
      <p class="lbp-buy__tax">Taxes included. Shipping calculated at checkout.</p>

      <p class="lbp-stock{"" if n_avail else " lbp-stock--out"}">
        <span class="lbp-stock__dot"></span>
        {f"In stock &middot; {n_avail} of {len(variants)} sizes available" if n_avail else "Currently out of stock"}
      </p>

      <div class="lbp-sizehead">
        <span class="lbp-sizehead__label">Size</span>
        <a class="lbp-sizehead__guide" href="#">Size guide</a>
      </div>
      <div class="lbp-sizes" id="sizes">{sizes}</div>
      <p class="lbp-sizenote" id="sizenote" hidden>Choose a size to add this to your bag.</p>

      <div class="lbp-buy__actions">
        <button class="lbp-btn lbp-btn--solid" type="button" id="addbtn">Add to bag</button>
        <button class="lbp-wishbtn" type="button" id="wish" aria-label="Save this piece" aria-pressed="false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
            <path d="M12 20.5S3.8 15 3.8 9.3a4.3 4.3 0 0 1 8.2-1.8 4.3 4.3 0 0 1 8.2 1.8c0 5.7-8.2 11.2-8.2 11.2Z"/></svg>
        </button>
      </div>

      <div class="lbp-acc">
        {desc_panel}
        <div class="lbp-acc__item">
          <button class="lbp-acc__btn" type="button" aria-expanded="false">Delivery
            <span class="lbp-acc__icon" aria-hidden="true">+</span></button>
          <div class="lbp-acc__panel"><div class="lbp-acc__inner">
            <p>Posted from the shop in Spiddal, Co Galway. Worldwide shipping available.</p>
            <p>Preorder pieces are dispatched when the delivery lands with us — the month is shown in the product name.</p>
          </div></div>
        </div>
        <div class="lbp-acc__item">
          <button class="lbp-acc__btn" type="button" aria-expanded="false">Returns
            <span class="lbp-acc__icon" aria-hidden="true">+</span></button>
          <div class="lbp-acc__panel"><div class="lbp-acc__inner">
            <p>Return within 14 days, unworn, odour free and with all tags attached. Include a note with your name and return address.</p>
            <p>Footwear must come back in its original box, undamaged and inside outer packaging.</p>
          </div></div>
        </div>
        <div class="lbp-acc__item">
          <button class="lbp-acc__btn" type="button" aria-expanded="false">Paying in instalments
            <span class="lbp-acc__icon" aria-hidden="true">+</span></button>
          <div class="lbp-acc__panel"><div class="lbp-acc__inner">
            <p>We offer simple payment plans to spread the cost of an occasion outfit. Ask us in the shop or by email.</p>
          </div></div>
        </div>
        <div class="lbp-acc__item">
          <button class="lbp-acc__btn" type="button" aria-expanded="false">Ask about this piece
            <span class="lbp-acc__icon" aria-hidden="true">+</span></button>
          <div class="lbp-acc__panel"><div class="lbp-acc__inner">
            <p>Sizing runs differently between Spanish labels. If you are between sizes, ask us before you order and we will measure the actual garment.</p>
          </div></div>
        </div>
      </div>
      {f'<p class="lbp-note" style="margin-top:24px">Reference {esc(ref)}</p>' if ref else ""}
    </div>
  </div>
</div>

<section class="lbp-section lbp-section--sand"><div class="lbp-container">
  <div class="lbp-sectionhead lbp-reveal">
    <div><span class="lbp-eyebrow">{esc(("More from " + brand) if brand else "You may also like")}</span>
      <h2 class="lbp-h2 lbp-sectionhead__title">Seen with this</h2></div>
    <a class="lbp-sectionhead__link" href="collection.html">View all</a>
  </div>
  <div class="lbp-grid">{related_html}</div>
</div></section>
</main>

<div class="lbp-stickybuy" id="stickybuy">
  <span class="lbp-stickybuy__price lbp-num">{money(price) if price else ""}</span>
  <button class="lbp-btn lbp-btn--solid" type="button" data-addproxy>Add to bag</button>
</div>
"""

    js = """
<script>
(function(){
  var thumbs=document.querySelectorAll('.lbp-thumb'), main=document.getElementById('pdp-main');
  thumbs.forEach(function(t){t.addEventListener('click',function(){
    thumbs.forEach(function(x){x.classList.remove('is-on');});
    t.classList.add('is-on'); main.src=t.getAttribute('data-full');});});

  var chosen=null, sizes=document.getElementById('sizes'), note=document.getElementById('sizenote');
  sizes.addEventListener('click',function(e){
    var b=e.target.closest('.lbp-size'); if(!b||b.disabled)return;
    sizes.querySelectorAll('.lbp-size').forEach(function(x){x.classList.remove('is-on');});
    b.classList.add('is-on'); chosen=b.getAttribute('data-size');
    sizes.classList.remove('is-missing'); note.hidden=true;});

  var count=0, bag=document.querySelector('[data-bagcount]');
  var add=function(btn){
    if(!chosen){
      sizes.classList.add('is-missing'); note.hidden=false;
      sizes.scrollIntoView({behavior:'smooth',block:'center'});
      var first=sizes.querySelector('.lbp-size:not([disabled])'); if(first)first.focus();
      return;}
    var label=btn.textContent; btn.disabled=true; btn.textContent='Adding\\u2026';
    setTimeout(function(){
      count++; bag.textContent=String(count);
      btn.textContent='Added';
      var d=document.querySelector('[data-drawer="bag"]'), s=document.querySelector('[data-scrim]');
      d.classList.add('is-open'); d.setAttribute('aria-hidden','false');
      s.classList.add('is-open'); document.body.style.overflow='hidden';
      setTimeout(function(){btn.disabled=false; btn.textContent=label;},1400);
    },420);};
  document.getElementById('addbtn').addEventListener('click',function(){add(this);});
  document.querySelectorAll('[data-addproxy]').forEach(function(b){
    b.addEventListener('click',function(){add(this);});});

  var wish=document.getElementById('wish');
  wish.addEventListener('click',function(){
    var on=wish.classList.toggle('is-on'); wish.setAttribute('aria-pressed',String(on));});

  document.querySelectorAll('.lbp-acc__btn').forEach(function(b){
    b.addEventListener('click',function(){
      var open=b.getAttribute('aria-expanded')==='true';
      b.setAttribute('aria-expanded',String(!open));
      b.nextElementSibling.classList.toggle('is-open',!open);});});

  // Sticky buy bar appears once the real button has scrolled away
  var addbtn=document.getElementById('addbtn'), bar=document.getElementById('stickybuy');
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){
      bar.classList.toggle('is-up',!es[0].isIntersecting);
    },{threshold:0}).observe(addbtn);}
})();
</script>
"""
    return (head(f"{name} — Little Bo Peep",
                 f"{name}. {brand or 'Little Bo Peep'}, from the boutique in Spiddal, Co Galway.",
                 f'<script type="application/ld+json">{schema}</script>')
            + HEADER + body + FOOTER + SHARED_JS + js + "</body></html>")


# -------------------------------------------------------------- collection

def band_of(p):
    out = set()
    for opt in p.get("options") or []:
        if not isinstance(opt, dict) or "size" not in opt.get("name", "").lower():
            continue
        for v in opt.get("values") or []:
            m = months_of(str(v))
            if m is None:
                continue
            for label, test in AGE_BANDS:
                if test(m):
                    out.add(label)
    return out


PRICE_BANDS = [("Under €50", 0, 50), ("€50 – €100", 50, 100),
               ("€100 – €200", 100, 200), ("€200 and over", 200, 10**9)]


def build_collection(products, imgs):
    pool = [p for p in products if imgs.get(p["handle"]) and price_of(p)][:60]

    bcount, acount, pcount = Counter(), Counter(), Counter()
    cards = []
    for i, p in enumerate(pool):
        b = brand_of(p) or "Little Bo Peep"
        bands = band_of(p)
        pr = price_of(p)
        pb = next((n for n, lo, hi in PRICE_BANDS if lo <= pr < hi), "")
        bcount[b] += 1
        acount.update(bands)
        pcount[pb] += 1
        attrs = (f' data-brand="{esc(b)}" data-ages="{esc("|".join(sorted(bands)))}"'
                 f' data-price="{pr:.2f}" data-pband="{esc(pb)}"'
                 f' data-stock="{"in" if p.get("available") else "out"}"')
        cards.append(product_card(p, imgs, i % 4, attrs))

    def facet(title, key, rows):
        opts = "".join(
            f'<label class="lbp-check"><input type="checkbox" data-facet="{key}" value="{esc(v)}">'
            f'<span class="lbp-check__box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            f'stroke-width="3"><path d="m5 12 5 5L19 7"/></svg></span>{esc(v)}'
            f'<span class="lbp-check__n">{n}</span></label>'
            for v, n in rows if v)
        return (f'<div class="lbp-facet"><h3 class="lbp-facet__title">{esc(title)}</h3>'
                f'<div class="lbp-facet__list">{opts}</div></div>')

    facets = (
        facet("Age", "ages", [(l, acount[l]) for l, _ in AGE_BANDS if acount[l]])
        + facet("Designer", "brand", bcount.most_common())
        + facet("Price", "pband", [(n, pcount[n]) for n, _, _ in PRICE_BANDS if pcount[n]])
        + facet("Availability", "stock",
                [("in", sum(1 for p in pool if p.get("available"))),
                 ("out", sum(1 for p in pool if not p.get("available")))])
    )

    body = f"""
<main id="main"><div class="lbp-container">
  <nav class="lbp-crumb" aria-label="Breadcrumb">
    <a href="index.html">Home</a><span class="lbp-crumb__sep">/</span>
    <span aria-current="page">All products</span>
  </nav>

  <div class="lbp-collhead">
    <span class="lbp-eyebrow">The shop</span>
    <h1 class="lbp-h1 lbp-collhead__title">All products</h1>
    <p class="lbp-lead">Spanish and traditional childrenswear, newborn to twelve years. Filter by age, designer or price.</p>
  </div>

  <div class="lbp-toolbar">
    <p class="lbp-toolbar__count"><span data-count>{len(pool)}</span> pieces</p>
    <div class="lbp-toolbar__right">
      <button class="lbp-btn lbp-btn--line lbp-filterbtn" type="button" data-open="filters">Filter</button>
      <label class="lbp-sr" for="sort">Sort by</label>
      <select class="lbp-select" id="sort">
        <option value="featured">Featured</option>
        <option value="low">Price, low to high</option>
        <option value="high">Price, high to low</option>
        <option value="az">Name, A–Z</option>
      </select>
    </div>
  </div>

  <div class="lbp-coll">
    <aside class="lbp-coll__aside" aria-label="Filters"><div id="facets">{facets}</div></aside>
    <div>
      <div class="lbp-chips" id="chips"></div>
      <div class="lbp-grid" id="grid">{"".join(cards)}</div>
      <div class="lbp-noresults" id="noresults" hidden>
        <p class="lbp-empty__title">Nothing matches all of those filters.</p>
        <p class="lbp-empty__text">Try removing one — age and designer together narrow things quickly.</p>
        <button class="lbp-btn lbp-btn--line" type="button" id="clearall">Clear filters</button>
      </div>
    </div>
  </div>
</div></main>

<aside class="lbp-drawer" data-drawer="filters" aria-label="Filters" aria-hidden="true">
  <div class="lbp-drawer__head"><h2 class="lbp-drawer__title">Filter</h2>
    <button class="lbp-iconbtn" type="button" aria-label="Close filters" data-close>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
  <div class="lbp-drawer__body" id="facets-mobile"></div>
  <div class="lbp-drawer__foot">
    <button class="lbp-btn lbp-btn--solid lbp-btn--block" type="button" data-close>
      Show <span data-count>{len(pool)}</span> pieces</button>
  </div>
</aside>
"""

    js = """
<script>
(function(){
  var grid=document.getElementById('grid');
  var cards=Array.prototype.slice.call(grid.children);
  var chips=document.getElementById('chips');
  var none=document.getElementById('noresults');

  // The mobile drawer reuses the same markup, so clone it and keep the two
  // sets of inputs in step rather than maintaining two facet trees.
  var mob=document.getElementById('facets-mobile');
  mob.innerHTML=document.getElementById('facets').innerHTML;

  var state={ages:[],brand:[],pband:[],stock:[]};

  function sync(key,value,on){
    document.querySelectorAll('input[data-facet="'+key+'"]').forEach(function(i){
      if(i.value===value) i.checked=on;});
  }
  function label(key,v){ return key==='stock' ? (v==='in'?'In stock':'Out of stock') : v; }

  function apply(){
    var shown=0;
    cards.forEach(function(c){
      var ok=true;
      if(state.ages.length){
        var a=(c.getAttribute('data-ages')||'').split('|');
        ok=ok&&state.ages.some(function(v){return a.indexOf(v)>-1;});}
      if(state.brand.length) ok=ok&&state.brand.indexOf(c.getAttribute('data-brand'))>-1;
      if(state.pband.length) ok=ok&&state.pband.indexOf(c.getAttribute('data-pband'))>-1;
      if(state.stock.length) ok=ok&&state.stock.indexOf(c.getAttribute('data-stock'))>-1;
      c.hidden=!ok; if(ok)shown++;});

    document.querySelectorAll('[data-count]').forEach(function(n){n.textContent=String(shown);});
    none.hidden=shown>0;

    chips.innerHTML='';
    Object.keys(state).forEach(function(k){
      state[k].forEach(function(v){
        var b=document.createElement('button');
        b.className='lbp-chip'; b.type='button';
        b.innerHTML=label(k,v)+' <span class="lbp-chip__x" aria-hidden="true">&times;</span>';
        b.setAttribute('aria-label','Remove filter '+label(k,v));
        b.addEventListener('click',function(){
          state[k]=state[k].filter(function(x){return x!==v;});
          sync(k,v,false); apply();});
        chips.appendChild(b);});});
  }

  document.addEventListener('change',function(e){
    var i=e.target.closest('input[data-facet]'); if(!i)return;
    var k=i.getAttribute('data-facet'), v=i.value;
    if(i.checked){ if(state[k].indexOf(v)<0) state[k].push(v); }
    else { state[k]=state[k].filter(function(x){return x!==v;}); }
    sync(k,v,i.checked); apply();});

  document.getElementById('clearall').addEventListener('click',function(){
    Object.keys(state).forEach(function(k){state[k]=[];});
    document.querySelectorAll('input[data-facet]').forEach(function(i){i.checked=false;});
    apply();});

  document.getElementById('sort').addEventListener('change',function(){
    var v=this.value, s=cards.slice();
    if(v==='low')  s.sort(function(a,b){return a.dataset.price-b.dataset.price;});
    if(v==='high') s.sort(function(a,b){return b.dataset.price-a.dataset.price;});
    if(v==='az')   s.sort(function(a,b){
      return a.querySelector('.lbp-card__name').textContent.trim()
        .localeCompare(b.querySelector('.lbp-card__name').textContent.trim());});
    s.forEach(function(c){grid.appendChild(c);});});

  apply();
})();
</script>
"""
    return (head("All products — Little Bo Peep",
                 "Spanish and traditional childrenswear, newborn to twelve years, from the boutique in Spiddal, Co Galway.")
            + HEADER + body + FOOTER + SHARED_JS + js + "</body></html>")


def main():
    if "--embed" in sys.argv:
        build.EMBED = True
    products = load_products()
    imgs = load_images()
    for fn, name in ((build_product, "product.html"), (build_collection, "collection.html")):
        out = HERE / name
        out.write_text(fn(products, imgs), encoding="utf-8")
        print(f"wrote {out}  ({out.stat().st_size/1024:.0f} KB)")


if __name__ == "__main__":
    main()
