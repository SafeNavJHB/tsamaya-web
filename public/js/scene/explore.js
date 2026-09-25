// scene/explore.js: the explore map in the 3D scene (BUILD_PLAN section 5.1),
// ported from the prototype, proposals/redesign-2026-09/concept-4-sensor.html.
// The state lives in ../explore.js (the list, the card, the band switch); this
// module draws it and answers the pointer on the map, through ex.gl.
//
// WHAT IT ADDS TO THE SCENE (on the pillars city.js already grew)
//  - each metro's coverage outline as a flat ribbon: a crisp core and a soft
//    glow, which draws itself on when the metro is picked;
//  - a red ring at each pillar's base, its radius the square root of the
//    metro's high-risk count in the band picked. Rings compare whole metros at
//    national scale only: zoomed in, a ring sized for the country would read
//    as a zone drawn on the city, so they fade out as the camera closes in;
//  - one soft ripple from a metro's base when it is pointed at;
//  - a faint emerald field of dots inside a picked metro's outline.
// Pillar height stays rated areas (coverage), never risk. Nothing is finer than
// a whole metro.
//
// THE CAMERA. viewCam() frames a box (all of them, the Gauteng cluster, or one
// metro) into the section's stage; a flight eases the target, zooms in log
// space and lifts a little on long hops. chapters.js blends the chapter camera
// into this one as the section comes up (ew) and hands over the frame.

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const D2R = Math.PI / 180;
const NOB = [0, 1]; // no highlight: plain height, full brightness

// a metro's coverage outline as a ribbon (uProg draws it on)
const OL_VS = `
attribute vec2 aN; attribute float aS; attribute float aU;
uniform float uW;
varying float vS; varying float vU;
void main() {
  vS = aS; vU = aU;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position + vec3(aN.x, 0.0, aN.y) * aS * uW, 1.0);
}`;
const OL_FS = `
uniform float uProg, uA, uG; uniform vec3 uC;
varying float vS; varying float vU;
void main() {
  float s = abs(vS), on = step(vU, uProg);
  float head = on * (1.0 - smoothstep(0.0, 0.05, uProg - vU)) * (1.0 - step(0.999, uProg));
  float a = ((1.0 - smoothstep(0.1, 0.26, s)) + exp(-s * 3.5) * 0.55 * uG) * uA * mix(0.22, 1.0, on) + head * uA * 0.8;
  if (a < 0.004) discard;
  gl_FragColor = vec4(uC + head * 0.35, a);
}`;
// the rings: radius per band in aRB, blended by uRB; brightness from the pillar's aX
const RG_VS = `
attribute vec3 aRB; attribute vec2 aX;
uniform float uRB, uW, uA;
varying vec2 vL; varying float vR; varying float vA;
void main() {
  float R = mix(mix(aRB.x, aRB.y, clamp(uRB, 0.0, 1.0)), aRB.z, clamp(uRB - 1.0, 0.0, 1.0));
  float S = R + uW * 3.0;
  vL = position.xz * S; vR = R; vA = uA * (0.1 + 0.9 * aX.y * aX.y);
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position * S, 1.0);
}`;
const RG_FS = `
uniform float uW;
varying vec2 vL; varying float vR; varying float vA;
void main() {
  float d = length(vL);
  float a = ((1.0 - smoothstep(uW * 0.5, uW * 1.5, abs(d - vR))) * 0.62 + (1.0 - smoothstep(vR - uW, vR, d)) * 0.05) * vA;
  if (a < 0.004) discard;
  gl_FragColor = vec4(0.94, 0.3, 0.3, a);
}`;
// one soft ripple from a metro's base
const RP_VS = 'uniform float uS; varying vec2 vL; void main() { vL = position.xz * uS; gl_Position = projectionMatrix * modelViewMatrix * vec4(position * uS, 1.0); }';
const RP_FS = `
uniform float uR, uW, uA; varying vec2 vL;
void main() {
  float d = length(vL), a = ((1.0 - smoothstep(0.0, uW, abs(d - uR))) + (1.0 - smoothstep(0.0, uR, d)) * 0.15) * uA;
  if (a < 0.004) discard;
  gl_FragColor = vec4(0.2, 0.83, 0.6, a);
}`;

