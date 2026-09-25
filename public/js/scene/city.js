// city.js: builds the home page's 3D scene on the engine (engine.js). Ported
// from the prototype, proposals/redesign-2026-09/concept-4-sensor.html.
//
// WHAT IS IN THE SCENE
//  - The illustrative city (citygen.js, seed 7) as a point cloud: building
//    walls and roofs, a faint ground lattice, the streets as lines.
//  - Hex risk cells (seed 11) as one InstancedMesh; each cell carries a height
//    and a level for all three bands, and the shader blends between them, so a
//    band change is one uniform.
//  - The fastest route (dashed) and the lower-risk route (emerald, with a glow
//    tube and a band of light on the ground), each with draw-on, pulse and fade
//    uniforms, and a chevron car that drives the lower-risk one.
//  - South Africa for chapter 3: the first few thousand city points morph into
//    the country's outline, and a pillar per metro grows from its point (both
//    from sa.js, which the coverage page shares). Pillar height is rated
//    areas: coverage, never risk.
//
// Everything that changes over the story is a uniform set by apply(state, x);
// the chapter clock and the camera live in chapters.js.
//
// FIGURES. Metro points and rated areas are read from the chapter 3 SVG in the
// page (#sa-dots, written by the build from stats.json), and the country from
// its #sa-land and #sa-borders paths. Nothing here is typed in.
import { mulberry32, CITY, genCity, genCells } from './citygen.js';
import { PT_VS, PT_FS, saTargets, saW, pathPolys, buildPillars } from './sa.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

/* ---------------------------------------------------------------------------
 * Shaders. Every material fades by distance (fog) and reveals outward from the
 * start point A as uReveal runs 0 to 1. Bands blend as uBand runs 0 (daytime)
 * to 1 (evening) to 2 (night).
 * ------------------------------------------------------------------------ */
// Streets and long roads.
const RD_VS = `
attribute float aC;
uniform float uReveal, uDissolve, uFogN, uFogF, uBand;
uniform vec2 uOrigin;
varying float vA; varying float vC;
void main() {
  vec3 p = position;
  float d = length(p.xz - uOrigin) / 150.0;
  float vis = 1.0 - smoothstep(uReveal * 1.3 - 0.06, uReveal * 1.3, d);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float fog = 1.0 - smoothstep(uFogN, uFogF, -mv.z);
  vA = (0.42 + aC * 0.4) * vis * fog * (1.0 - uDissolve);
  vC = aC;
}`;
const RD_FS = `
uniform float uBand;
varying float vA; varying float vC;
void main() {
  vec3 base = mix(vec3(0.255, 0.278, 0.345), vec3(0.42, 0.46, 0.55), vC);
  vec3 tint = mix(mix(vec3(1.0, 1.03, 1.08), vec3(1.1, 1.0, 0.9), clamp(uBand, 0.0, 1.0)), vec3(0.86, 0.94, 1.12), clamp(uBand - 1.0, 0.0, 1.0));
  gl_FragColor = vec4(base * tint, vA);
}`;

