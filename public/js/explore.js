// explore.js: the "Explore the metros" section (BUILD_PLAN section 5.1), the
// part that works in every tier: the list, the band switch, the card, the
// announcements, the keyboard, and in the static tier an SVG map. With the 3D
// scene live, scene/explore.js draws the map instead and hooks in through
// ex.gl (sync, fly, band): this module owns the state, the scene follows it.
//
// STATE
//   hov   the metro being pointed at or focused (-1 for none)
//   sel   the metro picked (-1 for none); the camera flies to it
//   lvl   'nat' (all of them), 'reg' (the Gauteng cluster) or 'metro'
//   band  the time band the rings and the card's marker show (0, 1, 2)
//
// FIGURES. Every number is read from the list rows' data attributes, which the
// build writes from the live data (src/pages/index.mjs). The card switches
// between true values; only its bars move.

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // as site.config.mjs
const TS = window.Tsamaya;

export function initExplore({ root, tier }) {
  const list = $('.ex-list', root);
  if (!list) return null;
  const rows = $$('li[data-k]', list);
  const bandBtns = $$('.exb', root), card = $('.ex-card', root), back = $('.ex-back', root), live = $('#ex-live', root);
  const cardRows = $$('.exc-rows li', card);
  const BN = bandBtns.map((b) => b.textContent);
  const M = rows.map((li, i) => ({
    i, k: li.dataset.k, p: li.dataset.p, z: +li.dataset.z, r: li.dataset.r.split(' ').map(Number), gt: li.hasAttribute('data-gt'),
    name: $('span', li).textContent, href: $('a', li).getAttribute('href'),
  }));
  const nowBand = () => (TS ? TS.bands.indexOf(TS.bandAt(TS.saMinutes())) : 0);
  // wait: a 3D map is on its way (ex.gl is still null). keep(): a card stays up
  // with nothing picked (the coverage page's phone layout gives it a place)
  const ex = { M, band: nowBand(), hov: -1, sel: -1, lvl: 'nat', card: -2, last: 0, act: tier === 'static', gl: null, svg: null, wait: tier !== 'static', keep: () => false };

  // each row's link becomes a button that works the map; the metro's page is
  // one step on, in the card (without JavaScript the rows stay links)
  const btns = rows.map((li, i) => {
    const a = $('a', li), b = document.createElement('button');
    b.type = 'button'; b.dataset.m = i; b.tabIndex = i ? -1 : 0;
    b.append(...a.childNodes); a.replaceWith(b);
    return b;
  });

  let sayT = 0;
  function say(t) { clearTimeout(sayT); live.textContent = ''; sayT = setTimeout(() => { live.textContent = t; }, 60); }
  function mark() {
    const now = nowBand();
    cardRows.forEach((li, b) => { li.classList.toggle('sel', b === ex.band); $('em', li).textContent = b === now ? 'Now' : b === ex.band ? 'Selected' : ''; });
  }
  function fill(i) {
    const m = M[i];
    $('#exc-n', card).textContent = m.name; $('#exc-p', card).textContent = m.p;
    $('#exc-z', card).textContent = $('#exc-s', card).textContent = fmt(m.z);
    cardRows.forEach((li, b) => { $('s', li).style.transform = `scaleX(${(m.r[b] / m.z).toFixed(3)})`; $('b', li).textContent = fmt(m.r[b]); });
    const a = $('#exc-a', card); a.href = m.href; a.textContent = `Open the ${m.name} page`;
    mark();
  }
  // bring every surface in line with the state: card, rows, static map, back
  // button, and the scene (ex.gl.sync)
  function show() {
    let i = ex.hov >= 0 ? ex.hov : ex.sel;
    if (i < 0 && (ex.keep() || (!ex.gl && !ex.wait))) i = ex.last; // the static tier keeps a card up
    if (i >= 0) ex.last = i;
    if (i !== ex.card) { ex.card = i; if (i >= 0) fill(i); }
    card.classList.toggle('is-on', i >= 0);
    card.classList.toggle('is-pin', i >= 0 && i === ex.sel);
    btns.forEach((b, j) => { b.classList.toggle('hov', j === ex.hov); if (j === ex.sel) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    if (ex.svg) $$('.exo path', ex.svg).forEach((p) => p.classList.toggle('on', +p.dataset.m === i || +p.dataset.m === ex.sel));
    back.hidden = ex.lvl === 'nat' && ex.sel < 0;
    if (ex.gl) ex.gl.sync();
  }
  const hover = (i) => { if (i !== ex.hov) { ex.hov = i; show(); } };
  function select(i) {
    const m = M[i];
    ex.sel = i; ex.lvl = 'metro';
    say(`${m.name}, ${m.p}. ${fmt(m.z)} rated areas. ${BN[ex.band]}: ${fmt(m.r[ex.band])} rated high risk.`);
    if (ex.gl) ex.gl.fly('metro', i);
    show();
  }
  function region() {
    ex.sel = -1; ex.lvl = 'reg';
    say(`Gauteng and surrounds: ${M.filter((m) => m.gt).length} metros.`);
    if (ex.gl) ex.gl.fly('reg');
    show();
  }
  function home(quiet) {
    if (ex.lvl === 'nat' && ex.sel < 0) return;
    ex.sel = -1; ex.lvl = 'nat';
    if (!quiet) say(`All ${M.length} metros.`);
    if (ex.gl) ex.gl.fly('nat');
    show();
  }
  function setBand(b, quiet) {
    ex.band = b;
    bandBtns.forEach((x) => x.setAttribute('aria-pressed', String(+x.dataset.b === b)));
    if (ex.svg) $$('.rg', ex.svg).forEach((c, i) => c.setAttribute('r', (1.36 * Math.sqrt(M[i].r[b])).toFixed(1)));
    mark();
    if (ex.gl) ex.gl.band(b);
    if (!quiet && ex.sel >= 0) say(`${BN[b]}: ${fmt(M[ex.sel].r[b])} rated high risk in ${M[ex.sel].name}.`);
  }
  Object.assign(ex, { show, hover, select, region, home, setBand, btns });

  const now = nowBand();
  bandBtns.forEach((x) => {
    if (+x.dataset.b === now) x.insertAdjacentHTML('beforeend', '<span class="now" aria-hidden="true">Now</span>');
    x.addEventListener('click', () => setBand(+x.dataset.b));
  });
  const mouse = (e) => e.pointerType === 'mouse' || e.pointerType === 'pen';
  btns.forEach((b, i) => {
    b.addEventListener('pointerenter', (e) => { if (mouse(e)) hover(i); });
    b.addEventListener('pointerleave', (e) => { if (mouse(e) && ex.hov === i && document.activeElement !== b) hover(-1); });
    b.addEventListener('focus', () => { btns.forEach((o) => { o.tabIndex = o === b ? 0 : -1; }); hover(i); });
    // Tab from a row goes on into its card (the metro page link): keep it up
    b.addEventListener('blur', (e) => { if (ex.hov === i && !card.contains(e.relatedTarget)) hover(-1); });
    b.addEventListener('click', () => select(i));
    // one tab stop for the list: the arrows move along it, Home and End jump
    b.addEventListener('keydown', (e) => {
      const n = btns.length, k = e.key;
      const j = k === 'ArrowDown' || k === 'ArrowRight' ? (i + 1) % n : k === 'ArrowUp' || k === 'ArrowLeft' ? (i + n - 1) % n : k === 'Home' ? 0 : k === 'End' ? n - 1 : -1;
      if (j >= 0) { e.preventDefault(); btns[j].focus(); }
    });
  });
  // and once focus leaves the card for anywhere but a row, the preview ends
  card.addEventListener('focusout', (e) => { if (ex.hov >= 0 && !card.contains(e.relatedTarget) && !btns.includes(e.relatedTarget)) hover(-1); });
  back.addEventListener('click', () => home());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && ex.act && (ex.lvl !== 'nat' || ex.sel >= 0)) home(); });

  // The static map: the country, each metro's coverage outline, and at its
  // point a dot and a ring sized by its high-risk count in the band picked, all
  // from data/geo.json, fetched when the section comes near.
  ex.staticMap = () => {
    if (ex.svg || ex.svgLoading) return;
    ex.svgLoading = true;
    const fig = $('.ex-map', root);
    const load = () => fetch('data/geo.json').then((r) => r.json()).then((geo) => {
      const byKey = Object.fromEntries(geo.metros.map((g) => [g.key, g]));
      const d = (rings, z = 'Z') => rings.map((r) => 'M' + r.map((p) => p.join(' ')).join('L') + z).join('');
      const paths = M.map((m) => byKey[m.k] ? `<path data-m="${m.i}" d="${d(byKey[m.k].rings)}"/>` : '').join('');
      const marks = M.map((m) => { const p = byKey[m.k] ? byKey[m.k].point : [0, 0]; return `<circle class="rg" cx="${p[0]}" cy="${p[1]}" r="0"/><circle class="dt" cx="${p[0]}" cy="${p[1]}" r="4"/>`; }).join('');
      fig.innerHTML = `<svg viewBox="0 0 ${geo.width} ${Math.ceil(geo.height)}" focusable="false"><path class="exl" fill-rule="evenodd" d="${d(geo.land)}"/><path class="exbd" d="${d(geo.borders, '')}"/><g class="exo">${paths}</g><g class="exr">${marks}</g></svg>`;
      ex.svg = $('svg', fig);
      $$('.exo path', ex.svg).forEach((p) => {
        const i = +p.dataset.m;
        p.addEventListener('pointerenter', (e) => { if (mouse(e)) hover(i); });
        p.addEventListener('pointerleave', () => { if (ex.hov === i) hover(-1); });
        p.addEventListener('click', () => select(i));
      });
      setBand(ex.band, true);
      show();
    }).catch(() => { ex.svgLoading = false; });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); load(); } }, { rootMargin: '600px 0px' });
      io.observe(root);
    } else load();
  };

  setBand(ex.band, true);
  show();
  return ex;
}
