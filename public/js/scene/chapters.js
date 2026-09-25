// chapters.js: the scroll-driven story over the 3D city (full and light tiers).
// Ported from the prototype, proposals/redesign-2026-09/concept-4-sensor.html.
//
// THE CHAPTER CLOCK
// Every scene value is a function of one number, the chapter clock c:
//   0 to 1   the hero, until chapter 1 reaches the top of the screen
//   1 to 2   chapter 1 pinned, "The bend"
//   2 to 3   the scroll between chapters 1 and 2
//   3 to 4   chapter 2 pinned, "Three clocks"
//   4 to 5   the scroll to chapter 3: the city dissolves into South Africa
//   5 to 6   chapter 3 pinned, the metros: the pillars grow
//   6 to 7   the scroll to chapter 4, "Explore": the camera hands over to the
//            explore map (scene/explore.js), framed into the section's stage
//   7 to 8   the explore section scrolls away, the map with it, and the scene
//            fades out as "Inside the app" comes up
// stateAt(c) turns c into scene values and camAt(c) into a camera. Scrolling
// sets c; the frame loop eases a smoothed copy towards it, which gives the
// scrub its weight and lets the whole story run backwards.
//
// ALSO HERE: the pins and the panel fades; every DOM update driven by c (steps,
// rails, the stat, the clock, the day line, the count, the band rows, the HUD
// place label, the scene's fade); and the hero's scene side (band preview,
// route spotlight, pointer parallax). home.js owns what also works without the
// scene and passes a controller, ctl.
//
// RULES
//  - Numbers only ever show true values. The chapter 1 stat and the chapter 2
//    count flip from one real figure to the next; they never count through
//    the values in between. The clock is a time label and steps by 5 minutes.
//  - Figures are read from the page, where the build wrote them from the data.
//  - A panel stays fully opaque while its chapter is pinned and fades only
//    after the pin lets go.
//  - "Pause motion" (site.js) freezes what moves by itself: the idle drift,
//    the intro and the pulses. Scrolling and the visitor's own hovers and taps
//    still redraw.

import { buildExplore } from './explore.js';
import { mulberry32 } from './citygen.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const pad = (n) => String(n).padStart(2, '0');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const D2R = Math.PI / 180;
const phone = () => innerWidth < 768;

/* ---------------------------------------------------------------------------
 * Camera keyframes in chapter time. t: the point looked at; d: distance;
 * p: pitch and y: yaw in degrees; f: field of view; sx, sy: where the view
 * sits in the frame, as a share of its width and height (desktop keeps the
 * city right of the text, phones keep it above).
 * ------------------------------------------------------------------------ */
const KD = [
  { c: 0, t: [3, 0, -3], d: 132, p: 49, y: -14, f: 34, sx: 0.19, sy: 0.05 },
  { c: 1, t: [-17, 0, 16], d: 60, p: 19, y: -47, f: 40, sx: 0.17, sy: 0.07 },
  { c: 1.3, t: [-7, 0, 5], d: 66, p: 23, y: -43, f: 40, sx: 0.17, sy: 0.07 },
  { c: 1.64, t: [1, 0, -1], d: 96, p: 36, y: -33, f: 37, sx: 0.18, sy: 0.05 },
  { c: 2, t: [4, 0, -6], d: 100, p: 42, y: -25, f: 36, sx: 0.18, sy: 0.05 },
  { c: 3, t: [-2, 0, -2], d: 142, p: 64, y: -6, f: 34, sx: -0.2, sy: 0.03 },
  { c: 4, t: [0, 0, -3], d: 128, p: 58, y: 9, f: 34, sx: -0.2, sy: 0.03 },
  { c: 5, t: [4, 0, -2], d: 222, p: 52, y: 0, f: 34, sx: 0.17, sy: 0.04 },
  { c: 6, t: [6, 0, -4], d: 200, p: 47, y: 5, f: 34, sx: 0.17, sy: 0.04 },
];
const KM = [
  { c: 0, t: [0, 0, 0], d: 172, p: 56, y: -45, f: 46, sx: 0, sy: -0.2 },
  { c: 1, t: [-16, 0, 15], d: 74, p: 22, y: -45, f: 50, sx: 0, sy: -0.2 },
  { c: 1.3, t: [-6, 0, 5], d: 84, p: 27, y: -45, f: 50, sx: 0, sy: -0.2 },
  { c: 1.64, t: [0, 0, 0], d: 130, p: 42, y: -45, f: 48, sx: 0, sy: -0.2 },
  { c: 2, t: [3, 0, -4], d: 128, p: 46, y: -40, f: 48, sx: 0, sy: -0.2 },
  { c: 3, t: [0, 0, -2], d: 178, p: 66, y: -30, f: 46, sx: 0, sy: -0.21 },
  { c: 4, t: [0, 0, -2], d: 166, p: 60, y: -16, f: 46, sx: 0, sy: -0.21 },
  { c: 5, t: [2, 0, -2], d: 350, p: 60, y: 0, f: 46, sx: 0, sy: -0.25 },
  { c: 6, t: [2, 0, -2], d: 330, p: 56, y: 3, f: 46, sx: 0, sy: -0.25 },
];
const KEYS = ['d', 'p', 'y', 'f', 'sx', 'sy'];

// A cubic Hermite path through the keyframes (Catmull-Rom tangents, flat ends).
export function camAt(c, K) {
  const out = { t: [0, 0, 0] };
  c = clamp(c, K[0].c, K[K.length - 1].c);
  let i = 0;
  while (i < K.length - 2 && c > K[i + 1].c) i++;
  const k0 = K[Math.max(0, i - 1)], k1 = K[i], k2 = K[i + 1], k3 = K[Math.min(K.length - 1, i + 2)];
  const span = k2.c - k1.c || 1, u = (c - k1.c) / span, u2 = u * u, u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
  const tan = (a, b, ca, cb) => (cb - ca > 0 ? (b - a) / (cb - ca) * span : 0);
  const herm = (a0, a1, a2, a3) => {
    const m1 = i === 0 ? 0 : tan(a0, a2, k0.c, k2.c), m2 = i + 2 >= K.length ? 0 : tan(a1, a3, k1.c, k3.c);
    return h00 * a1 + h10 * m1 + h01 * a2 + h11 * m2;
  };
  KEYS.forEach((key) => { out[key] = herm(k0[key], k1[key], k2[key], k3[key]); });
  for (let j = 0; j < 3; j++) out.t[j] = herm(k0.t[j], k1.t[j], k2.t[j], k3.t[j]);
  return out;
}

