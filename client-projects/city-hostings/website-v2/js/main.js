/* City Hosting — main.js */

(function () {
  'use strict';

  /* ─── Header scroll state ─── */
  const hdr = document.querySelector('.site-header');
  if (hdr) {
    const onScroll = () => {
      hdr.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ─── Mobile nav ─── */
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.nav-drawer');
  const overlay = document.querySelector('.nav-overlay');

  function openNav() {
    drawer && drawer.classList.add('is-open');
    overlay && overlay.classList.add('is-visible');
    toggle && toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    drawer && drawer.classList.remove('is-open');
    overlay && overlay.classList.remove('is-visible');
    toggle && toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle && toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    expanded ? closeNav() : openNav();
  });

  overlay && overlay.addEventListener('click', closeNav);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeNav();
  });

  // Close drawer on nav link click
  document.querySelectorAll('.nav-drawer a').forEach(a => {
    a.addEventListener('click', closeNav);
  });

  /* ─── Accordion (FAQ & services) ─── */
  document.querySelectorAll('.accordion-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.accordion-item');
      const panel = item && item.querySelector('.accordion-panel');
      const expanded = btn.getAttribute('aria-expanded') === 'true';

      // Close siblings
      const parent = btn.closest('.accordion');
      if (parent) {
        parent.querySelectorAll('.accordion-trigger').forEach(b => {
          if (b !== btn) {
            b.setAttribute('aria-expanded', 'false');
            const p = b.closest('.accordion-item');
            p && p.querySelector('.accordion-panel')?.removeAttribute('style');
          }
        });
      }

      if (expanded) {
        btn.setAttribute('aria-expanded', 'false');
        panel && panel.removeAttribute('style');
      } else {
        btn.setAttribute('aria-expanded', 'true');
        if (panel) {
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      }
    });
  });

  /* ─── Scroll reveals ─── */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

      reveals.forEach(el => io.observe(el));
    }
  } else {
    // Immediately show all reveals for reduced-motion users
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
  }

  /* ─── Property rendering ─── */
  const grid = document.querySelector('[data-property-grid]');
  if (grid && typeof CITY_HOSTING !== 'undefined') {
    const props = CITY_HOSTING.properties;
    if (!props || props.length === 0) {
      grid.innerHTML = `<p class="stays__empty">Properties coming soon. <a href="mailto:${CITY_HOSTING.contact.email}">Contact us</a> to check availability.</p>`;
    } else {
      grid.innerHTML = props.map(p => `
        <article class="prop-card">
          <a href="property.html?id=${p.id}" class="prop-card__img-link" aria-label="View ${p.name}">
            <div class="prop-card__img photo-slot" data-label="${p.name}">
              ${p.photos && p.photos[0] ? `<img src="${p.photos[0]}" alt="${p.name}" loading="lazy" width="800" height="600">` : ''}
            </div>
          </a>
          <div class="prop-card__body">
            <p class="prop-card__meta">${p.location} &middot; ${p.guests} guests</p>
            <h3 class="prop-card__name"><a href="property.html?id=${p.id}">${p.name}</a></h3>
            ${p.summary ? `<p class="prop-card__summary">${p.summary}</p>` : ''}
            <a href="${p.bookingUrl || 'book-direct.html'}" class="btn btn--warm" target="${p.bookingUrl ? '_blank' : '_self'}" rel="${p.bookingUrl ? 'noopener noreferrer' : ''}">Check availability</a>
          </div>
        </article>
      `).join('');
    }
  }

  /* ─── Property detail page ─── */
  const detailRoot = document.querySelector('[data-property-detail]');
  if (detailRoot && typeof CITY_HOSTING !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const prop = id && CITY_HOSTING.properties.find(p => p.id === id);

    if (prop) {
      const title = detailRoot.querySelector('[data-prop-name]');
      const bookBtn = detailRoot.querySelector('[data-prop-book]');
      if (title) title.textContent = prop.name;
      if (bookBtn && prop.bookingUrl) {
        bookBtn.href = prop.bookingUrl;
        bookBtn.target = '_blank';
        bookBtn.rel = 'noopener noreferrer';
      }
    }
  }

  /* ─── Contact phone links (populate from config) ─── */
  if (typeof CITY_HOSTING !== 'undefined') {
    document.querySelectorAll('[data-phone]').forEach(el => {
      el.href = CITY_HOSTING.contact.phoneTel;
      el.textContent = CITY_HOSTING.contact.phone;
    });
    document.querySelectorAll('[data-phone-intl]').forEach(el => {
      el.href = CITY_HOSTING.contact.phoneTel;
      el.textContent = CITY_HOSTING.contact.phoneIntl;
    });
    document.querySelectorAll('[data-email]').forEach(el => {
      el.href = CITY_HOSTING.contact.emailHref;
      el.textContent = CITY_HOSTING.contact.email;
    });
  }

  /* ─── Enquiry form — owner tab switching ─── */
  document.querySelectorAll('[data-form-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.formTab;
      document.querySelectorAll('[data-form-tab]').forEach(t => {
        t.classList.toggle('is-active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });
      document.querySelectorAll('[data-form-panel]').forEach(panel => {
        panel.hidden = panel.dataset.formPanel !== target;
      });
    });
  });

  /* ─── Form: basic client-side validation ─── */
  document.querySelectorAll('form[data-validate]').forEach(form => {
    form.addEventListener('submit', e => {
      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        const wrapper = field.closest('.field');
        const err = wrapper && wrapper.querySelector('.field-error');
        if (!field.value.trim()) {
          valid = false;
          field.setAttribute('aria-invalid', 'true');
          if (err) {
            err.textContent = field.dataset.errorMsg || 'This field is required.';
            err.hidden = false;
          }
        } else {
          field.removeAttribute('aria-invalid');
          if (err) err.hidden = true;
        }
      });
      if (!valid) {
        e.preventDefault();
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        firstInvalid && firstInvalid.focus();
      }
    });

    // Clear error on input
    form.querySelectorAll('[required]').forEach(field => {
      field.addEventListener('input', () => {
        const wrapper = field.closest('.field');
        const err = wrapper && wrapper.querySelector('.field-error');
        field.removeAttribute('aria-invalid');
        if (err) err.hidden = true;
      });
    });
  });

  /* ─── GA4 ─── */
  if (typeof CITY_HOSTING !== 'undefined' && CITY_HOSTING.analytics.ga4) {
    const s = document.createElement('script');
    s.src = `https://www.googletagmanager.com/gtag/js?id=${CITY_HOSTING.analytics.ga4}`;
    s.async = true;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', CITY_HOSTING.analytics.ga4);
  }

})();