// Risk cells: height and level per band in aH and aL, blended by uBand.
const CL_VS = `
attribute vec3 aH; attribute vec3 aL;
uniform float uBand, uReveal, uDissolve, uFogN, uFogF;
uniform vec2 uOrigin;
varying vec3 vCol; varying float vA; varying float vY; varying float vTop; varying float vSide;
void main() {
  float b1 = clamp(uBand, 0.0, 1.0), b2 = clamp(uBand - 1.0, 0.0, 1.0);
  float h = mix(mix(aH.x, aH.y, b1), aH.z, b2);
  float l = mix(mix(aL.x, aL.y, b1), aL.z, b2);
  vec3 c0 = vec3(instanceMatrix[3][0], 0.0, instanceMatrix[3][2]);
  float d = length(c0.xz - uOrigin) / 150.0;
  float fr = uReveal * 1.3;
  float rise = 1.0 - smoothstep(fr - 0.2, fr - 0.03, d);
  float sink = 1.0 - uDissolve;
  h *= rise * sink;
  vec3 p = position;
  p.xz *= 0.88;
  p.y *= max(h, 0.04);
  vec4 mv = modelViewMatrix * instanceMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float fog = 1.0 - smoothstep(uFogN, uFogF, -mv.z);
  vec3 cN = vec3(0.79, 0.84, 0.89), cY = vec3(0.92, 0.78, 0.27), cA = vec3(0.96, 0.62, 0.04), cR = vec3(0.94, 0.27, 0.27);
  vec3 col = l < 1.0 ? mix(cN, cY, l) : (l < 2.0 ? mix(cY, cA, l - 1.0) : mix(cA, cR, l - 2.0));
  float sat = mix(0.8, 1.0, clamp(uBand * 0.5, 0.0, 1.0));
  col = mix(vec3(dot(col, vec3(0.3, 0.59, 0.11))), col, sat);
  float act = smoothstep(0.05, 0.6, l);
  vA = mix(0.045, 0.5 + 0.08 * b2, act) * fog * rise * mix(1.0, sink, act) * (1.0 - uDissolve * (1.0 - act));
  vCol = col;
  vY = position.y;
  vTop = step(0.5, normal.y);
  vSide = 0.78 + 0.22 * dot(normalize(normal.xz + vec2(0.0001)), normalize(vec2(-0.5, 0.86)));
}`;
const CL_FS = `
varying vec3 vCol; varying float vA; varying float vY; varying float vTop; varying float vSide;
void main() {
  float k = vTop > 0.5 ? 1.3 : (0.32 + 0.68 * vY) * vSide;
  float a = vA * (vTop > 0.5 ? 1.0 : 0.9 * (0.3 + 0.7 * vY));
  gl_FragColor = vec4(vCol * k, a);
}`;

// Route tubes: draw-on (uProg), dashes, a moving pulse and a glow variant.
const RT_VS = `
varying vec2 vUv; varying float vF;
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec3 n = normalize(normalMatrix * normal);
  vF = abs(dot(n, normalize(-mv.xyz)));
  gl_Position = projectionMatrix * mv;
}`;
const RT_FS = `
uniform float uProg, uAlpha, uDash, uPulse, uPulseA, uGlow;
uniform vec3 uCol, uPc;
varying vec2 vUv; varying float vF;
void main() {
  if (vUv.x > uProg || uAlpha < 0.003) discard;
  if (uDash > 0.0 && fract(vUv.x * uDash) > 0.56) discard;
  float head = (1.0 - smoothstep(0.0, 0.03, uProg - vUv.x)) * (1.0 - step(0.999, uProg));
  float pulse = (1.0 - smoothstep(0.0, 0.04, abs(vUv.x - uPulse))) * uPulseA;
  vec3 c = mix(uCol, uPc, pulse) + head * 0.45;
  float a = uGlow > 0.5 ? pow(vF, 2.0) * 0.32 * uAlpha : uAlpha * (0.6 + 0.4 * vF);
  gl_FragColor = vec4(c, clamp(a + pulse * 0.5 * uAlpha, 0.0, 1.0));
}`;

// The band of light on the ground under the lower-risk route.
const BD_VS = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const BD_FS = `
uniform float uProg, uAlpha; uniform vec3 uGo; varying vec2 vUv;
void main() {
  if (vUv.x > uProg) discard;
  float x = (vUv.y - 0.5) * 2.0;
  gl_FragColor = vec4(uGo, exp(-x * x * 6.0) * 0.2 * uAlpha);
}`;

/* ---------------------------------------------------------------------------
 * The build. tier 'full' or 'light'; small: a phone-sized screen at load.
 * ------------------------------------------------------------------------ */