/* ---------------------------------------------------------------------------
 * Chapter 2's clock covers the whole day, 05:00 round to 04:55 the next
 * morning (minutes from midnight of the first day, so 1735 is 04:55): a short
 * hold, daytime, evening (slower, it is only two hours), night, a short hold.
 * [chapter progress, minutes] pairs; clockMins and clockP are inverses.
 * ------------------------------------------------------------------------ */
const CLK = [[0, 300], [0.05, 300], [0.33, 1050], [0.53, 1170], [0.93, 1735], [1, 1735]];
export function clockMins(p) {
  for (let i = 1; i < CLK.length; i++) {
    const a = CLK[i - 1], b = CLK[i];
    if (p <= b[0]) return b[0] > a[0] ? lerp(a[1], b[1], (p - a[0]) / (b[0] - a[0])) : b[1];
  }
  return CLK[CLK.length - 1][1];
}
export function clockP(m) {
  // the two ends land in the middle of their holds, clear of any rounding
  if (m <= 300) return CLK[1][0] / 2;
  if (m >= 1735) return (CLK[4][0] + 1) / 2;
  for (let i = 2; i < CLK.length - 1; i++) {
    const a = CLK[i - 1], b = CLK[i];
    if (m <= b[1]) return lerp(a[0], b[0], (m - a[1]) / (b[1] - a[1]));
  }
  return CLK[CLK.length - 2][0];
}