// slot: on phones the card has a place of its own under the map (the coverage
// page) rather than docking over the bottom of it (the home page). base(k):
// the pillar highlight [h, lit] the map blends from as it takes over (chapter
// 3's, on the home page); none on the coverage page.
export function buildExplore({ engine, city, ex, geo, root, inv, paused, mulberry32, slot = false, base = null }) {
  const T = engine.THREE, cam = engine.camera, scn = engine.scene, G = window.gsap;
  const pil = city.pil, M = ex.M, light = engine.tier === 'light';
  const stage = root.querySelector('.ex-stage'), hintEl = root.querySelector('.ex-hint'), card = root.querySelector('.ex-card'), back = root.querySelector('.ex-back'), pz = root.querySelector('.ex-pause');
  const GREY = new T.Color(0.79, 0.84, 0.89), GO = new T.Color(0.2, 0.83, 0.6);
  // list index -> pillar index, and back (the rings share the pillars' order)
  const pi = M.map((m) => pil.metros.findIndex((q) => q.k === m.k));
  const top = (i) => pil.mTop[pi[i]], ht = (i) => pil.pH[pi[i]];
  const w2s = (x, z) => [x / 0.125 + 505, z / 0.125 + 440]; // scene to map units, the inverse of city.js saW
  const byKey = Object.fromEntries(geo.metros.map((g) => [g.k || g.key, g]));
  let W = 1, H = 1, ew = 0, trk = 0, SG = null, hintOn = false;
  const ST = M.map(() => ({ hi: 0, lit: 1, draw: 1, fa: 0, rv: 0 }));
  const RB = { v: ex.band }, RP = { t: 1, i: -1 }, FL = { k: 1, a: null, b: null, arc: 0, kind: 'nat', i: -1 };
  const PM = { x: 0, y: 0, in: false, raf: 0 };
  const UW = { value: 0.5 }, UW2 = { value: 0.1 }, EXB = [], outl = [], fills = [];
  const tmp = new T.Vector3(), ray = new T.Raycaster(), ndc = new T.Vector2();
  // the stacked layout (styles.css): the map on top, the card under it; the
  // same query as the CSS, so the scrollbar's width cannot split them
  const stack = window.matchMedia('(max-width: 1023px)'), small = () => stack.matches;
  const scr = (x, y, z) => { tmp.set(x, y, z).project(cam); return [(tmp.x * 0.5 + 0.5) * W, (-tmp.y * 0.5 + 0.5) * H]; };
  const bump = () => inv();
  const cv = engine.renderer.domElement;
  // a transform that puts el at canvas pixel (x, y): its offset parent's
  // corner, or the window's for a fixed element, measured from the canvas's
  const org = (el) => { const c = cv.getBoundingClientRect(), p = el.offsetParent, o = p ? p.getBoundingClientRect() : { left: 0, top: 0 }; return [o.left - c.left, o.top - c.top]; };

  /* --- the outlines, their boxes and hit radii --- */
  const gb = { x0: 1e9, z0: 1e9, x1: -1e9, z1: -1e9 };
  M.forEach((m, i) => {
    const polys = (byKey[m.k] ? byKey[m.k].rings : []).map((r) => (r.length > 1 && (r[0][0] !== r[r.length - 1][0] || r[0][1] !== r[r.length - 1][1]) ? r.concat([r[0]]) : r));
    const B = { x0: 1e9, z0: 1e9, x1: -1e9, z1: -1e9, polys }, P = [], N = [], S = [], U = [], I = [];
    polys.forEach((r) => {
      const n = r.length, acc = [0];
      for (let k = 1; k < n; k++) acc.push(acc[k - 1] + Math.hypot(r[k][0] - r[k - 1][0], r[k][1] - r[k - 1][1]));
      const o = P.length / 3, L = acc[n - 1] || 1;
      for (let k = 0; k < n; k++) {
        // the mitre of the two segments meeting here, so the ribbon keeps its width round corners
        const a = r[k ? k - 1 : n - 2], b = r[k < n - 1 ? k + 1 : 1], c = r[k];
        let ax = a[1] - c[1], az = c[0] - a[0], bx = c[1] - b[1], bz = b[0] - c[0];
        const la = Math.hypot(ax, az) || 1, lb = Math.hypot(bx, bz) || 1; ax /= la; az /= la; bx /= lb; bz /= lb;
        let mx = ax + bx, mz = az + bz; const ml = Math.hypot(mx, mz) || 1; mx /= ml; mz /= ml;
        const sc = 1 / Math.max(0.4, mx * ax + mz * az), w = pil.saW(c[0], c[1]);
        B.x0 = Math.min(B.x0, w[0]); B.x1 = Math.max(B.x1, w[0]); B.z0 = Math.min(B.z0, w[1]); B.z1 = Math.max(B.z1, w[1]);
        P.push(w[0], 0.06, w[1], w[0], 0.06, w[1]); N.push(mx * sc, mz * sc, mx * sc, mz * sc); S.push(-1, 1); U.push(acc[k] / L, acc[k] / L);
        if (k) { const q = o + (k - 1) * 2; I.push(q, q + 1, q + 2, q + 1, q + 3, q + 2); }
      }
    });
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(P, 3)); g.setAttribute('aN', new T.Float32BufferAttribute(N, 2));
    g.setAttribute('aS', new T.Float32BufferAttribute(S, 1)); g.setAttribute('aU', new T.Float32BufferAttribute(U, 1)); g.setIndex(I);
    const o = new T.Mesh(g, new T.ShaderMaterial({ vertexShader: OL_VS, fragmentShader: OL_FS, transparent: true, depthWrite: false, blending: T.AdditiveBlending, uniforms: { uW: UW, uProg: { value: 1 }, uA: { value: 0 }, uG: { value: 0 }, uC: { value: GREY.clone() } } }));
    o.frustumCulled = false; o.renderOrder = 2; o.visible = false; scn.add(o); outl[i] = o;
    if (!polys.length) { const t = top(i); Object.assign(B, { x0: t.x - 1, x1: t.x + 1, z0: t.z - 1, z1: t.z + 1 }); }
    if (m.gt) { gb.x0 = Math.min(gb.x0, B.x0); gb.x1 = Math.max(gb.x1, B.x1); gb.z0 = Math.min(gb.z0, B.z0); gb.z1 = Math.max(gb.z1, B.z1); }
    // the hit radius: generous, but never past about half way to the nearest neighbour (tight in Gauteng)
    let nn = 1e9; M.forEach((q, j) => { if (j !== i) nn = Math.min(nn, Math.hypot(top(j).x - top(i).x, top(j).z - top(i).z)); });
    B.r = clamp(nn * 0.55, 1, 4.5);
    B.rv = (Math.max(...[[B.x0, B.z0], [B.x1, B.z0], [B.x0, B.z1], [B.x1, B.z1]].map((q) => Math.hypot(q[0] - top(i).x, q[1] - top(i).z))) / 150 + 0.1) / 1.3;
    EXB[i] = B;
  });
  const GTB = gb, g7 = M.filter((m) => m.gt).map((m) => top(m.i));
  const GTC = g7.length ? { x: g7.reduce((a, q) => a + q.x, 0) / g7.length, z: g7.reduce((a, q) => a + q.z, 0) / g7.length } : { x: 0, z: 0 };
  GTC.r = Math.max(0, ...g7.map((q) => Math.hypot(q.x - GTC.x, q.z - GTC.z))) + 2.5;

  /* --- the rings and the ripple --- */
  const plane = () => { const q = new T.PlaneGeometry(2, 2); q.rotateX(-Math.PI / 2); return q; };
  const NP = pil.metros.length, rg = plane(), rb = new Float32Array(NP * 3);
  M.forEach((m, i) => { if (pi[i] >= 0) for (let b = 0; b < 3; b++) rb[pi[i] * 3 + b] = 0.17 * Math.sqrt(m.r[b]); });
  rg.setAttribute('aRB', new T.InstancedBufferAttribute(rb, 3)); rg.setAttribute('aX', pil.aX);
  const ringM = new T.ShaderMaterial({ vertexShader: RG_VS, fragmentShader: RG_FS, transparent: true, depthWrite: false, blending: T.AdditiveBlending, uniforms: { uRB: { value: RB.v }, uW: UW2, uA: { value: 0 } } });
  const rings = new T.InstancedMesh(rg, ringM, NP), mtx = new T.Matrix4();
  pil.mTop.forEach((q, j) => { mtx.makeTranslation(q.x, 0.05, q.z); rings.setMatrixAt(j, mtx); });
  rings.frustumCulled = false; rings.renderOrder = 1; scn.add(rings);
  const ripM = new T.ShaderMaterial({ vertexShader: RP_VS, fragmentShader: RP_FS, transparent: true, depthWrite: false, blending: T.AdditiveBlending, uniforms: { uS: { value: 1 }, uR: { value: 0 }, uW: { value: 0.2 }, uA: { value: 0 } } });
  const rip = new T.Mesh(plane(), ripM); rip.frustumCulled = false; rip.visible = false; scn.add(rip);

  // faint emerald dots inside a picked metro's outline: the city's point
  // shader again (kind 4 is emerald), revealed outward from the pillar
  function buildFill(i) {
    const B = EXB[i], s0 = w2s(B.x0, B.z0), s1 = w2s(B.x1, B.z1), ext = Math.max(s1[0] - s0[0], s1[1] - s0[1]) || 1, sc = 160 / ext;
    const cw = Math.ceil((s1[0] - s0[0]) * sc) + 2, chh = Math.ceil((s1[1] - s0[1]) * sc) + 2, cv = document.createElement('canvas');
    cv.width = cw; cv.height = chh;
    const g = cv.getContext('2d', { willReadFrequently: true });
    g.setTransform(sc, 0, 0, sc, 1 - s0[0] * sc, 1 - s0[1] * sc);
    const path = new Path2D();
    B.polys.forEach((r) => r.forEach((p, k) => (k ? path.lineTo(p[0], p[1]) : path.moveTo(p[0], p[1]))));
    g.fill(path, 'evenodd');
    const px = g.getImageData(0, 0, cw, chh).data, sp = ext / (light ? 42 : 58), R = mulberry32(i + 7), pos = [], met = [];
    for (let y = s0[1], row = 0; y < s1[1]; y += sp * 0.866, row++) for (let x = s0[0] + (row % 2) * sp / 2; x < s1[0]; x += sp) {
      if (px[(Math.floor((y - s0[1]) * sc + 1) * cw + Math.floor((x - s0[0]) * sc + 1)) * 4 + 3] > 127) { const w = pil.saW(x, y); pos.push(w[0], 0.04, w[1]); met.push(4, R()); }
    }
    const fg = new T.BufferGeometry();
    fg.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); fg.setAttribute('aTarget', new T.Float32BufferAttribute(pos, 3)); fg.setAttribute('aMeta', new T.Float32BufferAttribute(met, 2));
    const f = new T.Points(fg, pil.pointMat(0, 2.1, { uMorph: { value: 1 }, uReveal: { value: 0 }, uDissolve: { value: 0 }, uOrigin: { value: new T.Vector2(top(i).x, top(i).z) } }));
    f.frustumCulled = false; f.renderOrder = 1; f.visible = false; scn.add(f); fills[i] = f;
  }

  /* --- where the map sits: the stage, in the canvas's pixels, with the section's top at the canvas's top --- */
  // (the home page's canvas fills the window; the coverage page's fills its
  // section, which can outgrow a short window: the map stays in the first screen)
  function layout() {
    W = engine.size.width; H = engine.size.height;
    const er = root.getBoundingClientRect(), sr = stage.getBoundingClientRect(), cr = cv.getBoundingClientRect(), sm = small();
    const x0 = sr.left - cr.left, x1 = sm ? sr.right - cr.left : W - 8, y0 = sm ? sr.top - er.top : 80, y1 = sm ? sr.bottom - er.top : Math.min(H, innerHeight) - 36;
    SG = { w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
    // a metro or the cluster in view is framed again for the new stage (a
    // tablet turning round can switch layouts)
    if (FL.b) FL.b = FL.kind === 'nat' ? null : viewCam(FL.kind, FL.i);
  }
  // a camera that frames a box in the stage: all of them, the cluster, or one
  // metro. Side by side, a metro or the cluster is framed into the part of the
  // stage in the window when it is picked (the coverage page's section can
  // outgrow a short window, and the list may have scrolled it up)
  function viewCam(kind, i, vis) {
    if (!SG) layout();
    const B = kind === 'nat' ? { x0: -63, z0: -55, x1: 62, z1: 55 } : kind === 'reg' ? GTB : EXB[i];
    const sm = small(), p = kind === 'nat' ? 50 : kind === 'reg' ? 54 : 58, fr = kind === 'nat' ? 0.96 : kind === 'reg' ? 0.78 : sm ? 0.8 : 0.4;
    let gh = SG.h, gy = SG.cy, gw = SG.w, gx = SG.cx;
    // a stage too narrow for the card beside a metro in its middle (1024 to
    // about 1140 px wide): the metro, or the cluster, goes left of the card's width
    const cwid = card.offsetWidth || 276;
    if (kind !== 'nat' && !sm && SG.w < 2 * (cwid + 32)) { gw = SG.w - cwid - 32; gx = SG.cx - SG.w / 2 + gw / 2; }
    if ((kind !== 'nat' || vis) && !sm) {
      const v0 = Math.max(0, -cv.getBoundingClientRect().top), a = v0 + 80, z = Math.min(H, v0 + innerHeight) - 36;
      if (z - a > 200) { gh = z - a; gy = (a + z) / 2; }
    }
    const f = sm ? 46 : 34, th = 2 * Math.tan(f * D2R / 2), ck = kind === 'metro' && sm && !slot ? 204 : 0, sh = gh - ck;
    const d = Math.max((B.x1 - B.x0) * H / (fr * gw * th), (B.z1 - B.z0) * Math.sin(p * D2R) * H / (fr * sh * th));
    return { t: [(B.x0 + B.x1) / 2, 0, (B.z0 + B.z1) / 2], d: clamp(d, 10, 400), p, y: kind === 'nat' ? 0 : kind === 'reg' ? -4 : -9, f, sx: (gx - W / 2) / W, sy: (gy - ck / 2 - H / 2) / H };
  }
  const KEYS = ['d', 'p', 'y', 'f', 'sx', 'sy'];
  // the flight: the target eased, the zoom in log space, a lift and a slight tilt mid-way on long hops
  function curCam() {
    const b = FL.kind === 'nat' && !FL.b ? viewCam('nat') : FL.b;
    if (!FL.a || FL.k >= 1) return b;
    const a = FL.a, t = FL.k, o = { t: [0, 0, 0] }, s = Math.sin(Math.PI * t);
    KEYS.forEach((q) => { o[q] = lerp(a[q], b[q], t); });
    for (let j = 0; j < 3; j++) o.t[j] = lerp(a.t[j], b.t[j], t);
    o.d = Math.exp(lerp(Math.log(a.d), Math.log(b.d), t)) + FL.arc * s;
    o.p -= 5 * s * Math.min(1, FL.arc / 30);
    return o;
  }

  /* --- the pointer on the map --- */
  function inPoly(polys, x, y) {
    let c = false;
    polys.forEach((r) => { for (let k = 0, j = r.length - 1; k < r.length; j = k++) if ((r[k][1] > y) !== (r[j][1] > y) && x < (r[j][0] - r[k][0]) * (y - r[k][1]) / (r[j][1] - r[k][1]) + r[k][0]) c = !c; });
    return c;
  }
  // an invisible cylinder round each pillar (the nearest axis wins where they
  // overlap); 99 is the Gauteng cluster at national scale; zoomed in, the ground
  // inside an outline counts too
  function pick(cx, cy) {
    ndc.set(cx / W * 2 - 1, 1 - cy / H * 2); ray.setFromCamera(ndc, cam);
    const O = ray.ray.origin, D = ray.ray.direction, tg = D.y < -1e-4 ? -O.y / D.y : -1, gx = O.x + D.x * tg, gz = O.z + D.z * tg, dd = D.x * D.x + D.z * D.z || 1;
    let best = -1, bs = 1;
    M.forEach((m, i) => {
      const c = top(i), r = EXB[i].r, t = ((c.x - O.x) * D.x + (c.z - O.z) * D.z) / dd, y = O.y + D.y * t;
      let s = y > -0.5 && y < ht(i) * pil.PU.uHs.value * 1.15 + 1 ? Math.hypot(O.x + D.x * t - c.x, O.z + D.z * t - c.z) / r : 9;
      if (tg > 0) s = Math.min(s, Math.hypot(gx - c.x, gz - c.z) / r);
      if (s < bs) { bs = s; best = i; }
    });
    if (best >= 0 || tg < 0) return best;
    if (ex.lvl === 'nat') return Math.hypot(gx - GTC.x, gz - GTC.z) < GTC.r ? 99 : -1;
    const sv = w2s(gx, gz);
    return M.findIndex((m, i) => (ex.lvl === 'reg' || i === ex.sel) && inPoly(EXB[i].polys, sv[0], sv[1]));
  }
  function hint(v) { if (v !== hintOn) { hintOn = v; hintEl.classList.toggle('is-on', v); bump(); } }
  function doHover() {
    PM.raf = 0;
    if (!ex.act || !PM.in) return;
    const h = pick(PM.x, PM.y);
    hint(h === 99);
    ex.hover(h >= 0 && h < 99 ? h : -1);
    stage.classList.toggle('pt', h >= 0);
  }
  // the pointer in the canvas's own pixels
  const at = (e) => { const o = cv.getBoundingClientRect(); return [e.clientX - o.left, e.clientY - o.top]; };
  const onMove = (e) => { if (e.pointerType === 'touch') return; [PM.x, PM.y] = at(e); PM.in = true; if (!PM.raf) PM.raf = requestAnimationFrame(doHover); };
  // leaving the map: the hover goes back to a focused row (or stays with a
  // focused card), else it ends
  const onLeave = () => {
    PM.in = false; hint(false); stage.classList.remove('pt');
    const fi = ex.btns.indexOf(document.activeElement);
    if (fi >= 0) ex.hover(fi); else if (!card.contains(document.activeElement)) ex.hover(-1);
  };
  const onClick = (e) => {
    if (!ex.act || e.target.closest('button')) return;
    const h = pick(...at(e));
    hint(false);
    if (h === 99) ex.region(); else if (h >= 0) { if (h !== ex.sel) ex.select(h); } else ex.home();
  };
  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerleave', onLeave);
  stage.addEventListener('click', onClick);

  /* --- following the state (ex.show calls sync) --- */
  let pSel = -1, pHov = -1;
  function sync() {
    const any = ex.hov >= 0 || ex.sel >= 0;
    ST.forEach((st, i) => { const on = i === ex.hov || i === ex.sel; G.to(st, { hi: on ? 1 : 0, lit: !any || on ? 1 : 0.35, duration: 0.25, ease: 'expo.out', overwrite: 'auto', onUpdate: bump }); });
    if (ex.hov >= 0 && ex.hov !== pHov && !paused()) { RP.i = ex.hov; G.fromTo(RP, { t: 0 }, { t: 1, duration: 1.1, ease: 'power2.out', overwrite: true, onUpdate: bump }); }
    pHov = ex.hov;
    if (ex.sel !== pSel) {
      if (pSel >= 0) G.to(ST[pSel], { fa: 0, draw: 1, duration: 0.3, overwrite: 'auto', onUpdate: bump });
      const i = pSel = ex.sel;
      if (i >= 0) {
        if (!fills[i]) buildFill(i);
        const st = ST[i], quick = paused();
        st.draw = st.rv = st.fa = 0;
        G.to(st, { draw: 1, duration: quick ? 0.01 : 1.3, ease: 'power2.inOut', delay: quick ? 0 : 0.15, onUpdate: bump });
        G.to(st, { rv: EXB[i].rv, duration: quick ? 0.01 : 1.4, ease: 'power2.inOut', delay: quick ? 0 : 0.35, onUpdate: bump });
        G.to(st, { fa: 0.6, duration: quick ? 0.01 : 0.5, ease: 'power2.out', delay: quick ? 0 : 0.35, onUpdate: bump });
      }
    }
    bump();
  }
  function fly(kind, i) {
    const from = curCam();
    // (all 12 too are framed into the part of the stage in the window, which
    // on a scrolled coverage page is not its first screen)
    FL.a = from; FL.kind = kind; FL.i = i; FL.b = viewCam(kind, i, true);
    const to = FL.b || viewCam('nat');
    FL.arc = Math.min(Math.hypot(to.t[0] - from.t[0], to.t[2] - from.t[2]) * 0.6, 110);
    G.killTweensOf(FL); FL.k = 0;
    // no flight while the section is not the view, or with motion paused: a cut
    G.to(FL, { k: 1, duration: ew > 0.05 && !paused() ? 1.2 : 0.01, ease: 'power3.inOut', onUpdate: bump, onComplete: () => { if (PM.in) doHover(); } });
  }
  function band(b) { G.to(RB, { v: b, duration: paused() ? 0.01 : 0.7, ease: 'expo.out', overwrite: 'auto', onUpdate: bump }); }

  /* --- per frame (chapters.js): the uniforms before render, the card and hint after --- */
  // e: how far the section has taken over (0 to 1); grow: the pillars' growth;
  // dist: the camera's distance; tk: how far the map has scrolled with the section
  function uniforms(e, grow, dist, tk) {
    ew = e; trk = tk;
    const wpp = 2 * Math.tan(cam.fov * D2R / 2) * dist / H;
    UW.value = 5 * wpp; UW2.value = 0.9 * wpp;
    const idA = lerp(0.6, 0.16, sstep(60, 200, dist));
    ST.forEach((st, i) => {
      const u = outl[i].material.uniforms, j = pi[i], bh = base ? base(M[i].k) : NOB;
      u.uA.value = ew * lerp(idA, 1, st.hi) * (0.45 + 0.55 * st.lit); u.uG.value = st.hi; u.uProg.value = st.draw;
      u.uC.value.copy(GREY).lerp(GO, st.hi); outl[i].visible = ew > 0.01;
      if (j >= 0 && ew > 0) { pil.aXv[j * 2] = lerp(bh[0], st.hi, ew); pil.aXv[j * 2 + 1] = lerp(bh[1], st.lit, ew); }
      const f = fills[i];
      if (f) { f.visible = st.fa > 0.003 && ew > 0.01; f.material.uniforms.uAlpha.value = st.fa * ew; f.material.uniforms.uReveal.value = st.rv; }
    });
    if (ew > 0) pil.aX.needsUpdate = true;
    ringM.uniforms.uRB.value = RB.v; ringM.uniforms.uA.value = ew * grow * sstep(110, 190, dist);
    rings.visible = ew > 0.01;
    rip.visible = RP.t < 1 && RP.i >= 0 && ew > 0.01;
    if (rip.visible) {
      const R = dist * 0.075 * RP.t, q = top(RP.i), u = ripM.uniforms;
      rip.position.set(q.x, 0.07, q.z); u.uR.value = R; u.uW.value = wpp * 2.5; u.uS.value = R + wpp * 4; u.uA.value = Math.pow(1 - RP.t, 1.5) * 0.9 * ew;
    }
  }
  function place() {
    if (hintOn) { const p = scr(GTC.x, 9, GTC.z), o = org(hintEl); hintEl.style.transform = `translate3d(${(p[0] - o[0]).toFixed(1)}px,${(p[1] - o[1]).toFixed(1)}px,0) translate(-50%, -100%)`; }
    const i = ex.card, sm = small(), ch = i >= 0 ? card.offsetHeight : 0;
    // phones: no room beside a metro, so the card docks along the bottom of the
    // map's stage, and the back button sits above it (or, with a slot, the card
    // keeps its own place under the map and the CSS has it)
    if (sm && slot) { card.style.transform = back.style.transform = ''; if (pz) pz.style.transform = ''; return; }
    // lifted above the card, but never under the header: on a short stage (a
    // phone on its side) they stop below it, over the card's edge
    let lift = sm && i >= 0 ? ch + 8 : 0, over = false;
    if (lift) {
      // from the stage's own height (its top meets the header at rest), so
      // scrolling the list cannot change it
      const room = stage.offsetHeight - 8 - back.offsetHeight - 4;
      if (lift > room) { lift = Math.max(0, room); over = true; }
    }
    back.style.transform = lift ? `translateY(${-lift.toFixed(1)}px)` : '';
    back.style.zIndex = over ? '7' : '';
    if (pz) { pz.style.transform = back.style.transform; pz.style.zIndex = back.style.zIndex; }
    // side by side, Back stays below the header while the list scrolls the
    // stage up (as the card does), but never past the stage's own foot, so
    // both scroll away with the section
    const sr = stage.getBoundingClientRect(), hd = document.querySelector('.site-header'), hb = (hd ? hd.getBoundingClientRect().bottom : 0) + 7;
    const backMax = Math.max(0, sr.height - back.offsetHeight - 8);
    const setBack = (dy) => { back.style.transform = dy > 0 ? `translateY(${Math.min(dy, backMax).toFixed(1)}px)` : ''; };
    if (!sm && !back.hidden) setBack(hb - sr.top);
    if (i < 0 || ew < 0.3 || !SG) return;
    const o = org(card);
    if (sm) { card.style.transform = `translate3d(${(-o[0]).toFixed(1)}px,${(SG.cy + SG.h / 2 - trk - 8 - ch - o[1]).toFixed(1)}px,0)`; return; }
    // v0..v1 is the canvas's part of the window (all of it on the home page;
    // the coverage page's canvas scrolls with its section). The card never
    // goes left of the stage (the list is there), above the header's line, or
    // past the canvas's foot.
    const cw = card.offsetWidth, m = 12, c = cv.getBoundingClientRect(), v0 = Math.max(0, -c.top), v1 = Math.min(H, innerHeight - c.top);
    const lo = Math.max(m, SG.cx - SG.w / 2), hi = Math.max(lo, W - m - cw), roof = v0 + 76, floor = v1 - 96;
    const vy = (yy) => clamp(yy, roof, Math.max(roof, floor - ch));
    const hits = (X, Y, q) => X < q[1] && X + cw > q[0] && Y < q[3] && Y + ch > q[2];
    // P: the metro's pillar, base to top, which the card must never cover.
    // A: what it would rather stay beside: a picked metro's outline, or the
    // Gauteng cluster at national scale
    const p0 = scr(top(i).x, 0, top(i).z), p1 = scr(top(i).x, ht(i) * pil.PU.uHs.value * 1.15, top(i).z);
    const P = [Math.min(p0[0], p1[0]) - 10, Math.max(p0[0], p1[0]) + 10, Math.min(p0[1], p1[1]), Math.max(p0[1], p1[1]) + 8];
    let A = P;
    const box = (pts) => { const q = [...P]; pts.forEach((u) => { q[0] = Math.min(q[0], u[0]); q[1] = Math.max(q[1], u[0]); q[2] = Math.min(q[2], u[1]); q[3] = Math.max(q[3], u[1]); }); return q; };
    const B = i === ex.sel && ex.lvl === 'metro' ? EXB[i] : ex.lvl === 'nat' && M[i].gt ? GTB : null;
    if (B) A = box([[B.x0, B.z0], [B.x1, B.z0], [B.x0, B.z1], [B.x1, B.z1]].map((q) => scr(q[0], 0, q[1])));
    // beside it (flipping side near the edges), then beside the pillar alone,
    // then below or above the pillar, then the side with more room
    const side = (q) => { let X = q[1] + 20; if (X > hi) X = q[0] - 20 - cw; return X < lo || X > hi ? null : [X, vy((q[2] + q[3]) / 2 - ch / 2)]; };
    let k = side(A);
    if (!k || hits(k[0], k[1], P)) k = side(P);
    if (!k || hits(k[0], k[1], P)) {
      const X = clamp((P[0] + P[1]) / 2 - cw / 2, lo, hi);
      k = P[3] + 14 + ch <= floor ? [X, vy(P[3] + 14)] : [X, vy(P[2] - 14 - ch)];
      if (hits(k[0], k[1], P)) k = [hi - P[1] >= P[0] - lo ? clamp(P[1] + 12, lo, hi) : clamp(P[0] - 12 - cw, lo, hi), vy((P[2] + P[3]) / 2 - ch / 2)];
      // a hover card (it takes no clicks) may cross into the text column
      // rather than cover its pillar; a pinned one never goes over the list
      if (hits(k[0], k[1], P) && i !== ex.sel) k = [clamp(P[0] - 12 - cw, m, hi), k[1]];
    }
    let [x, y] = k;
    y = Math.min(y, H - ch - 8);
    // and clear of "Back to all 12" in the stage's top corner: beside it, else
    // below it, as long as the pillar stays clear too; failing both (a narrow
    // stage), Back moves to the foot of the stage's part in the window
    if (!back.hidden) {
      const q = back.getBoundingClientRect(), bq = [q.left - c.left - 8, q.right - c.left + 8, q.top - c.top - 8, q.bottom - c.top + 8];
      if (hits(x, y, bq)) {
        const alt = [[Math.min(Math.max(bq[1], lo), hi), y], [x, bq[3]]].find(([X, Y]) => !hits(X, Y, bq) && !hits(X, Y, P) && Y + ch <= Math.max(floor, roof + ch));
        if (alt) [x, y] = alt;
        else {
          // (and never on the card: below it, if the window is that short).
          // With too little of the stage in the window for both (a short
          // window scrolled deep), Back stays put, drawn over everything, and
          // the card moves as far right as it can
          const bh = back.offsetHeight, vb = Math.min(sr.bottom, innerHeight), to = Math.max(vb - bh - 16, y + ch + c.top + 8);
          if (to + bh <= vb - 4) setBack(to - sr.top);
          else { back.style.zIndex = '7'; x = hi; }
        }
      }
    }
    card.style.transform = `translate3d(${(x - o[0]).toFixed(1)}px,${(y - o[1]).toFixed(1)}px,0)`;
  }

  function kill() {
    stage.removeEventListener('pointermove', onMove); stage.removeEventListener('pointerleave', onLeave); stage.removeEventListener('click', onClick);
    if (PM.raf) cancelAnimationFrame(PM.raf);
    G.killTweensOf([FL, RB, RP, ...ST]);
    hint(false); stage.classList.remove('pt');
    card.style.transform = ''; back.style.transform = ''; hintEl.style.transform = ''; if (pz) pz.style.transform = '';
  }

  return {
    sync, fly, band, uniforms, place, layout, curCam, viewCam, pick, kill,
    // the page scrolled (coverage): all 12, framed into the part of the stage
    // in the window after "Back to all 12", follows it, and goes back to the
    // fixed frame once the section is at the top again
    scrolled() { if (FL.kind === 'nat' && FL.b && FL.k >= 1) FL.b = cv.getBoundingClientRect().top < 0 ? viewCam('nat', -1, true) : null; },
    idle: () => ex.hov < 0 && ex.sel < 0 && ex.lvl === 'nat' && !PM.in,
    flying: () => FL.k < 1,
    // for tests: where a metro's pillar is in the window (h: share of its height)
    screen(k, h) { const i = M.findIndex((m) => m.k === k); if (i < 0) return null; const p = scr(top(i).x, ht(i) * pil.PU.uHs.value * (h == null ? 0.35 : h), top(i).z), c = cv.getBoundingClientRect(); return { x: Math.round(p[0] + c.left), y: Math.round(p[1] + c.top) }; },
    cluster() { const p = scr(GTC.x, 0, GTC.z), c = cv.getBoundingClientRect(); return { x: Math.round(p[0] + c.left), y: Math.round(p[1] + c.top) }; },
  };
}