export function buildCity(engine, { tier, small }) {
  const T = engine.THREE, scn = engine.scene, renderer = engine.renderer;
  const light = tier === 'light';
  const NPTS = light ? 20000 : small ? 42000 : 70000;
  const NSA = light ? 2500 : 6000;
  const HEXR = light ? 4.1 : 2.65;

  const U = {
    uReveal: { value: 0 }, uBand: { value: 0 }, uDissolve: { value: 0 }, uMorph: { value: 0 },
    uPx: { value: renderer.getPixelRatio() }, uOrigin: { value: new T.Vector2(CITY.A[0], CITY.A[1]) }, uFogN: { value: 120 }, uFogF: { value: 320 },
  };

  /* --- city point cloud: points on building walls and roofs --- */
  const city = genCity(7);
  const R = mulberry32(99);
  function buildPoints(N) {
    let W = 0;
    const ws = city.boxes.map((b) => { const w = b[2] - b[0], d = b[3] - b[1]; const a = w * d * 0.8 + 2 * (w + d) * b[4]; W += a; return a; });
    const pos = new Float32Array(N * 3);
    let k = 0;
    city.boxes.forEach((b, bi) => {
      const n = Math.round(N * ws[bi] / W);
      const x0 = b[0], z0 = b[1], x1 = b[2], z1 = b[3], h = b[4], w = x1 - x0, d = z1 - z0;
      const top = w * d * 0.8, side = 2 * (w + d) * h, rows = Math.max(2, Math.round(h / 0.45));
      for (let i = 0; i < n && k < N; i++, k++) {
        let x, y, z;
        const r = R();
        if (r < 0.14) {
          if (R() < 0.45) { x = R() < 0.5 ? x0 : x1; z = R() < 0.5 ? z0 : z1; y = R() * h; }
          else { const t = R(), e = (R() * 4) | 0; y = h; if (e === 0) { x = x0 + t * w; z = z0; } else if (e === 1) { x = x0 + t * w; z = z1; } else if (e === 2) { x = x0; z = z0 + t * d; } else { x = x1; z = z0 + t * d; } }
        } else if (R() * (top + side) < top) { x = x0 + R() * w; z = z0 + R() * d; y = h; }
        else {
          y = (Math.floor(R() * rows) + 0.5) * h / rows;
          const q = R() * 2 * (w + d);
          if (q < w) { x = x0 + q; z = z0; } else if (q < 2 * w) { x = x0 + q - w; z = z1; } else if (q < 2 * w + d) { x = x0; z = z0 + q - 2 * w; } else { x = x1; z = z0 + q - 2 * w - d; }
        }
        pos[k * 3] = x; pos[k * 3 + 1] = y; pos[k * 3 + 2] = z;
      }
    });
    // shuffle, so dropping the second half (degrade) thins evenly
    for (let i = k - 1; i > 0; i--) { const j = (R() * (i + 1)) | 0; for (let c = 0; c < 3; c++) { const t = pos[i * 3 + c]; pos[i * 3 + c] = pos[j * 3 + c]; pos[j * 3 + c] = t; } }
    return { pos: pos.subarray(0, k * 3), n: k };
  }
  const P = buildPoints(NPTS);
  // the first points double as South Africa: each gets a target and a kind
  const tgt = new Float32Array(P.n * 3), meta = new Float32Array(P.n * 2);
  const attr = (id, a) => { const e = document.getElementById(id); return e ? e.getAttribute(a) : ''; };
  const sa = saTargets(NSA, attr('sa-land', 'd'), attr('sa-borders', 'd'));
  for (let i = 0; i < P.n; i++) {
    meta[i * 2 + 1] = R();
    if (i < sa.length) {
      const w = saW(sa[i][0], sa[i][1]);
      tgt[i * 3] = w[0]; tgt[i * 3 + 1] = 0; tgt[i * 3 + 2] = w[1];
      meta[i * 2] = sa[i][2];
      meta[i * 2 + 1] = clamp((sa[i][0] / 1000) * 0.7 + R() * 0.3, 0, 1);
    } else { tgt[i * 3] = P.pos[i * 3]; tgt[i * 3 + 1] = P.pos[i * 3 + 1]; tgt[i * 3 + 2] = P.pos[i * 3 + 2]; }
  }
  // every fifth coast point (Lesotho's outline included; a few pixels apart on
  // screen), where the morph puts it: chapters.js fits the country beside the
  // chapter 3 text on wide screens
  const coast = [];
  sa.forEach((p, i) => { if (p[2] === 2 && i % 5 === 0) { const w = saW(p[0], p[1]); coast.push(new T.Vector3(w[0], 0, w[1])); } });
  const pg = new T.BufferGeometry();
  pg.setAttribute('position', new T.BufferAttribute(P.pos, 3));
  pg.setAttribute('aTarget', new T.BufferAttribute(tgt, 3));
  pg.setAttribute('aMeta', new T.BufferAttribute(meta, 2));
  const pointMat = (alpha, size, extra) => new T.ShaderMaterial({ vertexShader: PT_VS, fragmentShader: PT_FS, transparent: true, depthWrite: false, uniforms: Object.assign({}, U, { uAlpha: { value: alpha }, uSize: { value: size } }, extra) });
  const pts = new T.Points(pg, pointMat(0.78, 1.7));
  pts.frustumCulled = false; scn.add(pts);

  /* --- ground lattice --- */
  const gl = [];
  for (let x = -54; x <= 54; x += 2.4) for (let z = -54; z <= 54; z += 2.4) gl.push(x, 0, z);
  const gg = new T.BufferGeometry();
  gg.setAttribute('position', new T.Float32BufferAttribute(gl, 3));
  gg.setAttribute('aTarget', new T.Float32BufferAttribute(gl, 3));
  gg.setAttribute('aMeta', new T.Float32BufferAttribute(new Array(gl.length / 3 * 2).fill(0), 2));
  const ground = new T.Points(gg, pointMat(0.32, 1.3));
  ground.frustumCulled = false; scn.add(ground);

  /* --- roads --- */
  const rp = [], rc = [];
  city.segs.forEach((s) => { rp.push(s[0], 0.03, s[1], s[2], 0.03, s[3]); rc.push(0, 0); });
  city.polys.forEach((p) => { const c = p.cls === 1 ? 1 : p.cls === 2 ? 0.8 : 0.45; for (let k = 1; k < p.pts.length; k++) { rp.push(p.pts[k - 1][0], 0.04, p.pts[k - 1][1], p.pts[k][0], 0.04, p.pts[k][1]); rc.push(c, c); } });
  const rg = new T.BufferGeometry();
  rg.setAttribute('position', new T.Float32BufferAttribute(rp, 3));
  rg.setAttribute('aC', new T.Float32BufferAttribute(rc, 1));
  const roads = new T.LineSegments(rg, new T.ShaderMaterial({ vertexShader: RD_VS, fragmentShader: RD_FS, transparent: true, depthWrite: false, uniforms: U }));
  roads.frustumCulled = false; scn.add(roads);

  /* --- risk cells --- */
  const cells = genCells(HEXR, 11);
  const hexG = new T.CylinderGeometry(HEXR, HEXR, 1, 6, 1, false); hexG.translate(0, 0.5, 0);
  const aH = new Float32Array(cells.length * 3), aL = new Float32Array(cells.length * 3);
  let active = 0;
  cells.forEach((c, i) => { for (let b = 0; b < 3; b++) { aH[i * 3 + b] = c[2][b]; aL[i * 3 + b] = c[3][b]; } if (c[3][0] + c[3][1] + c[3][2] > 0) active++; });
  hexG.setAttribute('aH', new T.InstancedBufferAttribute(aH, 3));
  hexG.setAttribute('aL', new T.InstancedBufferAttribute(aL, 3));
  const cellMesh = new T.InstancedMesh(hexG, new T.ShaderMaterial({ vertexShader: CL_VS, fragmentShader: CL_FS, transparent: true, depthWrite: false, uniforms: U }), cells.length);
  const mtx = new T.Matrix4();
  cells.forEach((c, i) => { mtx.makeTranslation(c[0], 0, c[1]); cellMesh.setMatrixAt(i, mtx); });
  cellMesh.frustumCulled = false; scn.add(cellMesh);

  /* --- the two routes, the band of light, the car --- */
  const v3 = (p, y) => new T.Vector3(p[0], y, p[1]);
  const fastC = new T.CatmullRomCurve3(CITY.FAST.map((p) => v3(p, 0.5)), false, 'catmullrom', 0.5);
  const lowC = new T.CatmullRomCurve3(CITY.LOW.map((p) => v3(p, 0.7)), false, 'catmullrom', 0.5);
  const GO = new T.Color('#34D399'), WHITE = new T.Color(1, 1, 1), MINT = new T.Color(0.8, 1, 0.9);
  const routeMat = (col, extra) => new T.ShaderMaterial({
    vertexShader: RT_VS, fragmentShader: RT_FS, transparent: true, depthWrite: false,
    uniforms: Object.assign({ uProg: { value: 0 }, uAlpha: { value: 1 }, uDash: { value: 0 }, uPulse: { value: -1 }, uPulseA: { value: 0 }, uGlow: { value: 0 }, uCol: { value: new T.Color(col) }, uPc: { value: GO.clone() } }, extra || {}),
  });
  const fastM = routeMat('#E6EDF5', { uDash: { value: 70 } });
  scn.add(new T.Mesh(new T.TubeGeometry(fastC, 360, 0.26, 6, false), fastM));
  const lowM = routeMat('#34D399');
  scn.add(new T.Mesh(new T.TubeGeometry(lowC, 420, 0.46, 8, false), lowM));
  const glowM = routeMat('#34D399', { uGlow: { value: 1 } }); glowM.blending = T.AdditiveBlending;
  scn.add(new T.Mesh(new T.TubeGeometry(lowC, 420, 1.6, 10, false), glowM));
  const bandPts = lowC.getSpacedPoints(420), bp = [], buv = [], bi = [];
  for (let i = 0; i < bandPts.length; i++) {
    const a = bandPts[Math.max(0, i - 1)], b = bandPts[Math.min(bandPts.length - 1, i + 1)];
    const tx = b.x - a.x, tz = b.z - a.z, l = Math.hypot(tx, tz) || 1, nx = -tz / l * 4.2, nz = tx / l * 4.2;
    bp.push(bandPts[i].x + nx, 0.08, bandPts[i].z + nz, bandPts[i].x - nx, 0.08, bandPts[i].z - nz);
    buv.push(i / (bandPts.length - 1), 0, i / (bandPts.length - 1), 1);
    if (i) { const o = (i - 1) * 2; bi.push(o, o + 1, o + 2, o + 1, o + 3, o + 2); }
  }
  const bgeo = new T.BufferGeometry();
  bgeo.setAttribute('position', new T.Float32BufferAttribute(bp, 3)); bgeo.setAttribute('uv', new T.Float32BufferAttribute(buv, 2)); bgeo.setIndex(bi);
  const bandM = new T.ShaderMaterial({ vertexShader: BD_VS, fragmentShader: BD_FS, transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, uniforms: { uProg: { value: 0 }, uAlpha: { value: 1 }, uGo: { value: GO } } });
  scn.add(new T.Mesh(bgeo, bandM));
  const sh = new T.Shape(); sh.moveTo(0, 1.9); sh.lineTo(1.3, -1.3); sh.lineTo(0, -0.55); sh.lineTo(-1.3, -1.3); sh.closePath();
  const carG = new T.ShapeGeometry(sh); carG.rotateX(-Math.PI / 2);
  const car = new T.Mesh(carG, new T.MeshBasicMaterial({ color: 0x6EE7B7, transparent: true, depthWrite: false, side: T.DoubleSide }));
  car.visible = false; scn.add(car);

  /* --- metro pillars (coverage size, never risk), from the chapter 3 figure's dots --- */
  const pillars = buildPillars(T, scn, Array.from(document.querySelectorAll('#sa-dots circle')).map((c) => ({ k: c.dataset.k, x: +c.getAttribute('cx'), y: +c.getAttribute('cy'), z: +c.dataset.z })));
  const { metros, mTop, pH, PU, aX, aXv } = pillars;

  /* --- anchors for the callouts (chapters.js projects them) --- */
  const anchors = {
    a: v3(CITY.A, 0.6), b: v3(CITY.B, 0.6),
    hf: fastC.getPointAt(0.64), hl: lowC.getPointAt(0.36),
    f: fastC.getPointAt(0.62), l: lowC.getPointAt(0.34), rr: new T.Vector3(),
  };
  // metro labels: the callout's data-k names the metro, data-lift how far up
  // its pillar the label sits
  const metroTags = Array.from(document.querySelectorAll('#callouts [data-k]')).map((el) => {
    const i = metros.findIndex((m) => m.k === el.dataset.k);
    return i < 0 ? null : { el, v: mTop[i].clone().setY(pH[i] * (+el.dataset.lift || 1)) };
  }).filter(Boolean);

  /* --- per-frame state --- */
  const bgD = new T.Color('#0B1323'), bgE = new T.Color('#100F1A'), bgN = new T.Color('#070B17'), bgP = new T.Color('#0A0F1C'), bg = new T.Color();
  const fu = fastM.uniforms, lu = lowM.uniforms, gu = glowM.uniforms, bu = bandM.uniforms;
  // s: stateAt(c) from chapters.js. x: { c (smoothed clock), dist (camera
  // distance), phone, spot (the hero spotlight's eased values), sw (how much of
  // the spotlight still applies) }.
  function apply(s, x) {
    const sp = x.spot;
    U.uBand.value = s.band; U.uDissolve.value = s.dis; U.uMorph.value = s.morph;
    U.uFogN.value = x.dist * 0.8; U.uFogF.value = x.dist * 2.4;
    const zs = x.dist / (x.phone ? 330 : 200);
    PU.uZ.value = clamp(zs, 0.1, 1); PU.uHs.value = clamp(zs, 0.3, 1);
    fu.uProg.value = s.fast; fu.uAlpha.value = s.fastA * (1 - 0.75 * sp.f * x.sw);
    if (x.c < 1) { fu.uPulse.value = sp.fp; fu.uPulseA.value = sp.fa * x.sw; fu.uPc.value.copy(WHITE); }
    else { fu.uPulse.value = s.pulse * 1.04 - 0.02; fu.uPulseA.value = s.pulseA; fu.uPc.value.copy(GO); }
    lu.uProg.value = gu.uProg.value = bu.uProg.value = s.low;
    lu.uAlpha.value = gu.uAlpha.value = bu.uAlpha.value = s.lowA * (1 - 0.75 * sp.l * x.sw);
    lu.uPulse.value = gu.uPulse.value = sp.lp; lu.uPulseA.value = gu.uPulseA.value = sp.la * x.sw;
    lu.uPc.value.copy(MINT); gu.uPc.value.copy(MINT);
    pillars.update(s.grow);
    if (s.carT >= 0) {
      const t = clamp(s.carT, 0, 0.999), p = lowC.getPointAt(t), tg = lowC.getTangentAt(t);
      car.position.set(p.x, 1.1, p.z); car.rotation.y = Math.atan2(-tg.x, -tg.z); car.visible = true;
      car.material.opacity = sstep(0, 0.03, s.carT) * sstep(4.15, 4.0, x.c);
    } else car.visible = false;
    const b1 = clamp(s.band, 0, 1), b2 = clamp(s.band - 1, 0, 1);
    bg.copy(bgD).lerp(bgE, b1).lerp(bgN, b2).lerp(bgP, s.dis);
    renderer.setClearColor(bg, 1);
  }

  return {
    U, anchors, metroTags, fastC, coast,
    // what the explore map (scene/explore.js) builds on: the pillars (in the
    // order of the chapter 3 figure's dots, largest first), their shared
    // per-metro [highlight, brightness] attribute, the point material for a
    // metro's dot fill, and the map-to-scene projection
    pil: { metros, mTop, pH, PU, aX, aXv, pointMat, saW, pathPolys },
    apply,
    // Light metros' pillars: v maps a metro's key to 0..1 (1 is emerald, a
    // little taller and wider); dim (0..1) fades the others toward 55%. Used by
    // chapter 3's list and labels (chapters.js), and by the explore map later.
    highlight(v, dim) {
      metros.forEach((m, i) => { const h = v[m.k] || 0; aXv[i * 2] = h; aXv[i * 2 + 1] = 1 - 0.45 * dim * (1 - h); });
      aX.needsUpdate = true;
    },
    // Adaptive quality (engine onDegrade): half the points, only the cells
    // that ever carry a rating, and point sizes for the new pixel ratio.
    degrade() { pg.setDrawRange(0, Math.floor(P.n / 2)); cellMesh.count = active; U.uPx.value = renderer.getPixelRatio(); },
    counts: { points: P.n, cells: cells.length, active },
  };
}
