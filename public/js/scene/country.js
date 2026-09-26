// country.js: the coverage page's scene: South Africa as points and a pillar
// per metro, fully grown, for the explore map (explore.js) to draw on. The
// home page gets the same country out of its illustrative city (city.js); both
// build it with sa.js, so the two maps match point for point.
//
// geo: data/geo.json (the outline and borders, already projected to map units).
// metros: [{ k, x, y, z }] in map units, z the rated areas, largest first.
import { PT_VS, PT_FS, saTargets, saW, pathPolys, buildPillars } from './sa.js';
import { mulberry32 } from './citygen.js';
import { uLight, follow } from './theme.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const pathD = (rings, close) => rings.map((r) => 'M' + r.map((p) => p.join(' ')).join('L') + (close ? 'Z' : '')).join('');

export function buildCountry(engine, { tier, geo, metros }) {
  const T = engine.THREE, scn = engine.scene, renderer = engine.renderer;
  // the point shader's uniforms, with the morph done and nothing dissolving
  const U = {
    uReveal: { value: 1 }, uBand: { value: 0 }, uDissolve: { value: 0 }, uMorph: { value: 1 },
    uPx: { value: renderer.getPixelRatio() }, uOrigin: { value: new T.Vector2(0, 0) }, uFogN: { value: 120 }, uFogF: { value: 320 },
    uLight,
  };
  const pointMat = (alpha, size, extra) => new T.ShaderMaterial({ vertexShader: PT_VS, fragmentShader: PT_FS, transparent: true, depthWrite: false, uniforms: Object.assign({}, U, { uAlpha: { value: alpha }, uSize: { value: size } }, extra) });

  const sa = saTargets(tier === 'light' ? 2500 : 6000, pathD(geo.land, true), pathD(geo.borders, false));
  const R = mulberry32(99), pos = new Float32Array(sa.length * 3), meta = new Float32Array(sa.length * 2);
  // shuffled, so dropping the second half (degrade) thins land, coast and borders evenly
  for (let i = sa.length - 1; i > 0; i--) { const j = (R() * (i + 1)) | 0; [sa[i], sa[j]] = [sa[j], sa[i]]; }
  sa.forEach((p, i) => {
    const w = saW(p[0], p[1]);
    pos[i * 3] = w[0]; pos[i * 3 + 2] = w[1];
    meta[i * 2] = p[2]; meta[i * 2 + 1] = clamp((p[0] / 1000) * 0.7 + R() * 0.3, 0, 1);
  });
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.BufferAttribute(pos, 3));
  g.setAttribute('aTarget', new T.BufferAttribute(pos, 3));
  g.setAttribute('aMeta', new T.BufferAttribute(meta, 2));
  const pts = new T.Points(g, pointMat(0.78, 1.7));
  pts.frustumCulled = false; scn.add(pts);

  const pillars = buildPillars(T, scn, metros);
  const { mTop, pH, PU, aX, aXv } = pillars;
  // the ground: the page's own, dark or light, following the theme
  const theme = (isL) => { renderer.setClearColor(isL ? 0xf4f6f9 : 0x0a0f1c, 1); pillars.theme(isL); };
  follow(engine, theme);

  return {
    U, theme,
    pil: { metros, mTop, pH, PU, aX, aXv, pointMat, saW, pathPolys },
    // per frame: fog by the camera's distance, and the pillars shrink as it
    // closes in (or a metro's pillar would fill the view)
    apply(dist, phone) {
      U.uFogN.value = dist * 0.8; U.uFogF.value = dist * 2.4;
      const zs = dist / (phone ? 330 : 200);
      PU.uZ.value = clamp(zs, 0.1, 1); PU.uHs.value = clamp(zs, 0.3, 1);
      pillars.update(1);
    },
    degrade() { g.setDrawRange(0, Math.floor(sa.length / 2)); U.uPx.value = renderer.getPixelRatio(); },
  };
}
