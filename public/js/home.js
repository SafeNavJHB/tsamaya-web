// home.js: the home page's script (an ES module, deferred, after site.js).
// The page is complete without it; see src/pages/index.mjs.
//
// WHAT IT DOES
//  1. Picks the tier (scene/tier.js) and marks <html> with tier-<name>.
//     ?tier=static|light|full overrides the choice, for testing only.
//  2. Wires what works in every tier, with or without the 3D scene:
//     - the hero band chips (in the static tier they swap the poster's cells);
//     - the route spotlight: the two route tags open plain HTML cards on
//       hover, focus or tap; a click or Enter keeps a card open, a second tap
//       or Escape closes it;
//     - the FAQ accordion.
//  3. Full and light tiers: at idle after first paint, imports the engine
//     (and with it Three.js), the city and the chapters, and hands the hero
//     over to them. The static tier never downloads any of that.
//  4. Falls back to the static tier if anything fails to load, or if the GPU
//     drops the WebGL context, and keeps the reader's place when the layout
//     changes under them.
//
// TEST HOOK: window.__home = { tier, ready, c(), state(), frames }.
import { detectTier } from './scene/tier.js';

const doc = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

// The South African clock and the bands come from site.js (window.Tsamaya), so
// every surface agrees; this fallback only runs if site.js failed to load.
const TS = window.Tsamaya || {
  saMinutes() { const d = new Date(); return (d.getUTCHours() * 60 + d.getUTCMinutes() + 120) % 1440; },
  bands: [{ key: 'day', name: 'Daytime', from: 300, to: 1050 }, { key: 'evening', name: 'Evening', from: 1050, to: 1170 }, { key: 'night', name: 'Night', from: 1170, to: 300 }],
  bandAt(m) { return this.bands[m >= 300 && m < 1050 ? 0 : m >= 1050 && m < 1170 ? 1 : 2]; },
};
const bandOf = (m) => TS.bands.indexOf(TS.bandAt(m));

const forced = new URLSearchParams(location.search).get('tier');
const tier = ['static', 'light', 'full'].includes(forced) ? forced : detectTier();
doc.classList.add('tier-' + tier);

// Shared with chapters.js once the scene is up.
const ctl = {
  tier,
  live: bandOf(TS.saMinutes()),   // the band in force now
  pv: { on: false, t: 0 },        // the hero preview: on, and which band
  spot: '',                       // the open route card: 'f', 'l' or ''
  pinned: false,                  // opened by a click, tap or Enter (stays open)
  bands: TS.bands,
  bandOf,
  frames: 0,
  onPreview: null,                // the scene's hooks, set by chapters.js
  onSpot: null,
};
ctl.pv.t = ctl.live;
let scene = null;                 // { engine, ch } once the 3D scene is live

/* ---------------------------------------------------------------------------
 * Keep the reader's place across a layout change (the chapters pinning, a
 * lost context unpinning them, the FAQ folding): the first section still on
 * screen stays where it was.
 * ------------------------------------------------------------------------ */
const boxOf = (s) => (s.parentElement && s.parentElement.classList.contains('pin-spacer') ? s.parentElement : s);
function keepPlace(change) {
  let el = null, off = 0;
  if (window.scrollY > 2) {
    el = $$('#zone > section, .home-flow > section').find((s) => boxOf(s).getBoundingClientRect().bottom > 1) || null;
    if (el) off = boxOf(el).getBoundingClientRect().top;
  }
  change();
  if (!el) return;
  const y = boxOf(el).getBoundingClientRect().top + window.scrollY - off;
  // Lenis caches the page height and would clamp to the old one
  if (window.lenis) { window.lenis.resize(); window.lenis.scrollTo(y, { immediate: true, force: true }); } else window.scrollTo(0, y);
  if (window.ScrollTrigger) window.ScrollTrigger.update();
}

/* ---------------------------------------------------------------------------
 * Hero band chips: preview another band's ratings; "Back to live" returns to
 * the band in force now. Without the scene they swap the poster's cells.
 * ------------------------------------------------------------------------ */
