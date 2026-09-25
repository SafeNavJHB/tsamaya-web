import { chromium } from 'playwright';
import * as G from '../../../../../public/js/scene/citygen.js';
const flat = (c) => ({ segs: c.segs.flat(), polys: c.polys.flatMap((p) => p.pts.flat()), boxes: c.boxes.flat(), xs: c.xs, zs: c.zs });
const n = flat(G.genCity(7));
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('http://localhost:8795/?tier=static');
const w = await p.evaluate(async () => { const g = await import('/js/scene/citygen.js'); const c = g.genCity(7); return { segs: c.segs.flat(), polys: c.polys.flatMap((p) => p.pts.flat()), boxes: c.boxes.flat(), xs: c.xs, zs: c.zs, ver: navigator.userAgent }; });
console.log('node', process.versions.v8, '| browser', w.ver.match(/Chrome\/[\d.]+/)[0]);
for (const k of ['segs', 'polys', 'boxes', 'xs', 'zs']) {
  const d = [];
  n[k].forEach((v, i) => { if (!Object.is(v, w[k][i])) d.push([i, v, w[k][i]]); });
  console.log(k, n[k].length, w[k].length, d.length ? 'DIFF ' + JSON.stringify(d.slice(0, 5)) : 'same');
}
// which Math functions differ, on the ring's inputs
const r = await p.evaluate(() => { const o = []; for (let k = 0; k <= 120; k++) { const t = k / 120 * Math.PI * 2; o.push([Math.sin(t * 3 + 1), Math.cos(t), Math.sin(t)]); } return o; });
let dd = 0; for (let k = 0; k <= 120; k++) { const t = k / 120 * Math.PI * 2; const a = [Math.sin(t * 3 + 1), Math.cos(t), Math.sin(t)]; a.forEach((v, j) => { if (!Object.is(v, r[k][j])) { dd++; if (dd < 4) console.log('trig diff k', k, j, v, r[k][j]); } }); }
console.log('trig diffs', dd);
await b.close();
