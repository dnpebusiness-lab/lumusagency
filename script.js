/* ===================================================
   LUMUS — AI Automation Agency
   Animations & Interactions
   =================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── FOOTER YEAR ── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── NAV: scroll-aware + mobile toggle ── */
  (function initNav() {
    const nav = document.getElementById('nav');
    const toggle = nav ? nav.querySelector('.nav__toggle') : null;
    const mobile = document.getElementById('navMobile');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > 40) nav.classList.add('nav--scrolled');
      else nav.classList.remove('nav--scrolled');
      lastScroll = y;
    }, { passive: true });

    if (toggle && mobile) {
      toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        mobile.setAttribute('aria-hidden', String(expanded));
        mobile.classList.toggle('nav__mobile--open', !expanded);
      });
      mobile.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          toggle.setAttribute('aria-expanded', 'false');
          mobile.setAttribute('aria-hidden', 'true');
          mobile.classList.remove('nav__mobile--open');
        });
      });
    }
  })();

  /* ── INTERSECTION OBSERVER: reveal on scroll ── */
  (function initReveal() {
    if (prefersReducedMotion) {
      document.querySelectorAll('.reveal-item').forEach(el => {
        el.classList.add('is-visible');
      });
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal-item').forEach(el => observer.observe(el));
  })();

  /* ── HERO ENTRANCE: stagger headline lines ── */
  (function initHeroEntrance() {
    const items = document.querySelectorAll('.hero .reveal-item');
    if (prefersReducedMotion) return;
    items.forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.1}s`;
      setTimeout(() => el.classList.add('is-visible'), 100 + i * 100);
    });
  })();

  /* ── WORKFLOW VISUAL: SVG connector lines ── */
  (function initWorkflow() {
    const svg = document.getElementById('workflowSVG');
    const workflow = document.getElementById('workflow');
    if (!svg || !workflow) return;

    function getCenter(el, parent) {
      const eRect = el.getBoundingClientRect();
      const pRect = parent.getBoundingClientRect();
      return {
        x: eRect.left + eRect.width / 2 - pRect.left,
        y: eRect.top + eRect.height / 2 - pRect.top,
      };
    }

    function buildLines() {
      svg.innerHTML = '';
      const core = document.getElementById('wfCore');
      if (!core) return;
      const coreC = getCenter(core, workflow);

      const inputs = ['wfIn0', 'wfIn1', 'wfIn2'];
      const outputs = ['wfOut0', 'wfOut1', 'wfOut2'];
      const pairs = [
        { from: inputs, to: outputs },
      ];

      inputs.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        const c = getCenter(el, workflow);
        const path = createAnimatedPath(c.x, c.y, coreC.x, coreC.y, i * 0.4, false);
        svg.appendChild(path);
      });

      outputs.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        const c = getCenter(el, workflow);
        const path = createAnimatedPath(coreC.x, coreC.y, c.x, c.y, i * 0.4 + 0.2, true);
        svg.appendChild(path);
      });
    }

    function createAnimatedPath(x1, y1, x2, y2, delay, isOutput) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      const cpX = (x1 + x2) / 2;
      const d = `M ${x1} ${y1} Q ${cpX} ${y1} ${x2} ${y2}`;

      // Static base line
      const base = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      base.setAttribute('d', d);
      base.setAttribute('fill', 'none');
      base.setAttribute('stroke', 'rgba(79,110,247,0.12)');
      base.setAttribute('stroke-width', '1');

      // Animated flowing dot line
      const flow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      flow.setAttribute('d', d);
      flow.setAttribute('fill', 'none');
      flow.setAttribute('stroke', isOutput ? 'rgba(74,222,128,0.6)' : 'rgba(79,110,247,0.6)');
      flow.setAttribute('stroke-width', '1.5');
      flow.setAttribute('stroke-linecap', 'round');

      const len = 120;
      flow.setAttribute('stroke-dasharray', `8 ${len}`);
      flow.setAttribute('stroke-dashoffset', `${len + 8}`);

      if (!prefersReducedMotion) {
        const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        anim.setAttribute('attributeName', 'stroke-dashoffset');
        anim.setAttribute('values', `${len + 8};${-(len + 8)}`);
        anim.setAttribute('dur', `${isOutput ? 1.8 : 2}s`);
        anim.setAttribute('begin', `${delay}s`);
        anim.setAttribute('repeatCount', 'indefinite');
        anim.setAttribute('calcMode', 'linear');
        flow.appendChild(anim);
      }

      g.appendChild(base);
      g.appendChild(flow);
      return g;
    }

    buildLines();
    window.addEventListener('resize', debounce(buildLines, 200));
  })();

  /* ── WORKFLOW STATUS CYCLING ── */
  (function initStatusCycle() {
    if (prefersReducedMotion) return;
    const statuses = [
      { el: document.querySelector('#wfIn0 .wf-card__status'), values: ['Manual', 'Processing', 'Manual'], classes: ['wf-card__status--manual', 'wf-card__status--pending', 'wf-card__status--manual'] },
      { el: document.querySelector('#wfIn1 .wf-card__status'), values: ['Manual', 'Processing', 'Manual'], classes: ['wf-card__status--manual', 'wf-card__status--pending', 'wf-card__status--manual'] },
      { el: document.querySelector('#wfIn2 .wf-card__status'), values: ['Pending', 'Processing', 'Pending'], classes: ['wf-card__status--pending', 'wf-card__status--pending', 'wf-card__status--pending'] },
    ];

    function cycle(item, step) {
      if (!item.el) return;
      const i = step % item.values.length;
      item.el.textContent = item.values[i];
      item.el.className = `wf-card__status ${item.classes[i]}`;
    }

    let step = 0;
    setInterval(() => {
      step++;
      statuses.forEach(item => cycle(item, step));
    }, 2200);
  })();

  /* ── PROCESS TIMELINE: fill on scroll ── */
  (function initProcessTimeline() {
    const wrap = document.getElementById('processWrap');
    const fill = document.getElementById('processTrackFill');
    const steps = document.querySelectorAll('.process__step');
    if (!wrap || !fill || prefersReducedMotion) return;

    const stepObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('step--active');
        }
      });
    }, { threshold: 0.5 });

    steps.forEach(step => stepObs.observe(step));

    const trackObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const rect = entry.boundingClientRect;
        const viewH = window.innerHeight;
        const progress = Math.min(1, Math.max(0, (viewH - rect.top) / (rect.height + viewH)));
        fill.style.height = `${Math.round(progress * 100)}%`;
      });
    }, { threshold: Array.from({ length: 101 }, (_, i) => i / 100) });

    trackObs.observe(wrap);

    window.addEventListener('scroll', () => {
      const rect = wrap.getBoundingClientRect();
      const viewH = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (viewH - rect.top) / rect.height));
      fill.style.height = `${Math.round(progress * 100)}%`;

      steps.forEach((step, i) => {
        const threshold = i / steps.length;
        if (progress >= threshold + 0.15) {
          step.classList.add('step--active');
        }
      });
    }, { passive: true });
  })();

  /* ── FAQ ACCORDION ── */
  (function initFAQ() {
    document.querySelectorAll('.faq-item__q').forEach(btn => {
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        const answer = btn.nextElementSibling;

        // Close all others
        document.querySelectorAll('.faq-item__q').forEach(other => {
          if (other !== btn) {
            other.setAttribute('aria-expanded', 'false');
            const otherA = other.nextElementSibling;
            if (otherA) {
              otherA.setAttribute('aria-hidden', 'true');
              otherA.style.maxHeight = null;
            }
          }
        });

        btn.setAttribute('aria-expanded', String(!expanded));
        if (answer) {
          answer.setAttribute('aria-hidden', String(expanded));
          if (!expanded) {
            answer.style.maxHeight = answer.scrollHeight + 'px';
          } else {
            answer.style.maxHeight = null;
          }
        }
      });
    });
  })();

  /* ── CTA BUTTON SWEEP EFFECT ── */
  (function initButtonEffects() {
    if (prefersReducedMotion) return;
    document.querySelectorAll('.btn--primary').forEach(btn => {
      btn.addEventListener('mouseenter', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        btn.style.setProperty('--sweep-x', `${x}px`);
        btn.style.setProperty('--sweep-y', `${y}px`);
      });
    });
  })();

  /* ── SMOOTH ANCHOR SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  /* ── UTILITY: debounce ── */
  function debounce(fn, delay) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }

})();