const chips = $$('.bchip');
const posterCells = $('#poster-cells');
const clockEl = $('.hud-clock'), pvEl = $('.hud-pv');
const lower = (b) => TS.bands[b].name.toLowerCase();
function preview(b, instant) {
  const live = b < 0 || b === ctl.live;
  const back = chips.find((c) => +c.dataset.b < 0);
  const refocus = live && back && document.activeElement === back;
  ctl.pv.on = !live;
  ctl.pv.t = live ? ctl.live : b;
  doc.classList.toggle('pv', ctl.pv.on);
  chips.forEach((c) => { const v = +c.dataset.b; if (v < 0) c.hidden = live; else c.setAttribute('aria-pressed', String(v === ctl.pv.t)); });
  if (refocus) chips[ctl.live].focus();
  if (posterCells) posterCells.setAttribute('href', '#pl-c' + ctl.pv.t);
  if (pvEl) {
    pvEl.hidden = !ctl.pv.on;
    clockEl.hidden = ctl.pv.on;
    if (ctl.pv.on) pvEl.innerHTML = `Previewing ${lower(ctl.pv.t)}<span class="hud-long"> ratings</span> · live now: ${lower(ctl.live)}`;
  }
  if (ctl.onPreview) ctl.onPreview(instant);
}
ctl.preview = preview;
chips.forEach((c) => c.addEventListener('click', () => preview(+c.dataset.b)));
preview(-1, true);
// the live band moves with the clock (site.js repaints the time every 30 s)
setInterval(() => {
  const b = bandOf(TS.saMinutes());
  if (b !== ctl.live) { ctl.live = b; preview(ctl.pv.on ? ctl.pv.t : -1, true); }
}, 30000);

/* ---------------------------------------------------------------------------
 * Route spotlight: the "Standard" and "Lower-risk" tags in the hero. Each is a
 * real button that opens a card with the route card's figures. In the static
 * tier the tags sit on the poster; with the scene, chapters.js projects them
 * from the 3D routes and pulses the chosen route.
 * ------------------------------------------------------------------------ */
const spots = { f: $('[data-co="hf"]'), l: $('[data-co="hl"]') };
const HEADROOM = 80; // keep cards clear of the header
// Focusing a tag must not scroll the tag layer sideways (it clips with
// overflow: clip; this catches browsers that only know overflow: hidden).
const spotsLayer = $('#spots');
if (spotsLayer) spotsLayer.addEventListener('scroll', () => { spotsLayer.scrollLeft = 0; spotsLayer.scrollTop = 0; });
// Where a spotlight tag's point may go, so the whole tag stays on screen and,
// on phones, below the band chips (the tag sits 14px above its point). Taken
// again when the window or the fonts change.
let fitKey = '', fitVal = null;
function tagFit() {
  const k = innerWidth + 'x' + innerHeight;
  if (k === fitKey && fitVal) return fitVal;
  const b = spots.f && $('button', spots.f), chipsBox = $('.bchips'), phone = innerWidth < 768;
  let top = phone ? 120 : 108;
  if (phone && b && chipsBox && chipsBox.getClientRects().length && spotsLayer) {
    top = Math.max(top, chipsBox.getBoundingClientRect().bottom - spotsLayer.getBoundingClientRect().top + 8 + 14 + b.offsetHeight);
  }
  fitKey = k;
  fitVal = { top, half: { f: spots.f ? $('button', spots.f).offsetWidth / 2 : 0, l: spots.l ? $('button', spots.l).offsetWidth / 2 : 0 } };
  return fitVal;
}
if (document.fonts) document.fonts.addEventListener('loadingdone', () => { fitKey = ''; });
// Move a tag (or any callout) to x, y in its layer, at opacity a. A hidden
// spotlight tag closes its card.
function setTag(el, x, y, a) {
  if (a < 0.01) {
    if (el._a !== 0) { el.style.opacity = '0'; el.style.visibility = 'hidden'; el._a = 0; }
    if (el.classList.contains('open')) spot('');
    return;
  }
  const q = el === spots.f ? 'f' : el === spots.l ? 'l' : '';
  if (q) {
    const fit = tagFit(), hw = fit.half[q] + 8;
    x = clamp(x, hw, Math.max(hw, innerWidth - hw));
    y = Math.max(y, fit.top);
  }
  el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
  el.style.opacity = a.toFixed(3);
  el.style.visibility = 'visible';
  el._a = a; el._x = x; el._y = y;
}
// The open card sits beside its tag, flipping side near the screen's edges.
// Where there is no room beside it (phones), it goes under the tag's point or
// above the tag: the first that keeps clear of the hero text (the say line,
// then at least the headline), preferring to keep clear of the band chips.
function placeCard() {
  const el = spots[ctl.spot];
  if (!el || !(el._a >= 0.01)) return;
  const b = $('button', el), c = $('.sp-card', el), W = innerWidth, H = innerHeight;
  const tw = b.offsetWidth, th = b.offsetHeight, cw = c.offsetWidth, ch = c.offsetHeight, x = el._x, y = el._y;
  let l = tw / 2 + 12, t = -14 - th / 2 - ch / 2;
  if (x + l + cw > W - 12) l = -tw / 2 - 12 - cw;
  if (x + l < 12) {
    l = clamp(-cw / 2, 12 - x, W - 12 - cw - x);
    const box = spotsLayer.getBoundingClientRect(), chipsBox = $('.bchips');
    const topOf = (s) => { const e = $(s); return e ? e.getBoundingClientRect().top - box.top - 8 : H; };
    const sayTop = topOf('.home-hero-in > *'), h1Top = topOf('#hero-h');
    const roof = Math.max(HEADROOM, chipsBox && chipsBox.getClientRects().length ? chipsBox.getBoundingClientRect().bottom - box.top + 8 : 0);
    const dn = 16, up = -14 - th - 10 - ch;
    t = y + dn + ch <= sayTop ? dn : y + up >= roof ? up : y + dn + ch <= h1Top ? dn : y + up >= HEADROOM ? up : dn;
  }
  t = clamp(t, HEADROOM - y, H - 12 - ch - y);
  c.style.transform = `translate(${Math.round(l)}px,${Math.round(t)}px)`;
}
function spot(w, pin) {
  if (w === ctl.spot) { if (w && pin) ctl.pinned = true; return; }
  ctl.spot = w;
  ctl.pinned = !!(w && pin);
  for (const q of ['f', 'l']) {
    const el = spots[q];
    if (!el) continue;
    el.classList.toggle('open', q === w);
    $('button', el).setAttribute('aria-expanded', String(q === w));
  }
  if (w) placeCard();
  if (ctl.onSpot) ctl.onSpot(w);
}
Object.assign(ctl, { setTag, placeCard, spot });
for (const q of ['f', 'l']) {
  const b = spots[q] && $('button', spots[q]);
  if (!b) continue;
  const mouse = (e) => e.pointerType === 'mouse' || e.pointerType === 'pen';
  b.addEventListener('pointerenter', (e) => { if (mouse(e) && !(ctl.pinned && ctl.spot !== q)) spot(q); });
  b.addEventListener('pointerleave', (e) => { if (mouse(e) && ctl.spot === q && !ctl.pinned && document.activeElement !== b) spot(''); });
  b.addEventListener('focus', () => { if (ctl.spot !== q) spot(q); });
  b.addEventListener('blur', () => { if (ctl.spot === q) spot(''); });
  b.addEventListener('click', () => { if (ctl.spot !== q) spot(q, true); else if (!ctl.pinned) ctl.pinned = true; else spot(''); });
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && ctl.spot) spot(''); });

