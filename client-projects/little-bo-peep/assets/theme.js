(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky header ---------- */
  var header = document.getElementById('header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 12); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Announcement bar rotator ---------- */
  var announce = document.querySelector('[data-announce]');
  if (announce) {
    var slides = Array.prototype.slice.call(announce.querySelectorAll('.lbp-announce__item'));
    if (slides.length > 1 && !reduce) {
      var current = slides.findIndex(function (el) { return el.classList.contains('is-active'); });
      if (current < 0) current = 0;
      setInterval(function () {
        slides[current].classList.remove('is-active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('is-active');
      }, 5000);
    }
  }

  /* ---------- First-order promo modal ---------- */
  var promo = document.getElementById('promo');
  var promoDismissed = false;
  try { promoDismissed = sessionStorage.getItem('lbp_promo_dismissed') === '1'; } catch (err) {}
  if (promo && !promoDismissed) {
    var showPromo = function () {
      promo.hidden = false;
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(function () {
        promo.classList.add('is-visible');
        var closeBtn = promo.querySelector('.lbp-promo__close');
        if (closeBtn) closeBtn.focus();
      });
    };
    var hidePromo = function () {
      promo.classList.remove('is-visible');
      document.body.style.overflow = '';
      try { sessionStorage.setItem('lbp_promo_dismissed', '1'); } catch (err) {}
      setTimeout(function () { promo.hidden = true; }, 400);
    };
    window.addEventListener('scroll', function () {
      setTimeout(showPromo, 7000);
    }, { passive: true, once: true });
    promo.querySelectorAll('[data-promo-close]').forEach(function (el) {
      el.addEventListener('click', hidePromo);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && promo.classList.contains('is-visible')) hidePromo();
    });
    var promoCopy = promo.querySelector('[data-promo-copy]');
    if (promoCopy) {
      promoCopy.addEventListener('click', function () {
        var code = promoCopy.getAttribute('data-code') || '';
        if (!navigator.clipboard || !code) return;
        navigator.clipboard.writeText(code).then(function () {
          var label = promoCopy.textContent;
          promoCopy.textContent = 'Copied';
          setTimeout(function () { promoCopy.textContent = label; }, 1600);
        }).catch(function () {});
      });
    }
  }

  /* ---------- Scroll reveal ---------- */
  var revealItems = document.querySelectorAll('.lbp-reveal, .lbp-mask');
  if (reduce || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealItems.forEach(function (el) { io.observe(el); });
  }
  var hero = document.getElementById('hero');
  if (hero) hero.classList.add('is-in');

  /* ---------- Mega menu ---------- */
  document.querySelectorAll('[data-mega]').forEach(function (item) {
    var trigger = item.querySelector('.lbp-navrow__trigger');
    if (!trigger) return;
    var closeTimer;
    var open = function (state) {
      clearTimeout(closeTimer);
      item.classList.toggle('is-open', state);
      trigger.setAttribute('aria-expanded', String(state));
    };
    item.addEventListener('mouseenter', function () { open(true); });
    item.addEventListener('mouseleave', function () {
      closeTimer = setTimeout(function () { open(false); }, 120);
    });
    trigger.addEventListener('click', function (e) {
      /* Small screens (no hover) get a normal link tap; desktop toggles the panel. */
      if (window.matchMedia('(hover: hover)').matches) {
        e.preventDefault();
        open(!item.classList.contains('is-open'));
      }
    });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { open(false); trigger.focus(); }
    });
  });
  /* Close an open mega panel on outside click */
  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-mega]')) {
      document.querySelectorAll('[data-mega].is-open').forEach(function (item) {
        item.classList.remove('is-open');
        var t = item.querySelector('.lbp-navrow__trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }
  });

  /* ---------- Drawers ---------- */
  var scrim = document.querySelector('[data-scrim]');
  var closeAll = function () {
    document.querySelectorAll('[data-drawer]').forEach(function (d) {
      d.classList.remove('is-open');
      d.setAttribute('aria-hidden', 'true');
    });
    if (scrim) scrim.classList.remove('is-open');
    document.body.style.overflow = '';
  };
  var openDrawer = function (name) {
    var d = document.querySelector('[data-drawer="' + name + '"]');
    if (!d) return;
    d.classList.add('is-open');
    d.setAttribute('aria-hidden', 'false');
    if (scrim) scrim.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var f = d.querySelector('button, a, input');
    if (f) f.focus();
  };
  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-open]');
    if (opener) { e.preventDefault(); openDrawer(opener.getAttribute('data-open')); return; }
    var closer = e.target.closest('[data-close]');
    if (closer) { closeAll(); }
  });
  if (scrim) scrim.addEventListener('click', closeAll);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });

  /* ---------- Wishlist (visual only) ---------- */
  document.addEventListener('click', function (e) {
    var w = e.target.closest('.lbp-card__wish, #wish');
    if (w) {
      var on = w.classList.toggle('is-on');
      w.setAttribute('aria-pressed', String(on));
    }
  });

  /* ---------- Cart helpers ---------- */
  var bagCounts = document.querySelectorAll('[data-bagcount]');
  function setBagCount(n) {
    bagCounts.forEach(function (el) { el.textContent = String(n); });
  }
  function refreshCartDrawer() {
    return fetch('/?sections=cart-drawer')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var html = data['cart-drawer'];
        if (!html) return;
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var fresh = doc.querySelector('[data-drawer="bag"]');
        var current = document.querySelector('[data-drawer="bag"]');
        if (fresh && current) {
          var wasOpen = current.classList.contains('is-open');
          current.replaceWith(fresh);
          if (wasOpen) { fresh.classList.add('is-open'); fresh.setAttribute('aria-hidden', 'false'); }
        }
      });
  }
  function refreshCartCount() {
    return fetch('/cart.js').then(function (r) { return r.json(); }).then(function (cart) {
      setBagCount(cart.item_count);
      return cart;
    });
  }
  function addToCart(variantId, qty, onDone) {
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: [{ id: variantId, quantity: qty || 1 }] })
    })
      .then(function (r) { return r.json(); })
      .then(function () { return refreshCartDrawer(); })
      .then(function () { return refreshCartCount(); })
      .then(function () { openDrawer('bag'); if (onDone) onDone(true); })
      .catch(function () { if (onDone) onDone(false); });
  }
  function changeLine(key, quantity) {
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: quantity })
    })
      .then(function () { return refreshCartDrawer(); })
      .then(function () { return refreshCartCount(); });
  }
  document.addEventListener('click', function (e) {
    var line = e.target.closest('.lbp-bagitem[data-line-key]');
    if (!line) return;
    var key = line.getAttribute('data-line-key');
    if (e.target.closest('[data-remove]')) {
      changeLine(key, 0);
    } else if (e.target.closest('[data-qty-up]')) {
      var cur = parseInt(line.querySelector('[data-qty] .lbp-qty__n').textContent, 10) || 1;
      changeLine(key, cur + 1);
    } else if (e.target.closest('[data-qty-down]')) {
      var cur2 = parseInt(line.querySelector('[data-qty] .lbp-qty__n').textContent, 10) || 1;
      changeLine(key, Math.max(0, cur2 - 1));
    }
  });

  /* ---------- Cart page: local qty steppers before submit ---------- */
  document.querySelectorAll('.lbp-carttable [data-qty]').forEach(function (qtyEl) {
    var input = qtyEl.querySelector('input[type="number"]');
    if (!input) return;
    qtyEl.querySelector('[data-qty-up]').addEventListener('click', function () {
      input.value = (parseInt(input.value, 10) || 0) + 1;
    });
    qtyEl.querySelector('[data-qty-down]').addEventListener('click', function () {
      input.value = Math.max(0, (parseInt(input.value, 10) || 0) - 1);
    });
  });

  /* ---------- Quick add from product cards ---------- */
  document.addEventListener('click', function (e) {
    var q = e.target.closest('[data-quick-add]');
    if (!q) return;
    e.preventDefault();
    var url = q.getAttribute('data-product-url');
    var label = q.textContent;
    q.disabled = true; q.textContent = 'Checking…';
    fetch(url + '.js').then(function (r) { return r.json(); }).then(function (product) {
      if (product.variants.length === 1) {
        addToCart(product.variants[0].id, 1, function () {
          q.disabled = false; q.textContent = label;
        });
      } else {
        window.location.href = url + '#sizes';
      }
    }).catch(function () {
      window.location.href = url;
    });
  });

  /* ---------- Product page: gallery, size select, add to bag ---------- */
  var thumbs = document.querySelectorAll('.lbp-thumb');
  var main = document.getElementById('pdp-main');
  if (thumbs.length && main) {
    thumbs.forEach(function (t) {
      t.addEventListener('click', function () {
        thumbs.forEach(function (x) { x.classList.remove('is-on'); });
        t.classList.add('is-on');
        main.src = t.getAttribute('data-full');
      });
    });
  }

  var sizes = document.getElementById('sizes');
  var sizenote = document.getElementById('sizenote');
  var chosenVariant = null;
  var singleVariantInput = document.getElementById('single-variant-id');
  if (singleVariantInput) chosenVariant = singleVariantInput.value;

  if (sizes) {
    sizes.addEventListener('click', function (e) {
      var b = e.target.closest('.lbp-size');
      if (!b || b.disabled) return;
      sizes.querySelectorAll('.lbp-size').forEach(function (x) { x.classList.remove('is-on'); });
      b.classList.add('is-on');
      chosenVariant = b.getAttribute('data-variant-id');
      sizes.classList.remove('is-missing');
      if (sizenote) sizenote.hidden = true;
    });
  }

  function doAdd(btn) {
    if (!chosenVariant) {
      if (sizes) {
        sizes.classList.add('is-missing');
        sizes.scrollIntoView({ behavior: 'smooth', block: 'center' });
        var first = sizes.querySelector('.lbp-size:not([disabled])');
        if (first) first.focus();
      }
      if (sizenote) sizenote.hidden = false;
      return;
    }
    var label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Adding…';
    addToCart(chosenVariant, 1, function () {
      btn.textContent = 'Added';
      setTimeout(function () { btn.disabled = false; btn.textContent = label; }, 1400);
    });
  }
  var addbtn = document.getElementById('addbtn');
  if (addbtn) addbtn.addEventListener('click', function () { doAdd(this); });
  document.querySelectorAll('[data-addproxy]').forEach(function (b) {
    b.addEventListener('click', function () { doAdd(this); });
  });

  /* Sticky buy bar once the real button scrolls away */
  var stickybuy = document.getElementById('stickybuy');
  if (addbtn && stickybuy && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      stickybuy.classList.toggle('is-up', !es[0].isIntersecting);
    }, { threshold: 0 }).observe(addbtn);
  }

  /* ---------- Accordions ---------- */
  document.querySelectorAll('.lbp-acc__btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', String(!open));
      b.nextElementSibling.classList.toggle('is-open', !open);
    });
  });

  /* ---------- Collection facets ---------- */
  var grid = document.getElementById('grid');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.children);

    /* Landing from a nav item or homepage tile (?gender=Girls, ?occasion=Christening)
       narrows the working set before facets are built from it — this is a fixed
       entry filter, not a togglable facet, so it doesn't clutter the sidebar. */
    var entryParams = new URLSearchParams(window.location.search);
    var entryGender = entryParams.get('gender');
    var entryOccasion = entryParams.get('occasion');
    if (entryGender || entryOccasion) {
      var kept = cards.filter(function (c) {
        var ok = true;
        if (entryGender) {
          /* comma-separated = AND, e.g. gender=Baby,Girls for "Baby Girls" */
          var wanted = entryGender.split(',');
          var have = (c.getAttribute('data-gender') || '').split('|');
          ok = ok && wanted.every(function (w) { return have.indexOf(w) > -1; });
        }
        if (entryOccasion) ok = ok && (c.getAttribute('data-occasion') || '').split('|').indexOf(entryOccasion) > -1;
        return ok;
      });
      cards.forEach(function (c) { if (kept.indexOf(c) === -1) c.remove(); });
      cards = kept;
      var heading = document.querySelector('.lbp-collhead__title');
      var occasionLabel = { Christening: 'Christening', Communion: 'Communion', Occasion: 'Occasion Wear' };
      var genderLabel = entryGender ? entryGender.split(',').join(' ') : '';
      if (heading) heading.textContent = genderLabel || occasionLabel[entryOccasion] || entryOccasion;
    }

    var chips = document.getElementById('chips');
    var none = document.getElementById('noresults');
    var facetsDesktop = document.getElementById('facets');
    var facetsMobile = document.getElementById('facets-mobile');

    var FACETS = [
      { key: 'brand', title: 'Designer', attr: 'brand', multi: false },
      { key: 'type', title: 'Category', attr: 'type', multi: true },
      { key: 'sizes', title: 'Size', attr: 'sizes', multi: true },
      { key: 'ages', title: 'Age', attr: 'ages', multi: true },
      { key: 'colour', title: 'Colour', attr: 'colour', multi: false },
      { key: 'pband', title: 'Price', attr: 'pband', multi: false },
      { key: 'stock', title: 'Availability', attr: 'stock', multi: false }
    ];
    var AGE_ORDER = ['Newborn – 2 years', '2 – 5 years', '5 – 8 years', '8 years +'];
    var SIZE_ORDER = ['0–3 Months', '3–6 Months', '6–12 Months', '12–18 Months', '18–24 Months',
      '2–3 Years', '3–4 Years', '4–5 Years', '5–6 Years', '6–7 Years', '7–8 Years', '8–9 Years', '9–10 Years', '10+ Years'];
    var STOCK_LABEL = { 'in': 'In stock', out: 'Out of stock' };

    function buildFacetValues(facet) {
      var counts = {};
      cards.forEach(function (c) {
        var raw = c.getAttribute('data-' + facet.attr) || '';
        var values = facet.multi ? raw.split('|').filter(Boolean) : [raw].filter(Boolean);
        values.forEach(function (v) { counts[v] = (counts[v] || 0) + 1; });
      });
      var values = Object.keys(counts);
      if (facet.key === 'ages') {
        values.sort(function (a, b) { return AGE_ORDER.indexOf(a) - AGE_ORDER.indexOf(b); });
      } else if (facet.key === 'sizes') {
        values.sort(function (a, b) { return SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b); });
      } else {
        values.sort(function (a, b) { return counts[b] - counts[a]; });
      }
      return values.map(function (v) { return { value: v, count: counts[v] }; });
    }

    function renderFacetsInto(container) {
      var html = '';
      FACETS.forEach(function (facet) {
        var values = buildFacetValues(facet);
        if (!values.length) return;
        html += '<div class="lbp-facet"><h3 class="lbp-facet__title">' + facet.title + '</h3><div class="lbp-facet__list">';
        values.forEach(function (v) {
          var label = facet.key === 'stock' ? (STOCK_LABEL[v.value] || v.value) : v.value;
          html += '<label class="lbp-check"><input type="checkbox" data-facet="' + facet.key + '" value="' + v.value.replace(/"/g, '&quot;') + '">' +
            '<span class="lbp-check__box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 5 5L19 7"/></svg></span>' +
            label + '<span class="lbp-check__n">' + v.count + '</span></label>';
        });
        html += '</div></div>';
      });
      container.innerHTML = html;
    }
    renderFacetsInto(facetsDesktop);
    if (facetsMobile) facetsMobile.innerHTML = facetsDesktop.innerHTML;

    var state = { ages: [], sizes: [], brand: [], type: [], colour: [], pband: [], stock: [] };

    function sync(key, value, on) {
      document.querySelectorAll('input[data-facet="' + key + '"]').forEach(function (i) {
        if (i.value === value) i.checked = on;
      });
    }
    function labelFor(key, v) { return key === 'stock' ? (STOCK_LABEL[v] || v) : v; }

    function apply() {
      var shown = 0;
      cards.forEach(function (c) {
        var ok = true;
        if (state.ages.length) {
          var a = (c.getAttribute('data-ages') || '').split('|');
          ok = ok && state.ages.some(function (v) { return a.indexOf(v) > -1; });
        }
        if (state.sizes.length) {
          var sz = (c.getAttribute('data-sizes') || '').split('|');
          ok = ok && state.sizes.some(function (v) { return sz.indexOf(v) > -1; });
        }
        if (state.brand.length) ok = ok && state.brand.indexOf(c.getAttribute('data-brand')) > -1;
        if (state.type.length) {
          var ty = (c.getAttribute('data-type') || '').split('|');
          ok = ok && state.type.some(function (v) { return ty.indexOf(v) > -1; });
        }
        if (state.colour.length) ok = ok && state.colour.indexOf(c.getAttribute('data-colour')) > -1;
        if (state.pband.length) ok = ok && state.pband.indexOf(c.getAttribute('data-pband')) > -1;
        if (state.stock.length) ok = ok && state.stock.indexOf(c.getAttribute('data-stock')) > -1;
        c.hidden = !ok;
        if (ok) shown++;
      });
      document.querySelectorAll('[data-count]').forEach(function (n) { n.textContent = String(shown); });
      if (none) none.hidden = shown > 0;

      if (chips) {
        chips.innerHTML = '';
        Object.keys(state).forEach(function (k) {
          state[k].forEach(function (v) {
            var b = document.createElement('button');
            b.className = 'lbp-chip'; b.type = 'button';
            b.innerHTML = labelFor(k, v) + ' <span class="lbp-chip__x" aria-hidden="true">&times;</span>';
            b.setAttribute('aria-label', 'Remove filter ' + labelFor(k, v));
            b.addEventListener('click', function () {
              state[k] = state[k].filter(function (x) { return x !== v; });
              sync(k, v, false);
              apply();
            });
            chips.appendChild(b);
          });
        });
      }
    }

    document.addEventListener('change', function (e) {
      var i = e.target.closest('input[data-facet]');
      if (!i) return;
      var k = i.getAttribute('data-facet'), v = i.value;
      if (i.checked) { if (state[k].indexOf(v) < 0) state[k].push(v); }
      else { state[k] = state[k].filter(function (x) { return x !== v; }); }
      sync(k, v, i.checked);
      apply();
    });

    var clearBtn = document.getElementById('clearall');
    if (clearBtn) clearBtn.addEventListener('click', function () {
      Object.keys(state).forEach(function (k) { state[k] = []; });
      document.querySelectorAll('input[data-facet]').forEach(function (i) { i.checked = false; });
      apply();
    });

    var sortSel = document.getElementById('sort');
    function applySort(v) {
      var s = cards.slice();
      if (v === 'new') s.sort(function (a, b) { return b.dataset.created - a.dataset.created; });
      if (v === 'low') s.sort(function (a, b) { return a.dataset.price - b.dataset.price; });
      if (v === 'high') s.sort(function (a, b) { return b.dataset.price - a.dataset.price; });
      if (v === 'az') s.sort(function (a, b) {
        return a.querySelector('.lbp-card__name').textContent.trim()
          .localeCompare(b.querySelector('.lbp-card__name').textContent.trim());
      });
      s.forEach(function (c) { grid.appendChild(c); });
    }
    if (sortSel) sortSel.addEventListener('change', function () { applySort(this.value); });

    /* Preselect from ?brand= / ?age= query params (mega menu, homepage links) */
    var params = new URLSearchParams(window.location.search);
    var ageMap = {
      Newborn: 'Newborn – 2 years',
      '2-5': '2 – 5 years',
      '5-8': '5 – 8 years',
      '8plus': '8 years +'
    };
    if (params.get('brand')) {
      var brandVal = params.get('brand');
      state.brand.push(brandVal);
      sync('brand', brandVal, true);
    }
    if (params.get('type')) {
      var typeVal = params.get('type');
      state.type.push(typeVal);
      sync('type', typeVal, true);
    }
    if (params.get('age') && ageMap[params.get('age')]) {
      var ageVal = ageMap[params.get('age')];
      state.ages.push(ageVal);
      sync('ages', ageVal, true);
    }
    if (params.get('sort') === 'new' && sortSel) {
      sortSel.value = 'new';
      applySort('new');
    }

    apply();
  }
})();
