(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── YEAR ─────────────────────────────────────── */
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ─── NEURAL CANVAS ─────────────────────────────── */
  (function initCanvas() {
    if (reduced) return;
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, nodes, raf;

    const COUNT  = 55;
    const RADIUS = 145;
    const SPEED  = 0.28;
    const COLOR  = '67,97,238';

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function makeNodes() {
      nodes = Array.from({ length: COUNT }, () => ({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        r:  Math.random() * 1.5 + 0.8,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < RADIUS) {
            const a = (1 - d / RADIUS) * 0.14;
            ctx.strokeStyle = `rgba(${COLOR},${a})`;
            ctx.lineWidth   = 0.8;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      nodes.forEach(n => {
        ctx.fillStyle = `rgba(${COLOR},0.45)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();

        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });

      raf = requestAnimationFrame(draw);
    }

    resize();
    makeNodes();
    draw();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resize(); makeNodes(); }, 200);
    }, { passive: true });
  })();

  /* ─── NAV ───────────────────────────────────────── */
  (function initNav() {
    const nav    = document.getElementById('nav');
    const toggle = nav?.querySelector('.nav__toggle');
    const mobile = document.getElementById('navMobile');

    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    if (toggle && mobile) {
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!open));
        mobile.setAttribute('aria-hidden', String(open));
        mobile.classList.toggle('open', !open);
      });
      mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        mobile.setAttribute('aria-hidden', 'true');
        mobile.classList.remove('open');
      }));
    }
  })();

  /* ─── HERO ENTRANCE ─────────────────────────────── */
  (function initHeroEntrance() {
    // Line-by-line headline reveal
    const lines  = document.querySelectorAll('.line-inner');
    const kicker = document.querySelector('.hero__kicker');
    const sub    = document.querySelector('.hero__sub');
    const ctas   = document.querySelector('.hero__ctas');

    if (reduced) {
      lines.forEach(l => l.classList.add('revealed'));
      [kicker, sub, ctas].forEach(el => el && el.classList.add('visible'));
      return;
    }

    // Kicker first
    setTimeout(() => kicker && kicker.classList.add('visible'), 120);

    // Headline lines staggered
    lines.forEach((line, i) => {
      setTimeout(() => line.classList.add('revealed'), 220 + i * 130);
    });

    // Sub + CTAs after headline
    const totalLineDelay = 220 + lines.length * 130;
    setTimeout(() => sub  && sub.classList.add('visible'),  totalLineDelay + 80);
    setTimeout(() => ctas && ctas.classList.add('visible'), totalLineDelay + 200);
  })();

  /* ─── SCROLL REVEAL ─────────────────────────────── */
  (function initReveal() {
    const items = document.querySelectorAll('.js-reveal-item');
    if (reduced) { items.forEach(el => el.classList.add('visible')); return; }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    items.forEach(el => obs.observe(el));
  })();

  /* ─── WORKFLOW SVG LINES + DATA PACKETS ─────────── */
  (function initWorkflow() {
    const svg      = document.getElementById('workflowSVG');
    const wrap     = document.getElementById('workflow');
    if (!svg || !wrap) return;

    function centre(id) {
      const el = document.getElementById(id);
      if (!el) return null;
      const er = el.getBoundingClientRect();
      const wr = wrap.getBoundingClientRect();
      return { x: er.left + er.width / 2 - wr.left, y: er.top + er.height / 2 - wr.top };
    }

    function buildLine(x1, y1, x2, y2, idx, outgoing) {
      const g   = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const cpx = (x1 + x2) / 2;
      const d   = `M${x1},${y1} Q${cpx},${y1} ${x2},${y2}`;
      const col = outgoing ? '34,197,94' : '67,97,238';

      // Base rail
      const rail = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      rail.setAttribute('d', d);
      rail.setAttribute('fill', 'none');
      rail.setAttribute('stroke', `rgba(${col},0.1)`);
      rail.setAttribute('stroke-width', '1');
      g.appendChild(rail);

      if (reduced) { svg.appendChild(g); return; }

      // Flowing packet — 3 per line at offsets
      [0, 0.33, 0.66].forEach((offset, pi) => {
        const pkt = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pkt.setAttribute('r', '2.5');
        pkt.setAttribute('fill', `rgba(${col},0.9)`);
        pkt.setAttribute('filter', `drop-shadow(0 0 3px rgba(${col},0.8))`);

        const mot = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
        mot.setAttribute('path', d);
        mot.setAttribute('dur',  `${outgoing ? 1.6 : 2.0}s`);
        mot.setAttribute('begin', `${idx * 0.4 + offset * (outgoing ? 1.6 : 2.0)}s`);
        mot.setAttribute('repeatCount', 'indefinite');
        mot.setAttribute('calcMode', 'linear');
        pkt.appendChild(mot);
        g.appendChild(pkt);
      });

      svg.appendChild(g);
    }

    function build() {
      svg.innerHTML = '';
      const core = centre('wfCore');
      if (!core) return;
      ['wfIn0','wfIn1','wfIn2'].forEach((id, i) => {
        const c = centre(id); if (!c) return;
        buildLine(c.x, c.y, core.x, core.y, i, false);
      });
      ['wfOut0','wfOut1','wfOut2'].forEach((id, i) => {
        const c = centre(id); if (!c) return;
        buildLine(core.x, core.y, c.x, c.y, i, true);
      });
    }

    build();
    window.addEventListener('resize', debounce(build, 220), { passive: true });
  })();

  /* ─── BADGE STATUS CYCLE ────────────────────────── */
  (function initBadgeCycle() {
    if (reduced) return;
    const badges = [
      { id: 'wfIn0', states: [['Manual','wf-card__badge--manual'],['Processing','wf-card__badge--pending']] },
      { id: 'wfIn1', states: [['Manual','wf-card__badge--manual'],['Processing','wf-card__badge--pending']] },
      { id: 'wfIn2', states: [['Pending','wf-card__badge--pending'],['Processing','wf-card__badge--pending']] },
    ];
    let step = 0;
    setInterval(() => {
      step++;
      badges.forEach(({ id, states }) => {
        const el = document.querySelector(`#${id} .wf-card__badge`);
        if (!el) return;
        const [text, cls] = states[step % states.length];
        el.textContent = text;
        el.className   = `wf-card__badge ${cls}`;
      });
    }, 2000);
  })();

  /* ─── PROCESS TIMELINE ──────────────────────────── */
  (function initTimeline() {
    const wrap  = document.getElementById('processWrap');
    const fill  = document.getElementById('processTrackFill');
    const steps = document.querySelectorAll('.process__step');
    if (!wrap || !fill || reduced) return;

    function update() {
      const wr = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (vh - wr.top) / wr.height));
      fill.style.height = `${progress * 100}%`;
      steps.forEach((s, i) => {
        if (progress >= i / steps.length + 0.1) s.classList.add('active');
      });
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  })();

  /* ─── 3D CARD TILT ──────────────────────────────── */
  (function initTilt() {
    if (reduced || window.matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('.js-tilt').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const x  = e.clientX - r.left - r.width  / 2;
        const y  = e.clientY - r.top  - r.height / 2;
        const rX = -(y / r.height) * 9;
        const rY =  (x / r.width)  * 9;
        card.style.transform = `perspective(700px) rotateX(${rX}deg) rotateY(${rY}deg) translateZ(6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  })();

  /* ─── MAGNETIC BUTTONS ──────────────────────────── */
  (function initMagnetic() {
    if (reduced || window.matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('.js-magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r  = btn.getBoundingClientRect();
        const x  = e.clientX - r.left - r.width  / 2;
        const y  = e.clientY - r.top  - r.height / 2;
        btn.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px) translateY(-2px)`;
        btn.style.boxShadow = `0 12px 40px rgba(67,97,238,0.45)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.boxShadow = '';
      });
    });
  })();

  /* ─── FAQ ACCORDION ─────────────────────────────── */
  (function initFAQ() {
    document.querySelectorAll('.faq-item__q').forEach(btn => {
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        // Close all
        document.querySelectorAll('.faq-item__q').forEach(b => {
          b.setAttribute('aria-expanded', 'false');
          const a = b.nextElementSibling;
          if (a) { a.setAttribute('aria-hidden', 'true'); a.style.maxHeight = null; }
        });
        if (!open) {
          btn.setAttribute('aria-expanded', 'true');
          const ans = btn.nextElementSibling;
          if (ans) { ans.setAttribute('aria-hidden', 'false'); ans.style.maxHeight = ans.scrollHeight + 'px'; }
        }
      });
    });
  })();

  /* ─── SMOOTH ANCHOR SCROLL ──────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id  = a.getAttribute('href').slice(1);
      if (!id) return;
      const el  = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ─── SECTION SPOTLIGHT on scroll ──────────────── */
  (function initSectionFade() {
    if (reduced) return;
    const sections = document.querySelectorAll('.section');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        e.target.style.opacity = e.isIntersecting ? '1' : '';
      });
    }, { threshold: 0.05 });
    sections.forEach(s => obs.observe(s));
  })();

  /* ─── UTILITY ───────────────────────────────────── */
  function debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }

})();