// Static tier: the tags sit where the routes are drawn on the poster. The
// poster is tilted in 3D by CSS, so each tag reads the screen position of a
// marker placed inside the plane (src/poster.mjs, tagAnchors()).
function posterTags() {
  if (ctl.tier !== 'static') return;
  const box = $('#spots').getBoundingClientRect();
  for (const q of ['f', 'l']) {
    const a = $(`.pa[data-pa="h${q}"]`);
    if (!a || !spots[q]) continue;
    const r = a.getBoundingClientRect();
    setTag(spots[q], clamp(r.left - box.left, 12, box.width - 12), clamp(r.top - box.top, innerWidth < 768 ? 120 : 108, box.height - 12), 1);
  }
  placeCard();
}
addEventListener('resize', posterTags);

/* ---------------------------------------------------------------------------
 * FAQ: every answer is open in the HTML (so it reads without JavaScript);
 * fold all but the ones marked data-open.
 * ------------------------------------------------------------------------ */
function setupFaq() {
  const G = window.gsap, ST = window.ScrollTrigger;
  const smooth = () => !!G && ctl.tier !== 'static';
  const remeasure = () => { if (ST) ST.refresh(); };
  keepPlace(() => {
    $$('.qa').forEach((qa) => {
      const open = qa.hasAttribute('data-open');
      $('button', qa).setAttribute('aria-expanded', String(open));
      $('.qa-a', qa).hidden = !open;
    });
    remeasure();
  });
  $$('.qa').forEach((qa) => {
    const btn = $('button', qa), panel = $('.qa-a', qa);
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      if (!smooth()) { panel.hidden = !open; remeasure(); return; }
      G.killTweensOf(panel);
      if (open) {
        panel.hidden = false;
        G.fromTo(panel, { height: 0 }, { height: 'auto', duration: 0.18, ease: 'power2.out', clearProps: 'height', onComplete: remeasure });
      } else {
        G.to(panel, { height: 0, duration: 0.18, ease: 'power2.in', onComplete: () => { panel.hidden = true; G.set(panel, { clearProps: 'height' }); remeasure(); } });
      }
    });
  });
}
setupFaq();

/* ---------------------------------------------------------------------------
 * "Inside the app": with motion, a rail runs down the six steps as you read
 * and each number lights as the rail reaches it. Not in the static tier.
 * ------------------------------------------------------------------------ */
