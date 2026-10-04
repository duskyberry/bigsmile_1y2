/* Listo para mañana · Landing — Big Smile
   Edita CONFIG para cambiar precios, fechas de cada etapa y el enlace de compra. */
const CONFIG = {
  ctaUrl: 'https://pay.hotmart.com/R107890588D?bid=1791154086687',
  showCountdown: true,
  stages: [
    { name: 'Preventa',      price: '$349 MXN', end: '2026-10-31T23:59:00' },
    { name: 'Lanzamiento',   price: '$449 MXN', end: '2026-11-30T23:59:00' },
    { name: 'Precio normal', price: '$699 MXN', end: null }
  ]
};

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Precio por etapas + contador ---------- */
  const fmt = d => new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  const pad = n => String(n).padStart(2, '0');
  const currentStage = now => { const i = CONFIG.stages.findIndex(s => !s.end || now < new Date(s.end).getTime()); return i < 0 ? CONFIG.stages.length - 1 : i; };
  let lastStage = -1;

  function renderStages(cur) {
    const S = CONFIG.stages, last = S.length - 1;
    $$('.lp-price').forEach(el => el.textContent = S[cur].price);
    $$('.lp-stage').forEach(el => el.textContent = S[cur].name);
    $$('.lp-next').forEach(el => el.textContent = cur < last ? S[cur + 1].price : '');
    const old = $('#lp-old');
    if (old) { old.style.display = cur < last ? '' : 'none'; const s = old.querySelector('span') || old; s.textContent = S[last].price; }
    const box = $('#lp-stages');
    if (box) box.innerHTML = S.map((s, i) => {
      const on = i === cur, past = i < cur;
      return `<div style="position:relative;border:${on ? '2px solid #201E1E' : '2px dashed #9C9696'};background:${on ? '#201E1E' : 'transparent'};color:${on ? '#F1F1F1' : past ? '#9C9696' : '#201E1E'};border-radius:16px;padding:12px 10px 10px;display:flex;flex-direction:column;gap:3px">
        <span style="font:800 9.5px Poppins;letter-spacing:.08em;text-transform:uppercase;min-height:12px;color:#A8CF45">${on ? 'HOY' : past ? 'Terminó' : ''}</span>
        <span style="font:700 11.5px/1.2 Poppins">${s.name}</span>
        <span style="font:900 clamp(15px,4.4vw,19px)/1.1 Poppins;text-decoration:${past ? 'line-through' : 'none'}">${s.price}</span>
        <span style="font:600 10px Montserrat;opacity:.8">${s.end ? 'Hasta el ' + fmt(s.end) : 'Después'}</span></div>`;
    }).join('');
  }

  function tick() {
    const now = Date.now(), cur = currentStage(now), S = CONFIG.stages;
    if (cur !== lastStage) { renderStages(cur); lastStage = cur; }
    const timer = $('#lp-timer');
    const end = S[cur].end ? new Date(S[cur].end).getTime() : 0;
    const left = Math.max(0, end - now);
    if (timer) timer.style.display = CONFIG.showCountdown && cur < S.length - 1 && left > 0 ? '' : 'none';
    const v = [Math.floor(left / 864e5), Math.floor(left / 36e5) % 24, Math.floor(left / 6e4) % 60, Math.floor(left / 1e3) % 60];
    $$('[data-t]').forEach(el => el.textContent = pad(v[+el.dataset.t]));
  }
  tick(); setInterval(tick, 1000);

  const cta = $('#lp-cta'); if (cta) cta.href = CONFIG.ctaUrl;

  /* ---------- Calculadora de tiempo ---------- */
  const range = $('#lp-range');
  const calc = () => {
    const m = +range.value, h = Math.round(m * 0.5 * 190 / 60);
    $('#lp-min').textContent = m; $('#lp-hours').textContent = h; $('#lp-weekends').textContent = Math.max(1, Math.round(h / 16));
  };
  if (range) { range.addEventListener('input', calc); calc(); }

  /* ---------- Preguntas (acordeón) ---------- */
  let open = 0;
  const setFaq = () => $$('[data-faq]').forEach(b => {
    const i = +b.dataset.faq, on = i === open;
    b.setAttribute('aria-expanded', on);
    const a = $(`[data-faq-a="${i}"]`), ic = $(`[data-faq-i="${i}"]`);
    if (a) a.style.gridTemplateRows = on ? '1fr' : '0fr';
    if (ic) ic.style.transform = on ? 'rotate(45deg)' : 'none';
  });
  $$('[data-faq]').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.faq; open = open === i ? -1 : i; setFaq(); }));
  setFaq();

  /* ---------- Animaciones ---------- */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
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
