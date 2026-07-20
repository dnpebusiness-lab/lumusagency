/* City Hosting — main.js */

(function () {
  'use strict';

  /* ─── Sticky header via IntersectionObserver ─── */
  const hdr = document.querySelector('.site-header');
  if (hdr) {
    if ('IntersectionObserver' in window) {
      const sentinel = document.createElement('div');
      sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;pointer-events:none;';
      document.body.insertBefore(sentinel, document.body.firstChild);
      new IntersectionObserver(
        ([e]) => hdr.classList.toggle('is-scrolled', !e.isIntersecting),
        { threshold: 0, rootMargin: '40px 0px 0px 0px' }
      ).observe(sentinel);
    } else {
      window.addEventListener('scroll', () => {
        hdr.classList.toggle('is-scrolled', window.scrollY > 40);
      }, { passive: true });
    }
  }

  /* ─── Mobile nav ─── */
  const toggles   = document.querySelectorAll('.nav-toggle');
  const drawer    = document.querySelector('.nav-drawer');
  const overlay   = document.querySelector('.nav-overlay');
  const mainEl    = document.getElementById('main-content');
  var   lastFocus = null;

  function getFocusables() {
    if (!drawer) return [];
    return [].slice.call(drawer.querySelectorAll('a, button, [tabindex="0"]')).filter(function (el) {
      return !el.disabled && !el.closest('[hidden]');
    });
  }

  function openNav() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.classList.add('is-open');
    drawer.removeAttribute('aria-hidden');
    if (overlay) overlay.classList.add('is-visible');
    if (mainEl)  mainEl.setAttribute('inert', '');
    document.body.style.overflow = 'hidden';
    toggles.forEach(function (t) { t.setAttribute('aria-expanded', 'true'); });
    requestAnimationFrame(function () {
      var first = getFocusables()[0];
      if (first) first.focus({ preventScroll: true });
    });
  }

  function closeNav() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (overlay) overlay.classList.remove('is-visible');
    if (mainEl)  mainEl.removeAttribute('inert');
    document.body.style.overflow = '';
    toggles.forEach(function (t) { t.setAttribute('aria-expanded', 'false'); });
    if (lastFocus) { lastFocus.focus({ preventScroll: true }); lastFocus = null; }
  }

  if (drawer) {
    drawer.setAttribute('aria-hidden', 'true');

    toggles.forEach(function (t) {
      t.addEventListener('click', function () {
        drawer.classList.contains('is-open') ? closeNav() : openNav();
      });
    });

    if (overlay) overlay.addEventListener('click', closeNav);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeNav();
    });

    /* Focus trap */
    drawer.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var focusables = getFocusables();
      if (!focusables.length) return;
      var first = focusables[0];
      var last  = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });

    /* Close on link click */
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });
  }

  /* ─── Accordion ─── */
  document.querySelectorAll('.accordion-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item     = btn.closest('.accordion-item');
      var panel    = item && item.querySelector('.accordion-panel');
      var expanded = btn.getAttribute('aria-expanded') === 'true';

      /* Close siblings */
      var parent = btn.closest('.accordion');
      if (parent) {
        parent.querySelectorAll('.accordion-trigger').forEach(function (b) {
          if (b === btn) return;
          b.setAttribute('aria-expanded', 'false');
          var sib = b.closest('.accordion-item');
          var p   = sib && sib.querySelector('.accordion-panel');
          if (p) p.style.maxHeight = '';
        });
      }

      if (expanded) {
        btn.setAttribute('aria-expanded', 'false');
        if (panel) panel.style.maxHeight = '';
      } else {
        btn.setAttribute('aria-expanded', 'true');
        if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ─── Scroll reveals ─── */
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
  } else if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ─── Property grid ─── */
  var grid = document.querySelector('[data-property-grid]');
  if (grid && typeof CITY_HOSTING !== 'undefined') {
    var props = CITY_HOSTING.properties;
    if (!props || props.length === 0) {
      grid.innerHTML = '<p class="stays__empty">Properties coming soon. <a href="contact.html">Get in touch</a> to check availability.</p>';
    } else {
      grid.innerHTML = props.map(function (p) {
        return '<article class="prop-card">' +
          '<a href="property.html?id=' + p.id + '" class="prop-card__img-link" aria-label="View ' + p.name + '">' +
          '<div class="prop-card__img photo-slot">' +
          (p.photos && p.photos[0] ? '<img src="' + p.photos[0] + '" alt="' + p.name + '" loading="lazy" width="800" height="600">' : '') +
          '</div></a>' +
          '<div class="prop-card__body">' +
          '<p class="prop-card__meta">' + p.location + ' &middot; ' + p.guests + ' guests</p>' +
          '<h3 class="prop-card__name"><a href="property.html?id=' + p.id + '">' + p.name + '</a></h3>' +
          (p.summary ? '<p class="prop-card__summary">' + p.summary + '</p>' : '') +
          '<a href="' + (p.bookingUrl || 'book-direct.html') + '" class="btn btn--warm"' +
          (p.bookingUrl ? ' target="_blank" rel="noopener noreferrer"' : '') + '>Check availability</a>' +
          '</div></article>';
      }).join('');
    }
  }

  /* ─── Property detail page ─── */
  var detailRoot = document.querySelector('[data-property-detail]');
  if (detailRoot && typeof CITY_HOSTING !== 'undefined') {
    var params = new URLSearchParams(window.location.search);
    var id     = params.get('id');
    var prop   = id && CITY_HOSTING.properties.find(function (p) { return p.id === id; });
    if (prop) {
      detailRoot.querySelectorAll('[data-prop-name]').forEach(function (el) { el.textContent = prop.name; });
      var bookBtn = detailRoot.querySelector('[data-prop-book]');
      if (bookBtn && prop.bookingUrl) {
        bookBtn.href   = prop.bookingUrl;
        bookBtn.target = '_blank';
        bookBtn.rel    = 'noopener noreferrer';
      }
    }
  }

  /* ─── Contact links from config ─── */
  if (typeof CITY_HOSTING !== 'undefined') {
    document.querySelectorAll('[data-phone]').forEach(function (el) {
      el.href = CITY_HOSTING.contact.phoneTel;
      el.textContent = CITY_HOSTING.contact.phone;
    });
    document.querySelectorAll('[data-phone-intl]').forEach(function (el) {
      el.href = CITY_HOSTING.contact.phoneTel;
      el.textContent = CITY_HOSTING.contact.phoneIntl;
    });
    document.querySelectorAll('[data-email]').forEach(function (el) {
      el.href = CITY_HOSTING.contact.emailHref;
      el.textContent = CITY_HOSTING.contact.email;
    });
  }

  /* ─── Enquiry form tabs ─── */
  document.querySelectorAll('[data-form-tab]').forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.dataset.formTab;
      document.querySelectorAll('[data-form-tab]').forEach(function (t) {
        t.classList.toggle('is-active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });
      document.querySelectorAll('[data-form-panel]').forEach(function (panel) {
        panel.hidden = panel.dataset.formPanel !== target;
      });
    });
  });

  /* ─── Form validation ─── */
  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      var valid = true;
      form.querySelectorAll('[required]').forEach(function (field) {
        var wrapper = field.closest('.field');
        var err     = wrapper && wrapper.querySelector('.field-error');
        if (!field.value.trim()) {
          valid = false;
          field.setAttribute('aria-invalid', 'true');
          if (err) { err.textContent = field.dataset.errorMsg || 'This field is required.'; err.hidden = false; }
        } else {
          field.removeAttribute('aria-invalid');
          if (err) err.hidden = true;
        }
      });
      if (!valid) {
        e.preventDefault();
        var first = form.querySelector('[aria-invalid="true"]');
        if (first) first.focus();
      }
    });
    form.querySelectorAll('[required]').forEach(function (field) {
      field.addEventListener('input', function () {
        var wrapper = field.closest('.field');
        var err     = wrapper && wrapper.querySelector('.field-error');
        field.removeAttribute('aria-invalid');
        if (err) err.hidden = true;
      });
    });
  });

  /* ─── GA4 ─── */
  if (typeof CITY_HOSTING !== 'undefined' && CITY_HOSTING.analytics && CITY_HOSTING.analytics.ga4) {
    var s   = document.createElement('script');
    s.src   = 'https://www.googletagmanager.com/gtag/js?id=' + CITY_HOSTING.analytics.ga4;
    s.async = true;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', CITY_HOSTING.analytics.ga4);
  }

})();
