// sa.js: South Africa and its metro pillars in the 3D scene, shared by the
// home page (city.js morphs the illustrative city into this country for
// chapter 3) and the coverage page (country.js draws it on its own). Both hand
// the result to the explore map (explore.js).
//
// Pillar height is a metro's rated areas: coverage, never risk. Everything
// here is read from the page or the build's data, nothing is typed in.
import { mulberry32 } from './citygen.js';
import { uLight, glow } from './theme.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

/* ---------------------------------------------------------------------------
 * Shaders. Points fade by distance (fog) and reveal outward from uOrigin as
 * uReveal runs 0 to 1; bands blend as uBand runs 0 (daytime) to 2 (night).
 * ------------------------------------------------------------------------ */
// City points: kind 0 city, 1 inside South Africa, 2 its coast, 3 its borders.
export const PT_VS = `
attribute vec3 aTarget; attribute vec2 aMeta;
uniform float uReveal, uBand, uDissolve, uMorph, uPx, uAlpha, uSize, uFogN, uFogF, uLight;
uniform vec2 uOrigin;
varying vec3 vCol; varying float vA;
void main() {
  float kind = aMeta.x, rnd = aMeta.y;
  float isSA = step(0.5, kind);
  vec3 p = position;
  float d = length(p.xz - uOrigin) / 150.0;
  float fr = uReveal * 1.3;
  float vis = 1.0 - smoothstep(fr - 0.05, fr, d);
  float edge = (1.0 - smoothstep(0.0, 0.05, abs(d - fr + 0.035))) * (1.0 - step(0.999, uReveal));
  float m = clamp(uMorph * 1.8 - rnd * 0.8, 0.0, 1.0); m = m * m * (3.0 - 2.0 * m); m *= isSA;
  vec3 q = mix(p, aTarget, m);
  q.y += sin(m * 3.14159) * (5.0 + rnd * 9.0);
  float keep = mix(1.0 - uDissolve, 1.0, isSA);
  vec4 mv = modelViewMatrix * vec4(q, 1.0);
  gl_Position = projectionMatrix * mv;
  float fog = 1.0 - smoothstep(uFogN, uFogF, -mv.z);
  float b1 = clamp(uBand, 0.0, 1.0), b2 = clamp(uBand - 1.0, 0.0, 1.0);
  vec3 col = mix(mix(vec3(0.80, 0.87, 0.95), vec3(0.97, 0.82, 0.62), b1), vec3(0.55, 0.67, 0.93), b2);
  float br = mix(mix(1.0, 0.9, b1), 0.68, b2);
  float hs = 0.5 + 0.5 * clamp(p.y / 9.0, 0.0, 1.0);
  float saB = kind > 2.5 ? 0.5 : (kind > 1.5 ? 1.05 : 0.82);
  // light: dark ink on a pale ground, and what the dark scene dims (low points,
  // borders) goes toward the ground instead
  vec3 grd = vec3(0.93, 0.95, 0.97);
  vec3 colL = mix(grd, mix(mix(vec3(0.22, 0.29, 0.38), vec3(0.42, 0.30, 0.17), b1), vec3(0.19, 0.25, 0.45), b2), hs);
  vec3 saL = mix(grd, vec3(0.22, 0.28, 0.37), min(saB, 1.0));
  col = mix(mix(col * br * hs, colL, uLight), kind > 3.5 ? mix(vec3(0.3, 0.92, 0.68), vec3(0.02, 0.47, 0.34), uLight) : mix(vec3(0.79, 0.84, 0.89) * saB, saL, uLight), m);
  col += edge * mix(vec3(0.5, 0.6, 0.7), vec3(-0.12, -0.1, -0.06), uLight);
  gl_PointSize = uPx * uSize * (0.8 + 0.4 * rnd) * (1.0 + edge * 1.4) * mix(0.3 + 0.7 * keep, 1.0 + 0.25 * m, isSA);
  vA = uAlpha * vis * keep * fog;
  vCol = col;
}`;
export const PT_FS = `
varying vec3 vCol; varying float vA;
void main() { if (vA < 0.004) discard; gl_FragColor = vec4(vCol, vA); }`;

