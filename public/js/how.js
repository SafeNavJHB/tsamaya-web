// how.js: How it works (src/pages/how-it-works.mjs). The page reads without it:
// six steps beside the illustrative city drawn flat (the SVG plan).
//
// WHAT IT DOES
//  1. Marks the step being read (in every tier): the one crossing the middle
//     of the window.
//  2. Full and light tiers: at idle after first paint, loads the scene (the
//     home page's city, scene/city.js) into the pinned stage, and turns the
//     steps into camera stops. Everything is driven by the scroll: nothing
//     moves by itself, so there is nothing to pause.
//       01 the fastest route draws        04 the lower-risk route draws
//       02 a pulse runs along it           05 both, the fastest one dimmed
//       03 a lower look along the roads    06 the car drives the lower-risk one
//  The static tier (reduced motion, no WebGL 2) never downloads any of that.
//
// TEST HOOK: window.__how = { tier, ready, p(), frames }.
import { detectTier } from './scene/tier.js';

const doc = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const D2R = Math.PI / 180;
const TS = window.Tsamaya;

const forced = new URLSearchParams(location.search).get('tier');
let tier = ['static', 'light', 'full'].includes(forced) ? forced : detectTier();
doc.classList.add('tier-' + tier);

const stepsEl = $$('.hw-step'), stageEl = $('.hw-scene'), tags = $$('.hw-tag');
const live = TS ? TS.bands.indexOf(TS.bandAt(TS.saMinutes())) : 2;
const cells = $('#hw-cells');
if (cells && live >= 0) cells.setAttribute('href', '#pl-c' + live); // the flat plan shows the band in force too

// Progress through the steps: step i runs from its top reaching the middle of
// the window to its bottom reaching it, so p goes 0 to 6.
function progress() {
  // (on phones the pinned city fills the top of the window: the reading line
  // sits a little below it)
  let mid = innerHeight * 0.5;
  if (innerWidth < 900) { const sb = $('.hw-stage').getBoundingClientRect().bottom; mid = sb + (innerHeight - sb) * 0.3; }
  let p = 0;
  stepsEl.forEach((el, i) => { const r = el.getBoundingClientRect(); if (r.top <= mid) p = i + clamp((mid - r.top) / Math.max(1, r.height), 0, 1); });
  return p;
}
let on = -1;
function markStep(p) {
  const i = Math.min(stepsEl.length - 1, Math.floor(p));
  if (i !== on) { on = i; stepsEl.forEach((el, j) => el.classList.toggle('on', j === i)); }
}

// The camera stops: target t, distance d, pitch p and yaw y (degrees), field of
// view f. Phones see the city through a short band, so from further away.
const STOPS = [
  { t: [0, 0, 0], d: 215, p: 54, y: -30, f: 34 },
  { t: [-10, 0, 8], d: 90, p: 30, y: -42, f: 36 },
  { t: [0, 0, -2], d: 118, p: 26, y: -18, f: 36 },
  { t: [0, 0, 0], d: 175, p: 46, y: -25, f: 35 },
  { t: [0, 0, 0], d: 210, p: 62, y: -10, f: 34 },
  { t: [0, 0, 0], d: 185, p: 50, y: -32, f: 35 },
];
function camAt(p) {
  const i = clamp(Math.floor(p), 0, STOPS.length - 1), j = Math.min(STOPS.length - 1, i + 1);
  // hold each stop through most of its step, then ease to the next
  const u = sstep(0.55, 1, p - i), a = STOPS[i], b = STOPS[j];
  return { t: a.t.map((v, k) => lerp(v, b.t[k], u)), d: Math.exp(lerp(Math.log(a.d), Math.log(b.d), u)), p: lerp(a.p, b.p, u), y: lerp(a.y, b.y, u), f: lerp(a.f, b.f, u) };
}
// What the city shows at progress p (scene/city.js apply()).
function stateAt(p) {
  return {
    band: live >= 0 ? live : 2, dis: 0, morph: 0, grow: 0,
    fast: sstep(0.1, 0.7, p),
    fastA: lerp(0.82, 0.42, sstep(3.8, 4.4, p)),
    pulse: sstep(1.12, 1.85, p), pulseA: sstep(1.05, 1.14, p) * (1 - sstep(1.84, 1.95, p)),
    low: sstep(3.1, 3.9, p), lowA: 1,
    carT: p < 5.05 ? -1 : clamp((p - 5.05) / 0.8, 0, 1),
  };
}

