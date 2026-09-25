// node lowpath-check.mjs: which risk cells do the two routes of the illustrative
// city touch, per band? Uses public/js/scene/citygen.js exactly as the build and
// the scene do (seed 11), for both cell sizes: 2.65 (the poster and the full
// tier) and 4.1 (the light tier).
//
// A route "touches" a cell when a point of its centreline, sampled every
// 0.05 units along the curve, falls inside the cell's hexagon at its full hex
// radius r (the spacing radius; the scene draws cells at 0.88 r, so this is
// the generous test). The story needs: the lower-risk route touches no high
// (level 3) cell in any band and about one medium (level 2) cell; the standard
// route still runs through the high clusters.
import { CITY, crSample, genCells } from '/home/user/tsamaya-web/public/js/scene/citygen.js';

const dense = (ctrl) => {
  const coarse = crSample(ctrl, 2000), out = [coarse[0]];
  for (let i = 1; i < coarse.length; i++) {
    const [ax, az] = coarse[i - 1], [bx, bz] = coarse[i], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.05));
    for (let k = 1; k <= n; k++) out.push([ax + (bx - ax) * k / n, az + (bz - az) * k / n]);
  }
  return out;
};
// point in a pointy hexagon (vertex along z, as CylinderGeometry and the poster draw it) of circumradius R
const inHex = (px, pz, cx, cz, R) => {
  const x = Math.abs(px - cx), z = Math.abs(pz - cz), w = R * Math.sqrt(3) / 2;
  return x <= w && x * 0.5 + z * Math.sqrt(3) / 2 <= w;
};
const routes = { LOW: dense(CITY.LOW), FAST: dense(CITY.FAST) };
const BANDS = ['day', 'evening', 'night'];
let ok = true;
for (const r of [2.65, 4.1]) {
  const cells = genCells(r, 11);
  console.log(`hex radius ${r}: ${cells.length} cells`);
  for (const [name, pts] of Object.entries(routes)) {
    const touched = cells.filter((c) => pts.some(([x, z]) => inHex(x, z, c[0], c[1], r)));
    for (let b = 0; b < 3; b++) {
      const hi = touched.filter((c) => c[3][b] === 3), mid = touched.filter((c) => c[3][b] === 2), lo = touched.filter((c) => c[3][b] === 1);
      const where = (list) => list.map((c) => `(${c[0]}, ${c[1]})`).join(' ');
      console.log(`  ${name.padEnd(4)} ${BANDS[b].padEnd(7)} high ${hi.length}${hi.length ? ' ' + where(hi) : ''} | medium ${mid.length}${mid.length ? ' ' + where(mid) : ''} | caution ${lo.length}`);
      if (name === 'LOW' && (hi.length !== 0 || mid.length > 1)) ok = false;
      if (name === 'FAST' && hi.length < 2) ok = false;
    }
  }
}
console.log(ok ? 'PASS  the lower-risk route touches no high cell and at most one medium cell in every band and tier; the standard route runs through at least 2 high cells (both clusters) in every band'
  : 'FAIL');
