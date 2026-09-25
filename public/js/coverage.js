// coverage.js: the coverage page's script (an ES module, deferred, after
// site.js). The page is complete without it: the explore section is a list of
// the metros, each a link to its page.
//
// WHAT IT DOES
//  1. Picks the tier (scene/tier.js; ?tier=static|light|full for testing).
//  2. Runs the explore section (explore.js) in every tier: the list, the band
//     switch, the card, the keyboard; in the static tier with its SVG map.
//  3. Full and light tiers: at idle after first paint, loads a scene of the
//     country and its pillars (scene/country.js) inside the section, and the
//     explore map on it (scene/explore.js). The static tier never downloads
//     any of that. A failure, or a lost graphics context, falls back to it.
//
// TEST HOOK: window.__cov = { tier, ready, ex(), xp(), frames }.
import { detectTier } from './scene/tier.js';
import { initExplore } from './explore.js';

const doc = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const D2R = Math.PI / 180;
const root = $('#explore');
const forced = new URLSearchParams(location.search).get('tier');
let tier = ['static', 'light', 'full'].includes(forced) ? forced : detectTier();
doc.classList.add('tier-' + tier);

const ex = root ? initExplore({ root, tier }) : null;
const sceneEl = root && $('.ex-scene', root);
let scene = null, frames = 0;
if (ex) {
  ex.act = true; // the section is the page's map: always the view
  ex.keep = () => innerWidth < 768; // phones: the card has its place under the map
  ex.show();
}

function toStatic(why) {
  if (tier === 'static') return;
  if (why && window.console) console.warn('coverage: 3D map off (' + why + ')');
  if (scene) { scene.xp.kill(); scene.engine.dispose(); scene = null; }
  root.classList.remove('is-live'); sceneEl.classList.remove('is-live');
  doc.classList.remove('tier-full', 'tier-light'); doc.classList.add('tier-static');
  tier = 'static';
  ex.gl = null; ex.wait = false; ex.staticMap(); ex.show();
  hook.ready = true;
}

async function loadScene() {
  const geoP = fetch('data/geo.json').then((r) => { if (!r.ok) throw new Error('no map data'); return r.json(); });
  const [eng, country, xpMod, gen, geo] = await Promise.all([import('./scene/engine.js'), import('./scene/country.js'), import('./scene/explore.js'), import('./scene/citygen.js'), geoP]);
  if (!window.gsap) throw new Error('GSAP did not load');
  if (tier === 'static') return;
  const pts = Object.fromEntries(geo.metros.map((g) => [g.key, g.point]));
  const metros = ex.M.filter((m) => pts[m.k]).map((m) => ({ k: m.k, x: pts[m.k][0], y: pts[m.k][1], z: m.z }));
  const full = tier === 'full';
  let paused = doc.classList.contains('motion-paused'), drift = 0, amp = full ? 1 : 0, c = null, xp = null;
  const off = { x: 0, y: 0, z: 0 };
  // The frame: the explore map's camera, with a slow idle sway (full tier,
  // nobody using the map, motion not paused). Returns true while swaying.
  function onFrame({ dt }) {
    frames++;
    if (!xp) return false;
    const s1 = Math.min(0.1, dt / 1000), cam = engine.camera, W = engine.size.width, H = engine.size.height;
    if (!paused) { amp += ((full && xp.idle() ? 1 : 0) - amp) * (1 - Math.exp(-s1 / 0.6)); if (amp > 0.001) drift += s1; }
    const k = xp.curCam(), yaw = (k.y + Math.sin(drift * Math.PI * 2 / 12) * 2.2 * amp) * D2R, pit = k.p * D2R, dist = k.d;
    off.x = Math.cos(pit) * Math.sin(yaw) * dist; off.y = Math.sin(pit) * dist; off.z = Math.cos(pit) * Math.cos(yaw) * dist;
    cam.position.set(k.t[0] + off.x, k.t[1] + off.y, k.t[2] + off.z);
    cam.lookAt(k.t[0], k.t[1], k.t[2]);
    cam.fov = k.f; cam.near = 1; cam.far = 900; cam.aspect = W / H; cam.zoom = 1;
    cam.setViewOffset(W, H, -k.sx * W, -k.sy * H, W, H);
    cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    c.apply(dist, W < 768);
    xp.uniforms(1, 1, dist, 0);
    xp.place();
    return amp > 0.001 && !paused;
  }
  const engine = eng.createEngine({
    canvas: $('.ex-gl', root), stage: sceneEl, tier, fov: 34, onFrame,
    onResize: () => { if (xp) xp.layout(); },
    onDegrade: () => { if (c) c.degrade(); engine.invalidate(); },
    onLost: () => toStatic('the graphics context was lost'),
  });
  try {
    c = country.buildCountry(engine, { tier, geo, metros });
    xp = xpMod.buildExplore({ engine, city: c, ex, geo, root, inv: () => engine.invalidate(), paused: () => paused, mulberry32: gen.mulberry32, slot: true });
  } catch (e) { engine.dispose(); throw e; }
  scene = { engine, xp };
  root.classList.add('is-live'); sceneEl.classList.add('is-live');
  xp.layout();
  ex.gl = { sync: xp.sync, fly: xp.fly, band: xp.band };
  ex.show();
  document.addEventListener('tsamaya:motion', (e) => { paused = !!(e.detail && e.detail.paused); engine.invalidate(); });
  addEventListener('resize', () => { if (xp) xp.layout(); engine.invalidate(); });
  if (full) engine.start();
  engine.invalidate();
  hook.ready = true;
}

// Run fn at idle once the first paint is on screen (as home.js does).
function afterPaint(fn) {
  const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 200));
  requestAnimationFrame(() => setTimeout(idle, 0));
}

const hook = window.__cov = {
  get tier() { return tier; },
  ready: false,
  get frames() { return frames; },
  ex: () => ex && { lvl: ex.lvl, sel: ex.sel, hov: ex.hov, band: ex.band, card: ex.card, act: ex.act, gl: !!ex.gl, svg: !!ex.svg },
  xp: () => (scene ? scene.xp : null),
};

if (!ex) hook.ready = true;
else if (tier === 'static') { ex.staticMap(); hook.ready = true; }
else afterPaint(() => { loadScene().catch((e) => toStatic(e && e.message ? e.message : 'load failed')); });