// Metro pillars: grow in order of size (aD), height from rated areas (aH).
// aX is [highlight, brightness] per metro: chapter 3's list and the explore map
// light one pillar and dim the rest.
export const PL_VS = `
attribute float aH; attribute float aD; attribute vec2 aX;
uniform float uGrow, uFade, uK, uR, uZ, uHs;
varying float vY; varying float vA; varying float vH;
void main() {
  float g = clamp(uGrow * 1.6 - aD * 0.6, 0.0, 1.0); g = 1.0 - pow(1.0 - g, 3.0);
  vec3 p = position; p.y *= aH * g * uHs * (1.0 + 0.15 * aX.x) + 0.001; p.xz *= uR * uZ * (1.0 + 0.5 * aX.x);
  vY = position.y; vA = g * uFade * uK * aX.y * (1.0 + 0.5 * aX.x); vH = aX.x;
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(p, 1.0);
}`;
export const PL_FS = `
uniform float uLight;
varying float vY; varying float vA; varying float vH;
void main() { gl_FragColor = vec4(mix(mix(vec3(0.86, 0.91, 0.97), vec3(0.2, 0.83, 0.6), vH), mix(vec3(0.27, 0.33, 0.43), vec3(0.02, 0.5, 0.37), vH), uLight), vA * (0.25 + 0.75 * pow(vY, 1.4)) * (1.0 + 0.4 * uLight)); }`;


/* ---------------------------------------------------------------------------
 * South Africa as points, from its outline and provincial borders (path data
 * in map units, 1000 x 880).
 * ------------------------------------------------------------------------ */
// M/L/H/V/Z paths, absolute or relative, as written by src/poster.mjs.
export function pathPolys(d) {
  const out = [];
  let cur = null, x = 0, y = 0, cmd = 'M', i = 0;
  const tk = d.match(/[MLHVZmlhvz]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
  while (i < tk.length) {
    const t = tk[i];
    if (/[A-Za-z]/.test(t)) {
      cmd = t; i++;
      if (t === 'Z' || t === 'z') { if (cur && cur.length) { cur.push(cur[0].slice()); x = cur[0][0]; y = cur[0][1]; } cur = null; }
      continue;
    }
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
    if (C === 'H') x = (rel ? x : 0) + +tk[i++];
    else if (C === 'V') y = (rel ? y : 0) + +tk[i++];
    else { x = (rel ? x : 0) + +tk[i]; y = (rel ? y : 0) + +tk[i + 1]; i += 2; }
    if (C === 'M') { cur = [[x, y]]; out.push(cur); cmd = rel ? 'l' : 'L'; } else if (cur) cur.push([x, y]);
  }
  return out;
}
// n points spaced evenly along a set of polylines.
export function alongPolys(polys, n) {
  let L = 0;
  const segs = [];
  polys.forEach((p) => { for (let k = 1; k < p.length; k++) { const l = Math.hypot(p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1]); segs.push([p[k - 1], p[k], l]); L += l; } });
  const out = [], step = L / n;
  let acc = 0, next = 0;
  for (const s of segs) {
    while (next <= acc + s[2] && out.length < n) { const t = (next - acc) / (s[2] || 1); out.push([s[0][0] + (s[1][0] - s[0][0]) * t, s[0][1] + (s[1][1] - s[0][1]) * t]); next += step; }
    acc += s[2];
  }
  return out;
}
// n points for the country: 62% filling the land on a jittered hex grid, 24% on
// the coast, the rest on provincial borders. Each is [x, y, kind] in map units.
export function saTargets(n, d, bd) {
  const res = [];
  if (!d) return res;
  const W = 500, H = 440, sc = 0.5;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d', { willReadFrequently: true });
  g.scale(sc, sc); g.fill(new Path2D(d), 'evenodd');
  const px = g.getImageData(0, 0, W, H).data;
  let area = 0;
  for (let k = 3; k < px.length; k += 4) if (px[k] > 127) area++;
  area /= sc * sc;
  const nIn = Math.round(n * 0.62), nCo = Math.round(n * 0.24), nBr = n - nIn - nCo;
  const sp = Math.sqrt(area / nIn / 0.866);
  const R = mulberry32(5);
  for (let y = sp / 2, row = 0; y < 880; y += sp * 0.866, row++) {
    for (let x = (row % 2 ? sp / 2 : 0) + sp / 4; x < 1000; x += sp) {
      const ix = Math.floor(x * sc), iy = Math.floor(y * sc);
      if (px[(iy * W + ix) * 4 + 3] > 127) res.push([x + (R() - 0.5) * sp * 0.2, y + (R() - 0.5) * sp * 0.2, 1]);
    }
  }
  alongPolys(pathPolys(d), nCo).forEach((p) => res.push([p[0], p[1], 2]));
  if (bd) alongPolys(pathPolys(bd), nBr).forEach((p) => res.push([p[0], p[1], 3]));
  return res;
}
// Map units (1000 x 880, as the SVG) to scene units, centred on the city.
export const SAK = 0.125, SAX = 505, SAY = 440;
export const saW = (x, y) => [(x - SAX) * SAK, (y - SAY) * SAK];