export function initChapters({ engine, city, ctl }) {
  const G = window.gsap, ST = window.ScrollTrigger;
  const T = engine.THREE, cam = engine.camera, doc = document.documentElement;
  const full = engine.tier === 'full';
  const cleanup = [];
  let xp = null, ewWas = 0, resizeAt = -1e9; // the explore map in the scene, once data/geo.json is in (scene/explore.js)
  // Leaving the explore section upward drops the pick, but not in the moment
  // after a resize (a phone's toolbar coming back is one): the refresh can dip
  // the clock out of the section until the hold puts it back. Checked again
  // once that has settled, so a reader who really left still loses it.
  function leaveHome() {
    const ex = ctl.ex, wait = 1500 - (performance.now() - resizeAt);
    if (wait <= 0) { ex.home(true); return; }
    setTimeout(() => { if (!killed && !ex.act && cT < 6.55) ex.home(true); }, wait + 100);
  }
  const exRoot = $('#explore');
  const on = (target, type, fn, opts) => { target.addEventListener(type, fn, opts); cleanup.push(() => target.removeEventListener(type, fn, opts)); };
  const inv = () => engine.invalidate();
  const tw = (target, vars) => G.to(target, Object.assign({ onUpdate: inv }, vars));
  // The native position, not lenis.scroll: ScrollTrigger can hear a native
  // scroll (a jump to #faq on load) before Lenis has synced its copy.
  const scrollNow = () => window.scrollY;
  const goY = (y) => (window.lenis ? window.lenis.scrollTo(y, { duration: 1.2 }) : window.scrollTo({ top: y, behavior: 'smooth' }));

  let cT = 0, cS = 0, drift = 0, driftAmp = full ? 1 : 0, lastKey = '';
  let paused = doc.classList.contains('motion-paused');
  const intro = { dolly: 1, fast: 0, low: 0, tags: 0 };
  const PV = { b: ctl.pv.t };                                    // eased band for the hero preview
  const SP = { f: 0, l: 0, fp: -1, fa: 0, lp: -1, la: 0 };       // eased spotlight values
  const PP = { x: 0, y: 0 };                                     // eased pointer, for parallax

  /* --- choreography: every scene value is a function of c --- */
  function stateAt(c) {
    const s = {};
    const heroFade = 1 - sstep(0.28, 0.8, c);
    s.fast = c < 1 ? intro.fast * heroFade : sstep(1.04, 1.28, c);
    s.low = c < 1 ? intro.low * heroFade : sstep(1.46, 1.72, c);
    s.pulse = sstep(1.29, 1.45, c);
    s.pulseA = sstep(1.28, 1.31, c) * (1 - sstep(1.43, 1.47, c));
    const out = 1 - sstep(4.05, 4.45, c);
    s.fastA = (c < 1.4 ? 0.82 : lerp(0.82, 0.42, sstep(1.5, 1.72, c))) * out;
    s.lowA = out;
    s.dis = sstep(4.12, 4.8, c);
    s.morph = sstep(4.3, 5.2, c);
    s.grow = sstep(5.02, 5.62, c);
    s.labels = sstep(5.3, 5.5, c);
    const live = ctl.live;
    if (c < 2.2) s.band = c < 1 ? lerp(PV.b, live, sstep(0.55, 1, c)) : live;
    else if (c < 3) s.band = lerp(live, 0, sstep(2.25, 2.85, c));
    else if (c < 4.2) { const m = clockMins(clamp(c - 3, 0, 1)); s.band = sstep(1050, 1090, m) + sstep(1170, 1215, m); }
    else s.band = 2;
    s.carT = c < 1.74 || c > 4.15 ? -1 : c < 2 ? lerp(0, 0.42, (c - 1.74) / 0.26) : lerp(0.42, 1, clamp((c - 2) / 2.05, 0, 1));
    s.coHero = intro.tags * (1 - sstep(0.06, 0.3, c));
    s.coAB = Math.max(s.coHero, sstep(1.02, 1.1, c) * (1 - sstep(2.1, 2.35, c)));
    s.coF = sstep(1.12, 1.2, c) * (1 - sstep(2.02, 2.18, c));
    s.coRR = sstep(1.29, 1.32, c) * (1 - sstep(1.43, 1.46, c));
    s.coL = sstep(1.6, 1.68, c) * (1 - sstep(2.02, 2.18, c));
    return s;
  }

  /* --- callouts: 3D anchors projected to the screen --- */
  const co = {};
  $$('#callouts .co, #spots .co').forEach((el) => { co[el.dataset.co] = el; });
  const tmp = new T.Vector3(), off = new T.Vector3();
  let W = 1, H = 1;
  function place(el, v, a) {
    if (!el) return;
    if (a < 0.01 || tmp.copy(v).project(cam).z > 1) { ctl.setTag(el, 0, 0, 0); return; }
    // never under the header and the top HUD line
    ctl.setTag(el, clamp((tmp.x * 0.5 + 0.5) * W, 12, W - 12), clamp((-tmp.y * 0.5 + 0.5) * H, W < 768 ? 120 : 108, H - 12), a);
  }

  /* --- the camera: keyframe k, leaned by yaw and pitch (degrees), its distance
   * scaled by dk, zoomed by zoom and moved dx pixels right. Returns the
   * distance. --- */
  function aim(k, yaw, pit, dk, zoom, dx, dy = 0) {
    yaw = (k.y + yaw) * D2R; pit = (k.p + pit) * D2R;
    const dist = k.d * dk;
    off.set(Math.cos(pit) * Math.sin(yaw), Math.sin(pit), Math.cos(pit) * Math.cos(yaw)).multiplyScalar(dist);
    cam.position.set(k.t[0] + off.x, k.t[1] + off.y, k.t[2] + off.z);
    cam.lookAt(k.t[0], k.t[1], k.t[2]);
    cam.fov = k.f; cam.near = 1; cam.far = 900; cam.aspect = W / H; cam.zoom = zoom;
    cam.setViewOffset(W, H, -k.sx * W - dx, -k.sy * H + dy, W, H);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
    return dist;
  }

  /* --- chapter 3 on wide screens: South Africa beside the text, not under it.
   * The desktop keyframes were tuned on the prototype, whose text starts 56 px
   * from the left. Here the text lines up with the header (--edge: 130 px at
   * 1440 wide, 370 at 1920) and the country is sized by the screen's height,
   * so the note and the Cape Town label ran over the west coast. For the three
   * poses chapter 3 holds (c 5, 5.5 and 6), take the largest zoom (at most 1)
   * and the smallest sideways move that keep every coast point, metro top and
   * metro label that is level with the panel's text clear of that text, and
   * the whole country inside the screen, within a little of the HUD frame.
   * The idle drift's sway is included. Measured once per screen size, and
   * again when the fonts arrive and after every ScrollTrigger refresh: the
   * first frame after a resize still sees the pinned section at its old width,
   * and only the refresh re-pins it. --- */
  const NOFIT = { z: 1, dx: 0 }, ch3 = $('#metros');
  let FIT = NOFIT, fitKey = '';
  const refit = () => { fitKey = ''; TAGS = null; lastKey = ''; if (xp) xp.layout(); inv(); };
  if (document.fonts) on(document.fonts, 'loadingdone', refit);
  ST.addEventListener('refresh', refit);
  cleanup.push(() => ST.removeEventListener('refresh', refit));
  function saFit() {
    const key = W + 'x' + H;
    if (key === fitKey) return FIT;
    fitKey = key;
    FIT = NOFIT;
    const panel = $('.ch-panel', ch3);
    if (W < 768 || !city.coast.length || !panel) return FIT;
    // the text's extent while the chapter is pinned (its section's top is 0 then)
    const top0 = ch3.getBoundingClientRect().top, rg = document.createRange();
    const walk = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT);
    let tr = -1, tt = Infinity, tb = -Infinity;
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      if (!n.data.trim() || n.parentElement.closest('.sr, .rail')) continue;
      rg.selectNodeContents(n);
      for (const r of rg.getClientRects()) { tr = Math.max(tr, r.right); tt = Math.min(tt, r.top - top0); tb = Math.max(tb, r.bottom - top0); }
    }
    if (tr < 0) return FIT;
    const edge = panel.getBoundingClientRect().left;
    const L = tr + 32, T0 = tt - 24, B0 = tb + 24, R = Math.min(W - 16, W - edge + 40);
    const tags = TAGS || measureTags();
    const P = [5, 5.5, 6].map((c) => camAt(c, KD)), YAW = full ? [-2.2, 0, 2.2] : [0], v = new T.Vector3();
    let best = null;
    // down to 0.3: a portrait tablet has little width beside the text
    for (let z = 1; z > 0.29; z -= 0.02) {
      let need = -Infinity, room = Infinity;
      // x0..x1 by y0..y1 on screen must keep clear of the text and inside R
      const box = (x0, x1, y0, y1) => {
        room = Math.min(room, R - x1);
        need = Math.max(need, 16 - x0, y1 > T0 && y0 < B0 ? L - x0 : -Infinity);
      };
      for (const k of P) for (const yaw of YAW) {
        aim(k, yaw, 0, 1, z, 0);
        const at = (p) => { v.copy(p).project(cam); return [(v.x * 0.5 + 0.5) * W, (-v.y * 0.5 + 0.5) * H]; };
        for (const p of city.coast) { const [x, y] = at(p); box(x, x, y, y); }
        for (const t of tags) {
          const [x, y] = at(t.v), b = labelBox(t, x, y);
          box(Math.min(x, b.x0), Math.max(x, b.x1), Math.min(y, b.y0), Math.max(y, b.y1));
        }
      }
      // move right only as far as the text needs, left only as far as the
      // frame needs and never back over the text
      best = { z, dx: need > 0 ? need : Math.max(need, Math.min(0, room)) };
      if (need <= room) break;
    }
    // nothing fits: the smallest zoom tried, text clear (labels that would
    // leave the screen then hide, in declutter)
    FIT = best || NOFIT;
    return FIT;
  }

  /* --- chapter 3: the metro labels and the list ---
   * A label shows its metro's name; the count opens under it while the label
   * is hovered, or once it is tapped or clicked (which pins it), or while the
   * metro's row in the panel's list is hovered, focused or pressed. The shown
   * metro's pillar lights up and the others dim. Labels that would overlap
   * give way (the shown one first, then the larger metros), and a label that
   * would leave the screen hides. The list holds every figure, so nothing is
   * only on hover. --- */
  let TAGS = null;
  // each label's box against its anchor, as styles.css .co-m places it (the
  // count hangs below, outside the box)
  function measureTags() {
    TAGS = city.metroTags.map((m) => {
      const e = m.el.firstElementChild, c = m.el.classList;
      return { el: m.el, k: m.el.dataset.k, v: m.v, w: e.offsetWidth, h: e.offsetHeight, nh: m.el.querySelector('.co-n').offsetHeight + 2, l: c.contains('l'), up: c.contains('up'), dn: c.contains('dn') };
    });
    return TAGS;
  }
  const labelBox = (t, x, y) => {
    const y0 = t.up ? y - t.h + 2 : t.dn ? y + 2 : y - t.h / 2;
    return t.l ? { x0: x - 14 - t.w, x1: x - 14, y0, y1: y0 + t.h } : { x0: x + 14, x1: x + 14 + t.w, y0, y1: y0 + t.h };
  };
  // Which labels show, decided at the pose without the idle drift (so a label
  // near a neighbour does not blink as the camera sways), with hysteresis: a
  // hidden label needs 12 px more room to come back than a shown one needs to
  // stay. Obstacles are the labels already kept (the shown metro's first, its
  // open count included, then the larger metros), the screen's edges and the
  // HUD's corner readouts. A count that would run into the bottom corner or off
  // the screen opens above its name instead. Returns the keys to show.
  const VIS = {};
  const hudBoxes = () => ['.hud-c.tl', '.hud-now', '.hud-c.br'].map((q) => { const e = $(q); return e && e.getClientRects().length ? e.getBoundingClientRect() : null; }).filter(Boolean)
    .map((r) => ({ x0: r.left, x1: r.right, y0: r.top, y1: r.bottom }));
  function declutter() {
    const tags = TAGS || measureTags(), shown = MS.hover || MS.pin, keep = new Set();
    const kept = hudBoxes(), v = new T.Vector3();
    const order = tags.slice().sort((a, b) => (b.k === shown) - (a.k === shown)); // stable: then by size, as the page lists them
    for (const t of order) {
      v.copy(t.v).project(cam);
      if (v.z > 1) { VIS[t.k] = false; continue; }
      const x = clamp((v.x * 0.5 + 0.5) * W, 12, W - 12), y = clamp((-v.y * 0.5 + 0.5) * H, 108, H - 12);
      const b = labelBox(t, x, y), m = VIS[t.k] ? 0 : 12, mx = 8 + m, my = 4 + m;
      let flip = false;
      if (t.k === shown) {
        // the open count hangs below the name, or above it near the bottom
        const below = { x0: b.x0, x1: b.x1, y0: b.y1, y1: b.y1 + t.nh };
        flip = below.y1 > H - 12 || kept.some((o) => below.x0 < o.x1 && o.x0 < below.x1 && below.y0 < o.y1 && o.y0 < below.y1);
        if (flip) b.y0 -= t.nh; else b.y1 += t.nh;
      }
      t.el.classList.toggle('up-n', flip);
      const ok = b.x0 >= 8 + m && b.x1 <= W - 8 - m && b.y0 >= 8 && !kept.some((o) => b.x0 < o.x1 + mx && o.x0 < b.x1 + mx && b.y0 < o.y1 + my && o.y0 < b.y1 + my);
      VIS[t.k] = ok || t.k === shown && b.x0 >= 0 && b.x1 <= W;
      if (VIS[t.k]) { keep.add(t.k); kept.push(b); }
    }
    return keep;
  }
  const MS = { hover: '', pin: '' }, HL = { _dim: 0 };
  const mLis = $$('#metros .m-list li[data-k]');
  mLis.forEach((li) => { HL[li.dataset.k] = 0; });
  function showM(which, k) {
    MS[which] = k;
    const shown = MS.hover || MS.pin;
    city.metroTags.forEach((m) => m.el.classList.toggle('show', m.el.dataset.k === shown));
    mBtns.forEach((b) => { const key = b.parentElement.dataset.k; b.classList.toggle('on', key === shown); b.setAttribute('aria-pressed', String(key === MS.pin)); });
    const to = { _dim: shown ? 1 : 0 };
    mLis.forEach((li) => { to[li.dataset.k] = li.dataset.k === shown ? 1 : 0; });
    G.to(HL, Object.assign(to, { duration: 0.25, ease: 'expo.out', overwrite: 'auto', onUpdate: () => { city.highlight(HL, HL._dim); lastKey = ''; inv(); } }));
    lastKey = ''; inv();
  }
  const hover = (el, k) => {
    on(el, 'pointerenter', (e) => { if (e.pointerType === 'mouse') showM('hover', k); });
    on(el, 'pointerleave', (e) => { if (e.pointerType === 'mouse' && MS.hover === k) showM('hover', ''); });
    on(el, 'click', () => showM('pin', MS.pin === k ? '' : k));
  };
  // each row of the list becomes a button
  const mBtns = mLis.map((li) => {
    const b = document.createElement('button'), k = li.dataset.k;
    b.type = 'button'; b.className = 'mb'; b.setAttribute('aria-pressed', 'false');
    b.append(...li.childNodes); li.append(b); li.classList.add('hm');
    hover(b, k);
    // preview on keyboard focus only: a tap focuses the button too, and would
    // leave the preview on after a second tap unpins it
    on(b, 'focus', () => { let kb = true; try { kb = b.matches(':focus-visible'); } catch (e) { /* older browsers */ } if (kb) showM('hover', k); });
    on(b, 'blur', () => { if (MS.hover === k) showM('hover', ''); });
    return b;
  });
  city.metroTags.forEach((m) => hover(m.el.firstElementChild, m.el.dataset.k));
  on(document, 'keydown', (e) => { if (e.key === 'Escape' && (MS.pin || MS.hover)) { MS.hover = ''; showM('pin', ''); } });

  /* --- the frame (engine onFrame): returns true while anything changed --- */
  function frame({ dt }) {
    // faded out below the chapters: nothing to draw, so report idle and let
    // the loop stop (updateUI starts it again when the scene comes back)
    if (!ui.live) return false;
    const s1 = Math.min(0.1, dt / 1000);
    cS += (cT - cS) * (1 - Math.exp(-s1 / 0.11));
    if (Math.abs(cT - cS) < 0.0004) cS = cT;
    if (!paused) {
      // the idle drift: a slow sway while nobody is scrolling (full tier only)
      const vel = window.lenis ? Math.abs(window.lenis.velocity || 0) : 0;
      const want = full && vel < 0.2 && (cS < 6.2 || (xp && cS > 6.99 && xp.idle())) ? 1 : 0;
      driftAmp += (want - driftAmp) * (1 - Math.exp(-s1 / 0.6));
      if (driftAmp > 0.001) drift += s1;
    }
    W = engine.size.width; H = engine.size.height;
    const hw = 1 - sstep(0.4, 0.9, cS), sw = 1 - sstep(0.2, 0.5, cS);
    // the explore map: how far it has taken over, and past the section's top,
    // how far it has scrolled up with it
    const ew = xp ? sstep(6, 7, cS) : 0, trk = xp && cT > 6.5 ? clamp(scrollNow() - exST.start, 0, exST.end - exST.start) : 0;
    const key = [cS.toFixed(4), driftAmp.toFixed(3), driftAmp > 0.001 ? drift.toFixed(2) : '', PP.x.toFixed(4), PP.y.toFixed(4),
      city.U.uReveal.value.toFixed(3), intro.dolly.toFixed(3), intro.fast.toFixed(3), intro.low.toFixed(3), intro.tags.toFixed(2),
      W, H, ctl.live, PV.b.toFixed(3), SP.f.toFixed(3), SP.l.toFixed(3), SP.fp.toFixed(3), SP.lp.toFixed(3), SP.fa.toFixed(2), SP.la.toFixed(2), ctl.spot, Math.round(trk)].join('|');
    if (key === lastKey) return false;
    lastKey = key;
    const s = stateAt(cS), k = camAt(Math.min(cS, 6), W < 768 ? KM : KD);
    if (ew > 0) { const e = xp.curCam(); KEYS.forEach((q) => { k[q] = lerp(k[q], e[q], ew); }); for (let j = 0; j < 3; j++) k.t[j] = lerp(k.t[j], e.t[j], ew); }
    // camera: the keyframe, plus the drift, the intro dolly and the parallax
    // lean, and on wide screens the chapter 3 fit, eased in as the city turns
    // into the country
    const fw = W < 768 ? 0 : sstep(4.3, 4.9, cS) * (1 - ew), fit = fw > 0 ? saFit() : NOFIT;
    const ml = W < 768 ? 0 : s.labels * (1 - sstep(6.05, 6.4, cS)), lean = [-PP.x * 5 * hw, 7 * intro.dolly + PP.y * 5 * hw, 1 + 0.24 * intro.dolly, lerp(1, fit.z, fw), fit.dx * fw];
    // chapter 3's labels: which show is decided without the drift (declutter)
    let keep = null;
    if (ml > 0.01) { aim(k, lean[0], lean[1], lean[2], lean[3], lean[4]); keep = declutter(); }
    const dist = aim(k, Math.sin(drift * Math.PI * 2 / 12) * 2.2 * driftAmp + lean[0], lean[1], lean[2], lean[3], lean[4], trk);
    city.apply(s, { c: cS, dist, phone: W < 768, spot: SP, sw });
    if (xp) {
      xp.uniforms(ew, s.grow, dist, trk);
      // handing the pillars back: chapter 3's highlight is theirs again
      if (ew === 0 && ewWas > 0) city.highlight(HL, HL._dim);
      ewWas = ew;
    }
    const A = city.anchors;
    place(co.a, A.a, s.coAB); place(co.b, A.b, s.coAB);
    place(co.hf, A.hf, s.coHero * intro.fast * (1 - 0.6 * SP.f));
    place(co.hl, A.hl, s.coHero * intro.low * (1 - 0.6 * SP.l));
    ctl.spreadSpots();
    if (ctl.spot) ctl.placeCard();
    place(co.f, A.f, s.coF); place(co.l, A.l, s.coL);
    if (s.coRR > 0.01) A.rr.copy(city.fastC.getPointAt(clamp(s.pulse, 0.02, 0.98)));
    place(co.rr, A.rr, s.coRR);
    city.metroTags.forEach((m) => place(m.el, m.v, keep && keep.has(m.el.dataset.k) ? ml : 0));
    if (xp) xp.place();
    return true;
  }

  /* --- DOM driven by c --- */
  const stage = $('#scene'), hudLayer = $('#hud'), hudBL = $('.hud-c.bl'), hudTL = $('.hud-c.tl'), hudBR = $('.hud-c.br'), chipsEl = $('.bchips');
  const stacked = window.matchMedia('(max-width: 1023px)'); // the explore section's stacked layout (styles.css)
  const steps = $$('#bend .ch-steps li'), railBtns = $$('#bend .rail-l button');
  const rail1 = $('#bend .rail-f'), rail3 = $('#metros .rail-f');
  const statEl = $('#stat'), statTo = $('#stat-to'), statFrom = $('#stat-from').textContent, statTrue = statTo.textContent;
  const clockT = $('#clock-t'), clockB = $('#clock-b'), dlCur = $('#dl-cur'), cntN = $('#cnt-n'), cntB = $('#cnt-b'), dayl = $('#dayline');
  const bandLis = $$('#clocks .bands li');
  const NAT = bandLis.map((li) => $('b', li).textContent);         // national high-risk count per band
  const BNAME = bandLis.map((li) => $('.hud', li).textContent);    // Daytime, Evening, Night
  const BSPAN = bandLis.map((li) => $('.muted', li).textContent);  // 05:00 to 17:30, ...
  const placeEl = $('#hud-place'), PLACE = [placeEl.textContent, placeEl.dataset.alt];
  const ui = { stage: -1, band: -1, place: '', statOn: null, m: -1, fade: -1, live: true };

  // Switch a figure to another true value: the old one rises out, the new one
  // in (CSS .flip). The element's text is only ever the true value.
  function flip(el, text, old) {
    const span = el.firstElementChild, prev = old == null ? span.textContent : old;
    span.textContent = text;
    if (prev === text) return;
    el.setAttribute('data-old', prev);
    el.classList.remove('is-flip');
    void el.offsetWidth;
    el.classList.add('is-flip');
  }

  // The HUD names what the scene shows: the illustrative city, the country,
  // and on the explore map the metro picked or the Gauteng cluster.
  function placeName(c) {
    const ex = xp && c >= 6.5 ? ctl.ex : null, m = ex && ex.sel >= 0 && ex.lvl === 'metro' ? ex.M[ex.sel] : null;
    const place = c < 4.6 ? PLACE[0] : m ? m.name + ' \u00b7 ' + m.p : ex && ex.lvl === 'reg' ? REG : PLACE[1];
    if (place !== ui.place) { ui.place = place; placeEl.textContent = place; }
  }
  const REG = (($('.ex-hint') || {}).textContent || '').split(':')[0];

  function updateUI(c) {
    // chapter 1: the step in focus, the rail, the stat
    const p1 = clamp(c - 1, 0, 1);
    const stg = p1 < 0.28 ? 0 : p1 < 0.46 ? 1 : p1 < 0.74 ? 2 : 3;
    if (stg !== ui.stage) {
      ui.stage = stg;
      steps.forEach((li, i) => li.classList.toggle('on', i === stg));
      railBtns.forEach((b, i) => b.classList.toggle('on', i <= stg));
    }
    const statOn = p1 >= 0.62;
    if (statOn !== ui.statOn) {
      const first = ui.statOn === null;
      ui.statOn = statOn;
      statEl.classList.toggle('on', statOn);
      if (statOn && !first) flip(statTo, statTrue, statFrom);
    }
    rail1.style.transform = `scaleX(${p1.toFixed(4)})`;
    // chapter 2: the clock, the day line, the band in force and its count
    const m = Math.floor(clockMins(clamp(c - 3, 0, 1)) / 5) * 5;
    if (m !== ui.m) {
      ui.m = m;
      const txt = pad(Math.floor(m / 60) % 24) + ':' + pad(m % 60), b = ctl.bandOf(m % 1440);
      clockT.textContent = txt;
      dlCur.style.left = (((m - 300) / 1440) * 100).toFixed(3) + '%';
      dayl.setAttribute('aria-valuenow', m);
      dayl.setAttribute('aria-valuetext', `${txt}, ${BNAME[b].toLowerCase()} ratings`);
      if (b !== ui.band) {
        const first = ui.band < 0;
        ui.band = b;
        clockB.textContent = BNAME[b] + ' ratings';
        cntB.textContent = BNAME[b] + ' · ' + BSPAN[b];
        bandLis.forEach((li, i) => li.classList.toggle('on', i === b));
        if (first) cntN.firstElementChild.textContent = NAT[b]; else flip(cntN, NAT[b]);
      }
    }
    if (rail3) rail3.style.transform = `scaleX(${clamp(c - 5, 0, 1).toFixed(4)})`;
    placeName(c);
    // the scene holds through the explore section, and fades as it scrolls
    // away and "Inside the app" comes up (without the section: after chapter 3)
    const fade = exST ? (c < 7 ? 1 : sstep(0.3, 0.8, (8 - c) * (exST.end - exST.start) / innerHeight))
      : c < 6 ? 1 : 1 - sstep(0.35, 0.85, (scrollNow() - pins[2].end) / innerHeight);
    if (fade !== ui.fade) {
      ui.fade = fade;
      const o = fade.toFixed(3), hide = fade < 0.01 ? 'hidden' : '';
      stage.style.opacity = hudLayer.style.opacity = o;
      stage.style.visibility = hudLayer.style.visibility = hide;
      // nothing to draw once the scene has faded: stop the loop until it is back
      if (!hide !== ui.live) { ui.live = !hide; if (ui.live) { if (full) engine.start(); inv(); } else engine.stop(); }
    }
    hudBL.style.opacity = (1 - sstep(0.12, 0.5, c)).toFixed(3);
    if (exST) {
      const o = (1 - sstep(6.1, 6.5, c)).toFixed(3), sb = stacked.matches;
      hudTL.style.opacity = o; // the explore heading takes its corner
      // stacked, the list runs under the bottom corner: it gives way, and the
      // section's own Pause motion takes over under the map
      // (not while it has keyboard focus: it would drop to the page; a click
      // focuses it too, which is not what this is for)
      const fe = document.activeElement, held = hudBR.contains(fe) && fe.matches(':focus-visible');
      hudBR.style.opacity = sb && !held ? o : ''; hudBR.style.visibility = sb && !held && +o < 0.01 ? 'hidden' : '';
    }
    // the explore map answers the pointer while it is the view
    const ex = ctl.ex, act = !!ex && c >= 6.55 && fade > 0.35;
    if (ex && act !== ex.act) { ex.act = act; exRoot.classList.toggle('act', act); if (!act) { ex.hover(-1); if (c < 6.55) leaveHome(); } }
    // a panel that has faded out after its pin stops taking the pointer (it
    // stays in the page for screen readers and the keyboard; see focusin)
    chPanels.forEach((pn, i) => {
      const gone = scrollNow() > pins[i].end + innerHeight * 0.38 + 1;
      if (pn._gone !== gone) { pn._gone = gone; pn.style.pointerEvents = gone ? 'none' : ''; }
    });
    // the band chips belong to the hero: they fade as chapter 1 comes up, and
    // a preview still showing is taken back to the live band
    const cv = 1 - sstep(0.3, 0.7, c);
    chipsEl.style.opacity = cv.toFixed(3);
    chipsEl.style.visibility = cv < 0.02 ? 'hidden' : '';
    if (c >= 1 && ctl.pv.on) ctl.preview(-1, true);
  }

  /* --- the pins, and the panel fades --- */
  const chs = $$('#zone > .ch'), chPanels = chs.map((sec) => $('.ch-panel', sec));
  const LD = [2.2, 2.6, 1.7], LM = [1.5, 1.7, 1.3]; // pin length, in screen heights
  const pins = chs.map((sec, i) => ST.create({
    trigger: sec, start: 'top top', end: () => '+=' + Math.round(innerHeight * (phone() ? LM[i] : LD[i])),
    pin: true, pinSpacing: true, anticipatePin: 1,
  }));
  // Each panel stays fully opaque for its whole pin, and fades only after the
  // pin lets go, over the next 38% of a screen, so it never slides under the
  // header and HUD. (Keyed to the pin's end on purpose: a trigger on the
  // section's own bottom fires while it is still pinned.) Chapter 3's scrim
  // goes with its panel, so the map stays clear.
  const fades = chs.map((sec, i) => {
    const panel = $('.ch-panel', sec);
    return G.fromTo(i === 2 ? [panel, sec] : panel, { opacity: 1, '--sc': 1 }, {
      opacity: (n) => (n ? 1 : 0), '--sc': 0, ease: 'none', immediateRender: false,
      scrollTrigger: { start: () => pins[i].end, end: () => pins[i].end + innerHeight * 0.38, scrub: true },
    });
  });

  // The explore section extends the clock past 6 (see the top of this file);
  // the chapter 3 fit (saFit) hands the camera to the explore map on the way.
  const exST = exRoot ? ST.create({ trigger: exRoot, start: 'top top', end: 'bottom top' }) : null;
  const clockK = () => {
    const K = [0, pins[0].start, pins[0].end, pins[1].start, pins[1].end, pins[2].start, pins[2].end];
    if (exST) K.push(exST.start, exST.end);
    return K;
  };
  const cMax = () => (exST ? 8 : 6);
  function chapterC() {
    const y = scrollNow(), K = clockK();
    if (y <= 0) return 0;
    for (let i = 0; i < K.length - 1; i++) if (y < K[i + 1]) return i + clamp((y - K[i]) / Math.max(1, K[i + 1] - K[i]), 0, 1);
    return K.length - 1;
  }
  // Below the chapters, remember which section the reader is in and where,
  // so a resize can put them back (see "hold" further down).
  const flowSecs = $$('.home-flow > section');
  let lastFlow = null;
  const onScroll = () => {
    const c = chapterC();
    if (c !== cT) { cT = c; inv(); }
    updateUI(c);
    const el = c >= cMax() ? flowSecs.find((s) => s.getBoundingClientRect().bottom > 1) : null;
    lastFlow = el ? { el, off: el.getBoundingClientRect().top } : null;
  };
  const master = ST.create({ start: 0, end: 'max', onUpdate: onScroll, onRefresh: onScroll });
  on(hudBR, 'focusout', () => requestAnimationFrame(() => updateUI(cT))); // the corner held for focus can go now

  // Tabbing back into a panel that has faded after its pin brings the chapter
  // back to its middle, where the panel shows. Only when focus moved there from
  // another element: the window getting focus back (a tab switch) refocuses
  // the last button with no relatedTarget, and must not yank the page up.
  chPanels.forEach((pn, i) => on(pn, 'focusin', (e) => {
    if (!pn._gone || !e.relatedTarget) return;
    const p = pins[i], y = Math.round((p.start + p.end) / 2);
    if (window.lenis) window.lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
  }));

  /* --- chapter 1: the rail labels jump to their step --- */
  const STEP_AT = [0.14, 0.37, 0.6, 0.87];
  railBtns.forEach((b, i) => on(b, 'click', () => { const p = pins[0]; goY(p.start + STEP_AT[i] * (p.end - p.start)); }));

  /* --- chapter 2: the day line and the band rows jump to a time --- */
  let dlT = null, dlTo = 0;
  function dlGo(m) {
    // land two minutes past a five-minute step, so the clock reads that step
    m = Math.round(clamp(m, 300, 1735) / 5) * 5;
    dlT = m; clearTimeout(dlTo); dlTo = setTimeout(() => { dlT = null; }, 1300);
    const p = pins[1];
    goY(p.start + clockP(Math.min(m + 2, 1735)) * (p.end - p.start));
  }
  const DL = { role: 'slider', tabindex: '0', 'aria-label': 'Time of day', 'aria-valuemin': '300', 'aria-valuemax': '1735' };
  dayl.removeAttribute('aria-hidden');
  Object.entries(DL).forEach(([k, v]) => dayl.setAttribute(k, v));
  on(dayl, 'click', (e) => { const r = $('.dl-track', dayl).getBoundingClientRect(); dlGo(300 + ((e.clientX - r.left) / r.width) * 1440); });
  on(dayl, 'keydown', (e) => {
    const k = e.key, d = { ArrowRight: 30, ArrowUp: 30, ArrowLeft: -30, ArrowDown: -30, PageUp: 120, PageDown: -120 }[k];
    const m = d ? (dlT == null ? ui.m : dlT) + d : k === 'Home' ? 300 : k === 'End' ? 1735 : -1;
    if (m >= 0) { e.preventDefault(); dlGo(m); }
  });
  // each band row becomes a button that jumps to the middle of its band
  const bandBtns = bandLis.map((li, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'bb';
    b.append(...li.childNodes); li.append(b); li.classList.add('hb');
    const band = ctl.bands[i], len = (band.to - band.from + 1440) % 1440;
    on(b, 'click', () => dlGo(band.from + len / 2 + (band.from + len / 2 < 300 ? 1440 : 0)));
    return b;
  });

  // In-page links to a chapter land at the start of its pin (site.js would
  // stop 80 px short, which is still the scroll before the chapter).
  const PIN_OF = { bend: 0, clocks: 1, metros: 2, explore: 3 };
  on(document, 'click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    const id = a.getAttribute('href').slice(1);
    if (!(id in PIN_OF)) return;
    e.preventDefault();
    e.stopPropagation();
    goY((PIN_OF[id] === 3 ? exST || pins[2] : pins[PIN_OF[id]]).start + 2);
    history.pushState(null, '', '#' + id);
  }, true);

  /* --- the hero: band preview, route spotlight, parallax --- */
  ctl.onPreview = (instant) => {
    G.killTweensOf(PV);
    if (instant) { PV.b = ctl.pv.t; inv(); } else tw(PV, { b: ctl.pv.t, duration: 0.9, ease: 'power2.inOut' });
  };
  ctl.onSpot = (w) => {
    // the chosen route pulses once, the other fades
    tw(SP, { f: w === 'l' ? 1 : 0, l: w === 'f' ? 1 : 0, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
    if (w && !paused) {
      G.fromTo(SP, { [w + 'p']: -0.05, [w + 'a']: 1 }, { [w + 'p']: 1.05, duration: 1.1, ease: 'power2.inOut', onUpdate: inv, onComplete: () => { SP[w + 'a'] = 0; inv(); } });
    }
  };
  // Pointer parallax: the camera leans up to about 2.5 degrees toward the
  // pointer. Hero only, fine pointers only, full tier only, not while paused.
  let qx = null, qy = null;
  if (full && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    qx = G.quickTo(PP, 'x', { duration: 1.2, ease: 'power3', onUpdate: inv });
    qy = G.quickTo(PP, 'y', { duration: 1.2, ease: 'power3', onUpdate: inv });
    on(window, 'pointermove', (e) => {
      if (paused || e.pointerType !== 'mouse') return;
      const ok = cT < 0.9;
      qx(ok ? e.clientX / innerWidth - 0.5 : 0); qy(ok ? e.clientY / innerHeight - 0.5 : 0);
    }, { passive: true });
  }

  /* --- pause motion: freeze what moves by itself --- */
  on(document, 'tsamaya:motion', (e) => {
    paused = !!(e.detail && e.detail.paused);
    if (paused) {
      G.getTweensOf([intro, city.U.uReveal]).forEach((t) => t.progress(1));
      G.killTweensOf(PP);
      G.killTweensOf(SP, 'fp,lp,fa,la');
      SP.fa = SP.la = 0;
    }
    lastKey = '';
    inv();
  });

  /* --- the intro: the city reveals from A, the routes draw on, the tags come up --- */
  if (scrollNow() > 10 || paused) {
    city.U.uReveal.value = 1; intro.dolly = 0; intro.fast = intro.low = intro.tags = 1;
  } else {
    tw(city.U.uReveal, { value: 1, duration: 1.6, ease: 'power2.inOut', delay: 0.1 });
    tw(intro, { dolly: 0, duration: 3, ease: 'expo.out' });
    tw(intro, { fast: 1, duration: 0.9, ease: 'power2.inOut', delay: 1.25 });
    tw(intro, { low: 1, duration: 1.3, ease: 'power3.inOut', delay: 1.75 });
    tw(intro, { tags: 1, duration: 0.5, ease: 'power2.out', delay: 2.9 });
  }

  // Triggers made before the pins existed (site.js's headline reveals) must
  // be measured after them, in page order.
  if (ST.sort) ST.sort();
  ST.refresh();

  // A resize changes every pin's length. Hold the reader's place across it:
  // the same moment of the story while in the chapters, the same section
  // offset below them.
  // (Taken from the last scroll update: by the resize event the page has
  // already reflowed, and by ScrollTrigger's refresh it is unpinned too.)
  let hold = null;
  const yAt = (c) => {
    const K = clockK(), i = Math.min(K.length - 2, Math.floor(c));
    return K[i] + (c - i) * (K[i + 1] - K[i]);
  };
  on(window, 'resize', () => {
    // (and the explore map keeps its pick: the refresh measures the old scroll
    // against the new pins, and the clock can dip out of the section until the
    // hold puts it back)
    const t = resizeAt = performance.now();
    hold = window.scrollY < 2 ? null : cT < cMax() ? { c: cT, t } : lastFlow && { el: lastFlow.el, off: lastFlow.off, t };
  });
  const onRefreshed = () => {
    // only a refresh that follows the resize (phones skip some, see site.js)
    if (!hold || performance.now() - hold.t > 1500) { hold = null; return; }
    const y = hold.el ? hold.el.getBoundingClientRect().top + window.scrollY - hold.off : yAt(hold.c);
    hold = null;
    if (Math.abs(y - window.scrollY) < 1) return;
    if (window.lenis) { window.lenis.resize(); window.lenis.scrollTo(y, { immediate: true, force: true }); } else window.scrollTo(0, y);
    ST.update();
  };
  ST.addEventListener('refresh', onRefreshed);
  cleanup.push(() => ST.removeEventListener('refresh', onRefreshed));
  cS = cT;
  if (full) engine.start();
  inv();

  // The explore map, once its outlines are in (home.js fetches data/geo.json
  // with the scene). Until then the list and the card work on their own.
  let killed = false;
  const invX = () => { lastKey = ''; inv(); };
  // Without them (the file failed to load) the section keeps its list and a
  // card in its own place, and no map (.ex-flat).
  const flat = (why) => {
    if (killed || !ctl.ex) return;
    if (window.console) console.warn('explore map not built', why);
    ctl.ex.wait = false; exRoot.classList.add('ex-flat'); ctl.ex.show();
  };
  if (exRoot && ctl.ex && ctl.geo) ctl.geo.then((geo) => {
    if (killed) return;
    if (!geo) { flat('no map data'); return; }
    // base: chapter 3's highlight, which the map blends from as it takes over
    const base = (k) => { const h = HL[k] || 0; return [h, 1 - 0.45 * HL._dim * (1 - h)]; };
    xp = buildExplore({ engine, city, ex: ctl.ex, geo, root: exRoot, inv: invX, paused: () => paused, mulberry32, base });
    exRoot.classList.add('gl');
    ctl.ex.gl = { sync: () => { xp.sync(); placeName(cT); }, fly: xp.fly, band: xp.band };
    ctl.ex.show();
    // a pick made before the map was built: fly to it now
    if (ctl.ex.lvl !== 'nat') xp.fly(ctl.ex.lvl, ctl.ex.sel);
    invX();
  }).catch((e) => { if (xp) { xp.kill(); xp = null; } ctl.ex.gl = null; flat(e); });

  // Undo everything, for the static tier (a lost context).
  function kill() {
    killed = true;
    if (xp) { xp.kill(); xp = null; }
    if (ctl.ex) { ctl.ex.gl = null; ctl.ex.act = true; }
    if (exRoot) exRoot.classList.remove('act', 'gl');
    if (exST) exST.kill();
    hudTL.style.opacity = hudBR.style.opacity = hudBR.style.visibility = '';
    cleanup.forEach((f) => f());
    fades.forEach((t) => { if (t.scrollTrigger) t.scrollTrigger.kill(); t.kill(); });
    master.kill();
    pins.forEach((p) => p.kill(true));
    G.killTweensOf([intro, PV, SP, PP, city.U.uReveal]);
    G.set(chPanels.concat(chs), { clearProps: 'opacity,--sc' });
    chPanels.forEach((pn) => { pn.style.pointerEvents = ''; pn._gone = undefined; });
    [stage, hudLayer, chipsEl, hudBL].forEach((el) => { el.style.opacity = ''; el.style.visibility = ''; });
    $$('#callouts .co').forEach((el) => ctl.setTag(el, 0, 0, 0));
    ['role', 'tabindex', 'aria-label', 'aria-valuemin', 'aria-valuemax', 'aria-valuenow', 'aria-valuetext'].forEach((k) => dayl.removeAttribute(k));
    dayl.setAttribute('aria-hidden', 'true');
    bandBtns.forEach((b) => { const li = b.parentElement; li.append(...b.childNodes); b.remove(); li.classList.remove('hb'); });
    mBtns.forEach((b) => { const li = b.parentElement; li.append(...b.childNodes); b.remove(); li.classList.remove('hm'); });
    G.killTweensOf(HL);
    city.metroTags.forEach((m) => m.el.classList.remove('show'));
    ctl.onPreview = ctl.onSpot = null;
  }

  return {
    frame,
    redraw() { lastKey = ''; inv(); },
    // the canvas changed size (engine onResize): the explore map's stage too
    relayout() { if (xp) xp.layout(); lastKey = ''; inv(); },
    xp: () => xp, // for tests: where a metro is on screen (xp().screen), the cluster
    // after a jump (home.js keepPlace): show the new place at once, no camera flight
    snap() { onScroll(); cS = cT; lastKey = ''; inv(); },
    c: () => cT,
    state: () => ({
      c: cT, cs: cS, band: city.U.uBand.value, reveal: city.U.uReveal.value, paused,
      clock: clockT.textContent, count: cntN.textContent, stat: statTo.textContent, statOn: ui.statOn,
      step: ui.stage, fade: ui.fade, place: placeEl.textContent,
      pins: pins.map((p) => [Math.round(p.start), Math.round(p.end)]),
      counts: city.counts, degraded: engine.degraded, zoom: cam.zoom, fit: FIT, shown: MS.hover || MS.pin, pin: MS.pin,
      ex: ctl.ex && { built: !!xp, ew: xp ? sstep(6, 7, cS) : 0, act: ctl.ex.act, lvl: ctl.ex.lvl, sel: ctl.ex.sel, hov: ctl.ex.hov, band: ctl.ex.band, card: ctl.ex.card, flying: !!xp && xp.flying() },
      labels: city.metroTags.filter((m) => m.el._a > 0).map((m) => m.el.dataset.k),
    }),
    kill,
  };
}