const seqParts = [];
function setupSeq() {
  const G = window.gsap, ST = window.ScrollTrigger, rail = $('.seq-rail i');
  if (!G || !ST || !rail || ctl.tier === 'static') return;
  doc.classList.add('has-seq');
  seqParts.push(G.to(rail, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.seq', start: 'top 62%', end: 'bottom 62%', scrub: 0.8 } }));
  $$('.seq li').forEach((li) => seqParts.push(ST.create({ trigger: li, start: 'top 62%', onEnter: () => li.classList.add('on'), onLeaveBack: () => li.classList.remove('on') })));
}
setupSeq();

/* ---------------------------------------------------------------------------
 * The static tier, and the way back to it.
 * ------------------------------------------------------------------------ */
function toStatic(why) {
  if (ctl.tier === 'static') return;
  if (why && window.console) console.warn('home: 3D scene off (' + why + ')');
  keepPlace(() => {
    if (scene) { if (scene.ch) scene.ch.kill(); scene.engine.dispose(); scene = null; }
    // and any pin a half-finished start left behind
    if (window.ScrollTrigger) window.ScrollTrigger.getAll().forEach((t) => { if (t.pin) t.kill(true); });
    seqParts.splice(0).forEach((t) => { if (t.scrollTrigger) t.scrollTrigger.kill(); t.kill(); });
    window.gsap && window.gsap.set('.seq-rail i', { clearProps: 'transform' });
    doc.classList.remove('is-cine', 'tier-full', 'tier-light', 'has-seq');
    doc.classList.add('tier-static');
    ctl.tier = 'static';
    ctl.onPreview = ctl.onSpot = null;
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  });
  preview(ctl.pv.on ? ctl.pv.t : -1, true);
  posterTags();
  hook.ready = true;
}

/* ---------------------------------------------------------------------------
 * The 3D scene, at idle after first paint (full and light tiers only).
 * ------------------------------------------------------------------------ */
async function loadScene() {
  const [eng, cityMod, chMod] = await Promise.all([import('./scene/engine.js'), import('./scene/city.js'), import('./scene/chapters.js')]);
  if (!window.gsap || !window.ScrollTrigger) throw new Error('GSAP did not load');
  if (ctl.tier === 'static') return;
  keepPlace(() => {
    doc.classList.add('is-cine');
    let ch = null, city = null;
    try {
      const engine = eng.createEngine({
        canvas: $('#gl'), stage: $('#scene'), tier: ctl.tier, fov: 36,
        onFrame: (f) => { ctl.frames++; return ch ? ch.frame(f) : false; },
        onDegrade: () => { if (city) city.degrade(); if (ch) ch.redraw(); },
        onLost: () => toStatic('the graphics context was lost'),
      });
      scene = { engine, ch: null };
      city = cityMod.buildCity(engine, { tier: ctl.tier, small: innerWidth < 768 });
      ch = scene.ch = chMod.initChapters({ engine, city, ctl });
    } catch (e) {
      doc.classList.remove('is-cine');
      if (scene && scene.engine) scene.engine.dispose();
      scene = null;
      throw e;
    }
  });
  if (scene && scene.ch) scene.ch.snap();
  hook.ready = true;
}

// Run fn at idle once the first paint is on screen. Where the browser reports
// paint timing, wait for its first-contentful-paint entry (a frame can be
// drawn well before it is shown on a slow GPU); elsewhere, after one frame.
function afterPaint(fn) {
  let started = false;
  const idle = () => {
    if (started) return;
    started = true;
    if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 1500 }); else setTimeout(fn, 200);
  };
  const oneFrame = () => requestAnimationFrame(() => setTimeout(idle, 0));
  const types = window.PerformanceObserver && PerformanceObserver.supportedEntryTypes;
  if (!types || !types.includes('paint')) { oneFrame(); return; }
  const painted = () => performance.getEntriesByName('first-contentful-paint').length > 0;
  if (painted()) { oneFrame(); return; }
  const po = new PerformanceObserver(() => { if (painted()) { po.disconnect(); setTimeout(idle, 0); } });
  po.observe({ type: 'paint', buffered: true });
  // never wait forever (a page that paints nothing contentful reports no entry)
  setTimeout(() => { po.disconnect(); oneFrame(); }, 4000);
}

const hook = window.__home = {
  get tier() { return ctl.tier; },
  ready: false,
  get frames() { return ctl.frames; },
  c: () => (scene && scene.ch ? scene.ch.c() : 0),
  state: () => Object.assign(
    { tier: ctl.tier, band: ctl.pv.t, preview: ctl.pv.on, previewBand: ctl.pv.t, live: ctl.live, spot: ctl.spot, pinned: ctl.pinned },
    scene && scene.ch ? scene.ch.state() : {},
  ),
};

if (tier === 'static') {
  posterTags();
  hook.ready = true;
} else {
  afterPaint(() => { loadScene().catch((e) => toStatic(e && e.message ? e.message : 'load failed')); });
}
