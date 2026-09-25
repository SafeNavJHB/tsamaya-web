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
//  5. The explore section (explore.js) in every tier: in the static tier with
//     its SVG map, with the scene live drawn by scene/explore.js.
//
// TEST HOOK: window.__home = { tier, ready, c(), state(), frames, ex(), xp() }.
import { detectTier } from './scene/tier.js';
import { initExplore } from './explore.js';

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
// remembered for the next visit's first paint (the explore section's layout,
// below); not a static tier that reduced motion alone chose, which the early
// guess checks for itself, so the next visit without it guesses right
const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!forced && !reduced) try { localStorage.setItem('ts-tier', tier); } catch (e) { /* storage off */ }
// The explore section's 3D layout: set while the page was read in (the inline
// script in src/explore.mjs, from a cheap guess), settled here by the tier.
if (document.getElementById('explore')) document.getElementById('explore').classList.toggle('cine', tier !== 'static');

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
let fitKey = '', fitVal = null;   // where the hero's spotlight tags may go (tagFit)

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
  fitKey = ''; // the spotlight tags' limits (tagFit) move with the layout
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
  let rows = false;
  chips.forEach((c) => { const v = +c.dataset.b; if (v < 0) { rows = c.hidden !== live; c.hidden = live; } else c.setAttribute('aria-pressed', String(v === ctl.pv.t)); });
  // "Back to live" came or went, and the chips may have changed rows: the
  // spotlight tags' limits are taken again, and the static tier (which places
  // its tags only on a resize) places them again, once this script has run
  if (rows) { fitKey = ''; queueMicrotask(() => { if (ctl.tier === 'static') posterTags(); }); }
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
// Where a spotlight tag may go: on screen, below the header and, on phones,
// below the band chips; never on a line of the hero's text. On phones the tags
// sit between the chips and the text (the tag's box ends 14 px above its
// point, and keeps 12 px from the text); where there is no room for them there
// (a 360 x 640 phone, where the text starts right under the chips) they stay
// hidden, as chapter 1 carries the same figures. "Back to live" can wrap the chips to a second row, so showing
// or hiding it takes the limits again.
// On wider screens a tag that would land on a line of text (the city's routes
// pass behind the text column in windows under about 1100 px) moves right past
// that line, or hides if that would take it off screen. The text's lines are
// taken with the page at the top (the layer is fixed once the scene is live,
// and scrolls with the hero before), again whenever the window, the fonts or
// the layout change (keepPlace). Once the scene is live the tag layer is fixed
// while the text scrolls, so the checks move the lines by the scroll (the tags
// fade out over the first third of a screen).
function tagFit() {
  const k = innerWidth + 'x' + innerHeight;
  if (k === fitKey && fitVal) return fitVal;
  const b = spots.f && $('button', spots.f), chipsBox = $('.bchips'), phone = innerWidth < 768;
  let top = phone ? 120 : 108, bottom = Infinity;
  const lines = [];
  if (b && spotsLayer) {
    const lay = spotsLayer.getBoundingClientRect().top, dy = (getComputedStyle(spotsLayer).position === 'fixed' ? window.scrollY : 0) - lay;
    const rg = document.createRange(), add = (r, h1) => { if (r.width > 1) lines.push({ l: r.left, r: r.right, t: r.top + dy, b: r.bottom + dy, h1 }); };
    $$('.home-hero-in > *').forEach((e) => {
      if (e.classList.contains('home-cta')) { Array.from(e.children).forEach((c) => add(c.getBoundingClientRect())); return; }
      rg.selectNodeContents(e);
      Array.from(rg.getClientRects()).forEach((r) => add(r, e.id === 'hero-h'));
    });
    lines.sort((p, q) => p.r - q.r);
    if (phone) {
      if (chipsBox && chipsBox.getClientRects().length) top = Math.max(top, chipsBox.getBoundingClientRect().bottom - lay + 8 + 14 + b.offsetHeight);
      if (lines.length) bottom = Math.min(...lines.map((r) => r.t)) - 12 + 14;
    }
  }
  fitKey = k;
  const fixed = !!spotsLayer && getComputedStyle(spotsLayer).position === 'fixed';
  fitVal = { top, bottom, fixed, lines, th: b ? b.offsetHeight : 0, half: { f: spots.f ? $('button', spots.f).offsetWidth / 2 : 0, l: spots.l ? $('button', spots.l).offsetWidth / 2 : 0 } };
  return fitVal;
}
if (document.fonts) document.fonts.addEventListener('loadingdone', () => { fitKey = ''; });
// Move a tag (or any callout) to x, y in its layer, at opacity a. A hidden
// spotlight tag closes its card.
function setTag(el, x, y, a) {
  const q = el === spots.f ? 'f' : el === spots.l ? 'l' : '';
  if (q && a >= 0.01) {
    const fit = tagFit(), hw = fit.half[q] + 8, sy = fit.fixed ? window.scrollY : 0, bottom = fit.bottom - sy;
    x = clamp(x, hw, Math.max(hw, innerWidth - hw));
    y = clamp(y, fit.top, bottom);
    // the tag's box, with 12 px of air, against each line of text (sorted by
    // their right ends, so one pass clears them all), with the page at the
    // top: the tag keeps that place while the hero scrolls away
    const t0 = y - 14 - fit.th - 12, t1 = y - 14 + 12;
    for (const r of fit.lines) if (r.t < t1 && r.b > t0 && r.l < x + hw && r.r > x - hw) x = r.r + hw;
    // a still-fading tag that the scrolling text reaches hides, and stays
    // hidden until the page is back above that point (no hopping, no blinking)
    if (sy > 0 && fit.lines.some((r) => r.t - sy < t1 && r.b - sy > t0 && r.l < x + hw && r.r > x - hw)) el._hideY = Math.min(el._hideY == null ? Infinity : el._hideY, sy);
    else if (el._hideY != null && sy < el._hideY) el._hideY = null;
    if (bottom < fit.top || x > innerWidth - hw || el._hideY != null) a = 0;
  }
  if (a < 0.01) {
    if (el._a !== 0) { el.style.opacity = '0'; el.style.visibility = 'hidden'; el._a = 0; }
    if (el.classList.contains('open')) spot('');
    return;
  }
  el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
  el.style.opacity = a.toFixed(3);
  el.style.visibility = 'visible';
  el._a = a; el._x = x; el._y = y;
}
// The open card goes beside its tag (right, then left), else under the tag's
// point, else above the tag: the first that stays on screen and clear of every
// line of the hero's text, the band chips and its own tag. Under and above, it
// may slide right while it still spans the tag's point. (Flipping left used to
// put it on the headline in windows 768 to 1100 px wide.) Where nothing fits
// (phones, tall tablets), the same again allowing the band chips to be
// covered, then any text but the headline, then its own tag (which the card
// repeats); failing that, under the point.
function placeCard() {
  const el = spots[ctl.spot];
  if (!el || !(el._a >= 0.01)) return;
  const b = $('button', el), c = $('.sp-card', el), W = innerWidth, H = innerHeight, fit = tagFit();
  const tw = b.offsetWidth, th = b.offsetHeight, cw = c.offsetWidth, ch = c.offsetHeight, x = el._x, y = el._y;
  const sy = fit.fixed ? window.scrollY : 0, lay = spotsLayer.getBoundingClientRect().top, chipsBox = $('.bchips');
  const own = { l: x - tw / 2, r: x + tw / 2, t: y - 14 - th, b: y - 14 }; // the tag itself
  const text = fit.lines.map((r) => ({ l: r.l, r: r.r, t: r.t - sy, b: r.b - sy, h1: r.h1 }));
  const chips = chipsBox && chipsBox.getClientRects().length ? [chipsBox.getBoundingClientRect()].map((r) => ({ l: r.left, r: r.right, t: r.top - lay, b: r.bottom - lay })) : [];
  const h1 = text.filter((r) => r.h1);
  const passes = [text.concat(chips, own), text.concat(own), h1.concat(own), h1].map((a) => a.sort((p, q) => p.r - q.r));
  const mid = clamp(-cw / 2, 12 - x, W - 12 - cw - x);
  const tries = [[tw / 2 + 12, -14 - th / 2 - ch / 2], [-tw / 2 - 12 - cw, -14 - th / 2 - ch / 2], [mid, 16, 1], [mid, -14 - th - 10 - ch, 1]];
  const fits = (blocks) => ([l, t, slide]) => {
    t = clamp(t, HEADROOM - y, H - 12 - ch - y);
    let x0 = x + l;
    const y0 = y + t, xMax = Math.min(W - 12 - cw, slide ? x - 24 : x0);
    // sorted by right edge, so one pass slides it past every block in its way
    for (const k of blocks) if (x0 < k.r + 8 && k.l < x0 + cw + 8 && y0 < k.b + 8 && k.t < y0 + ch + 8) { if (!slide) return null; x0 = k.r + 8; }
    if (x0 < 12 || x0 > xMax) return null;
    return [x0 - x, t];
  };
  let lt = null;
  for (const blocks of passes) if ((lt = tries.map(fits(blocks)).find(Boolean))) break;
  const [l, t] = lt || [mid, clamp(16, HEADROOM - y, H - 12 - ch - y)];
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
// Where the chips and the text leave room for one row of tags (a 360 x 660
// phone), both tags clamp to the same height: spread them apart sideways about
// their shared middle, keeping their order and staying on screen.
function spreadSpots() {
  const f = spots.f, l = spots.l;
  if (!f || !l || !(f._a > 0) || !(l._a > 0)) return;
  const bf = $('button', f), bl = $('button', l), gap = 8;
  if (Math.abs(f._y - l._y) >= Math.max(bf.offsetHeight, bl.offsetHeight) + 4) return;
  const [a, ba, b, bb] = f._x <= l._x ? [f, bf, l, bl] : [l, bl, f, bf];
  const need = (ba.offsetWidth + bb.offsetWidth) / 2 + gap;
  if (b._x - a._x >= need) return;
  const lo = ba.offsetWidth / 2 + 8, hi = innerWidth - bb.offsetWidth / 2 - 8;
  let xa = (a._x + b._x) / 2 - need / 2, xb = xa + need;
  if (xa < lo) { xb += lo - xa; xa = lo; }
  if (xb > hi) { xa -= xb - hi; xb = hi; }
  for (const [el, x] of [[a, xa], [b, xb]]) { el._x = x; el.style.transform = `translate3d(${x.toFixed(1)}px,${el._y.toFixed(1)}px,0)`; }
}
Object.assign(ctl, { setTag, placeCard, spot, spreadSpots });
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
  spreadSpots();
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
 * The explore section: the list, the card and the band switch work in every
 * tier; the static tier draws its SVG map, the scene draws the 3D one.
 * ------------------------------------------------------------------------ */
const exRoot = $('#explore');
const ex = exRoot ? initExplore({ root: exRoot, tier }) : null;
ctl.ex = ex;
if (ex && tier === 'static') ex.staticMap();

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
    if (ex) { exRoot.classList.remove('cine'); ex.gl = null; ex.wait = false; ex.act = true; ex.staticMap(); ex.show(); }
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
  // the explore map's outlines, fetched with the scene (chapters.js builds the
  // map when they are in; the list and the card do not wait for them)
  ctl.geo = ex ? fetch('data/geo.json').then((r) => (r.ok ? r.json() : null)).catch(() => null) : null;
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
        onResize: () => { if (ch) ch.relayout(); },
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
  ex: () => ex && { lvl: ex.lvl, sel: ex.sel, hov: ex.hov, band: ex.band, card: ex.card, act: ex.act, gl: !!ex.gl, svg: !!ex.svg },
  xp: () => (scene && scene.ch ? scene.ch.xp() : null),
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