let scene = null, frames = 0;
const hook = window.__how = { get tier() { return tier; }, ready: false, get frames() { return frames; }, p: () => cur };
let target = progress(), cur = target;
markStep(target);

function toStatic(why) {
  if (tier === 'static') return;
  if (why && window.console) console.warn('how: 3D scene off (' + why + ')');
  if (scene) { scene.engine.dispose(); scene = null; }
  stageEl.classList.remove('is-live');
  tags.forEach((t) => { t.style.opacity = ''; });
  doc.classList.remove('tier-full', 'tier-light'); doc.classList.add('tier-static');
  tier = 'static';
  hook.ready = true;
}

async function loadScene() {
  const [eng, cityMod] = await Promise.all([import('./scene/engine.js'), import('./scene/city.js')]);
  if (tier === 'static') return;
  const phone = () => innerWidth < 900;
  const tmp = { x: 0, y: 0, z: 0 };
  let city = null;
  const engine = eng.createEngine({
    canvas: $('.hw-gl'), stage: stageEl, tier, fov: 36,
    onFrame: ({ dt, THREE }) => {
      frames++;
      if (!city) return false;
      // ease the drawn progress toward the scroll's
      cur += (target - cur) * (1 - Math.exp(-Math.min(0.1, dt / 1000) / 0.22));
      if (Math.abs(target - cur) < 0.0005) cur = target;
      const cam = engine.camera, W = engine.size.width, H = engine.size.height, k = camAt(cur), ph = phone();
      const dist = k.d * (ph ? 0.78 : 1), yaw = k.y * D2R, pit = k.p * D2R;
      cam.position.set(k.t[0] + Math.cos(pit) * Math.sin(yaw) * dist, k.t[1] + Math.sin(pit) * dist, k.t[2] + Math.cos(pit) * Math.cos(yaw) * dist);
      cam.lookAt(k.t[0], k.t[1], k.t[2]);
      cam.fov = ph ? k.f + 6 : k.f; cam.near = 1; cam.far = 900; cam.aspect = W / H; cam.zoom = 1;
      cam.clearViewOffset();
      cam.updateProjectionMatrix(); cam.updateMatrixWorld();
      city.apply(stateAt(cur), { c: 2, dist, phone: ph, spot: { f: 0, l: 0, fp: 0, fa: 0, lp: 0, la: 0 }, sw: 0 });
      // the two ends of the trip, named
      const show = sstep(0.05, 0.3, cur);
      [['a', city.anchors.a], ['b', city.anchors.b]].forEach(([key, v], n) => {
        const el = tags[n];
        const q = new THREE.Vector3(v.x, v.y + 1.5, v.z).project(cam);
        tmp.x = (q.x * 0.5 + 0.5) * W; tmp.y = (-q.y * 0.5 + 0.5) * H;
        // only inside the scene, and clear of its caption along the foot
        const vis = q.z < 1 && tmp.x > 24 && tmp.x < W - 24 && tmp.y > 30 && tmp.y < H - 40 ? show : 0;
        el.style.transform = `translate3d(${tmp.x.toFixed(1)}px,${tmp.y.toFixed(1)}px,0) translate(-50%, -130%)`;
        el.style.opacity = vis.toFixed(3);
      });
      return cur !== target;
    },
    onDegrade: () => { if (city) city.degrade(); engine.invalidate(); },
    onLost: () => toStatic('the graphics context was lost'),
  });
  try {
    city = cityMod.buildCity(engine, { tier, small: phone() });
    city.U.uReveal.value = 1; // the whole city at once (the home page reveals it from A as an intro)
  } catch (e) { engine.dispose(); throw e; }
  scene = { engine };
  stageEl.classList.add('is-live');
  engine.invalidate();
  hook.ready = true;
}

addEventListener('scroll', () => {
  target = progress();
  markStep(target);
  if (scene) scene.engine.invalidate(); else cur = target;
}, { passive: true });
addEventListener('resize', () => { target = progress(); if (scene) scene.engine.invalidate(); });

function afterPaint(fn) {
  const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 200));
  requestAnimationFrame(() => setTimeout(idle, 0));
}
if (tier === 'static') hook.ready = true;
else afterPaint(() => { loadScene().catch((e) => toStatic(e && e.message ? e.message : 'load failed')); });
