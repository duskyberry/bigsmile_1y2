/* Listo para mañana · Landing — Big Smile
   Edita CONFIG para cambiar enlaces. El contador siempre marca 28 días y se reinicia al llegar a 27.
   Precios: edítalos directo en index.html (busca "$349 MXN" y "$699 MXN"). */
const CONFIG = {
  ctaUrl: 'https://pay.hotmart.com/R107890588D?checkoutMode=2',
  moreProductsUrl: '#',
  showCountdown: true
};

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Enlaces ---------- */
  $$('a.hotmart-fb').forEach(a => a.href = CONFIG.ctaUrl);
  $$('.lp-more').forEach(a => a.href = CONFIG.moreProductsUrl);

  /* ---------- Contador (siempre 28 días) ---------- */
  const pad = n => String(n).padStart(2, '0');
  const timerBox = $('[data-t="0"]') && $('[data-t="0"]').closest('div[style*="border-radius:20px"]');
  if (timerBox && !CONFIG.showCountdown) timerBox.style.display = 'none';
  const tick = () => {
    const now = Date.now();
    const left = 28 * 864e5 + (864e5 - (now % 864e5)) - 1000;
    const v = [Math.floor(left / 864e5), Math.floor(left / 36e5) % 24, Math.floor(left / 6e4) % 60, Math.floor(left / 1e3) % 60];
    $$('[data-t]').forEach(el => el.textContent = pad(v[+el.dataset.t]));
  };
  tick(); setInterval(tick, 1000);

  /* ---------- Calculadora de tiempo ---------- */
  const range = $('#lp-range');
  const calc = () => {
    const m = +range.value, h = Math.round(m * 0.5 * 190 / 60);
    $('#lp-min').textContent = m; $('#lp-hours').textContent = h; $('#lp-weekends').textContent = Math.max(1, Math.round(h / 16));
  };
  if (range) { range.addEventListener('input', calc); calc(); }

  /* ---------- Acordeones (secciones del toolkit y preguntas) ---------- */
  const groups = {};
  $$('[data-acc]').forEach(b => (groups[b.dataset.acc] = groups[b.dataset.acc] || []).push(b));
  Object.values(groups).forEach(btns => {
    const panel = b => b.nextElementSibling;
    const icon = b => b.lastElementChild;
    let open = btns.findIndex(b => panel(b) && panel(b).style.gridTemplateRows === '1fr');
    const set = () => btns.forEach((b, i) => {
      const on = i === open;
      b.setAttribute('aria-expanded', on);
      if (panel(b)) panel(b).style.gridTemplateRows = on ? '1fr' : '0fr';
      if (icon(b)) icon(b).style.transform = on ? 'rotate(45deg)' : 'none';
    });
    btns.forEach((b, i) => b.addEventListener('click', () => { open = open === i ? -1 : i; set(); }));
    set();
  });

  /* ---------- Hover ---------- */
  $$('[data-hover]').forEach(el => {
    const base = el.getAttribute('style') || '';
    el.addEventListener('mouseenter', () => el.setAttribute('style', base + ';' + el.dataset.hover));
    el.addEventListener('mouseleave', () => el.setAttribute('style', base));
  });

  /* ---------- Animaciones ---------- */
  $$('[data-anim]').forEach(el => { if (!reduce) el.style.animation = el.dataset.anim; });

  const reveal = $$('[data-r]');
  const pops = $$('[data-pop]');
  const countUp = el => {
    if (el._done) return; el._done = true;
    const to = +el.dataset.count, t0 = performance.now(), dur = 1400;
    const step = t => { const k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 4))); if (k < 1) requestAnimationFrame(step); };
    el.textContent = '0'; requestAnimationFrame(step);
  };
  const show = el => { el.style.opacity = '1'; el.style.translate = '0 0'; $$('[data-count]', el).forEach(countUp); setTimeout(() => { el.style.transition = ''; }, 1400); };

  if (!reduce && 'IntersectionObserver' in window) {
    reveal.forEach(el => {
      const d = (+el.dataset.r - 1) * 90;
      el.style.opacity = '0'; el.style.translate = '0 36px';
      el.style.transition = `opacity .9s cubic-bezier(.2,.8,.2,1) ${d}ms, translate 1s cubic-bezier(.2,.8,.2,1) ${d}ms`;
    });
    pops.forEach(el => { el.style.scale = '0'; el.style.opacity = '0'; });
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; const el = e.target;
      if (el.hasAttribute('data-r')) show(el);
      if (el.hasAttribute('data-stickers')) pops.forEach((p, i) => setTimeout(() => {
        p.style.transition = 'scale .55s cubic-bezier(.3,1.6,.5,1), opacity .3s, transform .3s cubic-bezier(.3,1.6,.5,1)';
        p.style.opacity = '1'; p.style.scale = '1';
      }, i * 55));
      io.unobserve(el);
    }), { threshold: 0.15 });
    reveal.forEach(el => io.observe(el));
    const st = $('[data-stickers]'); if (st) io.observe(st);
  } else {
    $$('[data-count]').forEach(countUp);
  }

  /* Barra de progreso, barra fija inferior y parallax */
  const prog = $('[data-progress]'), sticky = $('[data-sticky]'), offer = $('#oferta');
  const pxEls = $$('[data-px]');
  const onScroll = () => {
    const h = document.documentElement, y = h.scrollTop || document.body.scrollTop;
    if (prog) prog.style.width = (y / Math.max(1, h.scrollHeight - h.clientHeight) * 100) + '%';
    if (sticky && offer) { const r = offer.getBoundingClientRect(); const vis = y > 600 && !(r.top < innerHeight && r.bottom > 0); sticky.style.transform = vis ? 'translateY(0)' : 'translateY(140%)'; }
    if (!reduce) pxEls.forEach(el => { el.style.translate = `0 ${y * +el.dataset.px * -6}px`; });
    reveal.forEach(el => { if (el.style.opacity === '0' && el.getBoundingClientRect().top < innerHeight * 0.95) show(el); });
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Libro 3D que sigue al cursor */
  const tilt = $('[data-tilt]');
  if (tilt && !reduce) addEventListener('pointermove', e => {
    const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    tilt.style.transform = `rotateY(${-16 + x * 18}deg) rotateX(${6 - y * 12}deg) rotateZ(-3deg)`;
  }, { passive: true });
})();