/* ---------------------------------------------------------------------------
 * The pillars: one per metro at its map point, growing in order of size, and
 * a wide soft halo round each; a white dot on each top and a cap at the base.
 * metros: [{ k, x, y, z }] in map units, z the rated areas, largest first.
 * ------------------------------------------------------------------------ */
export function buildPillars(T, scn, metros) {
  const zMax = Math.max(1, ...metros.map((m) => m.z));
  const NM = metros.length, mtx = new T.Matrix4();
  const pilG = new T.CylinderGeometry(0.34, 0.34, 1, 10, 1, true); pilG.translate(0, 0.5, 0);
  const pH = new Float32Array(NM), pD = new Float32Array(NM), aXv = new Float32Array(NM * 2);
  metros.forEach((m, i) => { pH[i] = 3 + (m.z / zMax) * 24; pD[i] = 1 - m.z / zMax; aXv[i * 2 + 1] = 1; });
  pilG.setAttribute('aH', new T.InstancedBufferAttribute(pH, 1));
  pilG.setAttribute('aD', new T.InstancedBufferAttribute(pD, 1));
  pilG.setAttribute('aX', new T.InstancedBufferAttribute(aXv, 2));
  const PU = { uGrow: { value: 0 }, uFade: { value: 1 }, uZ: { value: 1 }, uHs: { value: 1 }, uLight };
  const pilMesh = (k, r) => {
    const im = new T.InstancedMesh(pilG, glow(T, new T.ShaderMaterial({ vertexShader: PL_VS, fragmentShader: PL_FS, transparent: true, depthWrite: false, uniforms: Object.assign({ uK: { value: k }, uR: { value: r } }, PU) })), NM);
    metros.forEach((m, i) => { const w = saW(m.x, m.y); mtx.makeTranslation(w[0], 0, w[1]); im.setMatrixAt(i, mtx); });
    im.frustumCulled = false; scn.add(im);
  };
  pilMesh(1, 1); pilMesh(0.22, 3.2); // the pillar and a wide soft halo round it
  const mTop = metros.map((m, i) => { const w = saW(m.x, m.y); return new T.Vector3(w[0], pH[i], w[1]); });
  const topG = new T.BufferGeometry(), topP = new Float32Array(NM * 3);
  topG.setAttribute('position', new T.BufferAttribute(topP, 3));
  const topM = new T.PointsMaterial({ color: 0xFFFFFF, size: 6, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false });
  const tops = new T.Points(topG, topM); tops.frustumCulled = false; scn.add(tops);
  const capG = new T.BufferGeometry();
  capG.setAttribute('position', new T.Float32BufferAttribute(mTop.flatMap((q) => [q.x, 0, q.z]), 3));
  const capM = new T.PointsMaterial({ color: 0xE6EDF5, size: 5, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false });
  const caps = new T.Points(capG, capM); caps.frustumCulled = false; scn.add(caps);
  return {
    metros, mTop, pH, PU, aX: pilG.attributes.aX, aXv,
    // the dots on the pillar tops and bases: white in the dark, ink in the light
    theme(light) { topM.color.set(light ? 0x1c2533 : 0xFFFFFF); capM.color.set(light ? 0x334155 : 0xE6EDF5); },
    // grow 0 to 1: the pillars rise, largest first, and their dots follow the tops
    update(grow) {
      PU.uGrow.value = grow; capM.opacity = grow * 0.95; topM.opacity = grow;
      for (let i = 0; i < NM; i++) {
        let g = clamp(grow * 1.6 - pD[i] * 0.6, 0, 1); g = 1 - Math.pow(1 - g, 3);
        topP[i * 3] = mTop[i].x; topP[i * 3 + 1] = pH[i] * g * PU.uHs.value * (1 + 0.15 * aXv[i * 2]); topP[i * 3 + 2] = mTop[i].z;
      }
      topG.attributes.position.needsUpdate = true;
    },
  };
}
