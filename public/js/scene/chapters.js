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
//   6        after chapter 3 the South Africa view holds while "Inside the app"
//            scrolls over it, and the scene fades out
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
      const want = full && vel < 0.2 && cS < 6.2 ? 1 : 0;
      driftAmp += (want - driftAmp) * (1 - Math.exp(-s1 / 0.6));
      if (driftAmp > 0.001) drift += s1;
    }
    W = engine.size.width; H = engine.size.height;
    const hw = 1 - sstep(0.4, 0.9, cS), sw = 1 - sstep(0.2, 0.5, cS);
    const key = [cS.toFixed(4), driftAmp.toFixed(3), driftAmp > 0.001 ? drift.toFixed(2) : '', PP.x.toFixed(4), PP.y.toFixed(4),
      city.U.uReveal.value.toFixed(3), intro.dolly.toFixed(3), intro.fast.toFixed(3), intro.low.toFixed(3), intro.tags.toFixed(2),
      W, H, ctl.live, PV.b.toFixed(3), SP.f.toFixed(3), SP.l.toFixed(3), SP.fp.toFixed(3), SP.lp.toFixed(3), SP.fa.toFixed(2), SP.la.toFixed(2), ctl.spot].join('|');
    if (key === lastKey) return false;
    lastKey = key;
    const s = stateAt(cS), k = camAt(Math.min(cS, 6), W < 768 ? KM : KD);
    // camera: the keyframe, plus the drift, the intro dolly and the parallax lean
    const yaw = (k.y + Math.sin(drift * Math.PI * 2 / 12) * 2.2 * driftAmp - PP.x * 5 * hw) * D2R;
    const pit = (k.p + 7 * intro.dolly + PP.y * 5 * hw) * D2R, dist = k.d * (1 + 0.24 * intro.dolly);
    off.set(Math.cos(pit) * Math.sin(yaw), Math.sin(pit), Math.cos(pit) * Math.cos(yaw)).multiplyScalar(dist);
    cam.position.set(k.t[0] + off.x, k.t[1] + off.y, k.t[2] + off.z);
    cam.lookAt(k.t[0], k.t[1], k.t[2]);
    cam.fov = k.f; cam.near = 1; cam.far = 900; cam.aspect = W / H;
    cam.setViewOffset(W, H, -k.sx * W, -k.sy * H, W, H);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
    city.apply(s, { c: cS, dist, phone: W < 768, spot: SP, sw });
    const A = city.anchors;
    place(co.a, A.a, s.coAB); place(co.b, A.b, s.coAB);
    place(co.hf, A.hf, s.coHero * intro.fast * (1 - 0.6 * SP.f));
    place(co.hl, A.hl, s.coHero * intro.low * (1 - 0.6 * SP.l));
    if (ctl.spot) ctl.placeCard();
    place(co.f, A.f, s.coF); place(co.l, A.l, s.coL);
    if (s.coRR > 0.01) A.rr.copy(city.fastC.getPointAt(clamp(s.pulse, 0.02, 0.98)));
    place(co.rr, A.rr, s.coRR);
    const ml = W < 768 ? 0 : s.labels;
    city.metroTags.forEach((m) => place(m.el, m.v, ml));
    return true;
  }

  /* --- DOM driven by c --- */
  const stage = $('#scene'), hudLayer = $('#hud'), hudBL = $('.hud-c.bl'), chipsEl = $('.bchips');
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
    // the HUD names what the scene shows
    const place = PLACE[c < 4.6 ? 0 : 1];
    if (place !== ui.place) { ui.place = place; placeEl.textContent = place; }
    // after chapter 3 the scene holds, then fades as "Inside the app" covers it
    // PHASE 2: key this to the end of the explore section instead.
    const fade = c < 6 ? 1 : 1 - sstep(0.35, 0.85, (scrollNow() - pins[2].end) / innerHeight);
    if (fade !== ui.fade) {
      ui.fade = fade;
      const o = fade.toFixed(3), hide = fade < 0.01 ? 'hidden' : '';
      stage.style.opacity = hudLayer.style.opacity = o;
      stage.style.visibility = hudLayer.style.visibility = hide;
      // nothing to draw once the scene has faded: stop the loop until it is back
      if (!hide !== ui.live) { ui.live = !hide; if (ui.live) { if (full) engine.start(); inv(); } else engine.stop(); }
    }
    hudBL.style.opacity = (1 - sstep(0.12, 0.5, c)).toFixed(3);
    // the band chips belong to the hero: they fade as chapter 1 comes up, and
    // a preview still showing is taken back to the live band
    const cv = 1 - sstep(0.3, 0.7, c);
    chipsEl.style.opacity = cv.toFixed(3);
    chipsEl.style.visibility = cv < 0.02 ? 'hidden' : '';
    if (c >= 1 && ctl.pv.on) ctl.preview(-1, true);
  }

  /* --- the pins, and the panel fades --- */
  const chs = $$('#zone > .ch');
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

  // PHASE 2: the explore section extends the clock past 6 here. Push its
  // trigger's start and end onto K (6 to 7 until it reaches the top, 7 to 8
  // while it scrolls away), and key the scene fade in updateUI to c > 7.
  function chapterC() {
    const y = scrollNow();
    const K = [0, pins[0].start, pins[0].end, pins[1].start, pins[1].end, pins[2].start, pins[2].end];
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
    const el = c >= 6 ? flowSecs.find((s) => s.getBoundingClientRect().bottom > 1) : null;
    lastFlow = el ? { el, off: el.getBoundingClientRect().top } : null;
  };
  const master = ST.create({ start: 0, end: 'max', onUpdate: onScroll, onRefresh: onScroll });

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
  const PIN_OF = { bend: 0, clocks: 1, metros: 2 };
  on(document, 'click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    const id = a.getAttribute('href').slice(1);
    if (!(id in PIN_OF)) return;
    e.preventDefault();
    e.stopPropagation();
    goY(pins[PIN_OF[id]].start + 2);
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
    const K = [0, pins[0].start, pins[0].end, pins[1].start, pins[1].end, pins[2].start, pins[2].end], i = Math.min(5, Math.floor(c));
    return K[i] + (c - i) * (K[i + 1] - K[i]);
  };
  on(window, 'resize', () => {
    const t = performance.now();
    hold = window.scrollY < 2 ? null : cT < 6 ? { c: cT, t } : lastFlow && { el: lastFlow.el, off: lastFlow.off, t };
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

  // Undo everything, for the static tier (a lost context).
  function kill() {
    cleanup.forEach((f) => f());
    fades.forEach((t) => { if (t.scrollTrigger) t.scrollTrigger.kill(); t.kill(); });
    master.kill();
    pins.forEach((p) => p.kill(true));
    G.killTweensOf([intro, PV, SP, PP, city.U.uReveal]);
    G.set(chs.map((s) => $('.ch-panel', s)).concat(chs), { clearProps: 'opacity,--sc' });
    [stage, hudLayer, chipsEl, hudBL].forEach((el) => { el.style.opacity = ''; el.style.visibility = ''; });
    $$('#callouts .co').forEach((el) => ctl.setTag(el, 0, 0, 0));
    ['role', 'tabindex', 'aria-label', 'aria-valuemin', 'aria-valuemax', 'aria-valuenow', 'aria-valuetext'].forEach((k) => dayl.removeAttribute(k));
    dayl.setAttribute('aria-hidden', 'true');
    bandBtns.forEach((b) => { const li = b.parentElement; li.append(...b.childNodes); b.remove(); li.classList.remove('hb'); });
    ctl.onPreview = ctl.onSpot = null;
  }

  return {
    frame,
    redraw() { lastKey = ''; inv(); },
    // after a jump (home.js keepPlace): show the new place at once, no camera flight
    snap() { onScroll(); cS = cT; lastKey = ''; inv(); },
    c: () => cT,
    state: () => ({
      c: cT, cs: cS, band: city.U.uBand.value, reveal: city.U.uReveal.value, paused,
      clock: clockT.textContent, count: cntN.textContent, stat: statTo.textContent, statOn: ui.statOn,
      step: ui.stage, fade: ui.fade, place: placeEl.textContent,
      pins: pins.map((p) => [Math.round(p.start), Math.round(p.end)]),
      counts: city.counts, degraded: engine.degraded,
    }),
    kill,
  };
}
