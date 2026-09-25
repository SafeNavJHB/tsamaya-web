// node citygen-parity.mjs: public/js/scene/citygen.js gives byte-identical output
// in Node (the build's poster) and in the browser (the scene), same seeds.
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import * as G from '/home/user/tsamaya-web/public/js/scene/citygen.js';
const cases = (g) => ({ city7: JSON.stringify(g.genCity(7)), cells265: JSON.stringify(g.genCells(2.65, 11)), cells41: JSON.stringify(g.genCells(4.1, 11)), low: JSON.stringify(g.crSample(g.CITY.LOW, 400)) });
const node = Object.fromEntries(Object.entries(cases(G)).map(([k, v]) => [k, [createHash('sha256').update(v).digest('hex').slice(0, 16), v.length]]));
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('http://localhost:8795/?tier=static');
const web = await p.evaluate(async () => {
  const g = await import('/js/scene/citygen.js');
  const c = { city7: JSON.stringify(g.genCity(7)), cells265: JSON.stringify(g.genCells(2.65, 11)), cells41: JSON.stringify(g.genCells(4.1, 11)), low: JSON.stringify(g.crSample(g.CITY.LOW, 400)) };
  const out = {};
  for (const [k, v] of Object.entries(c)) { const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v)); out[k] = [[...new Uint8Array(h)].map((x) => x.toString(16).padStart(2, '0')).join('').slice(0, 16), v.length]; }
  return out;
});
let ok = true;
for (const k of Object.keys(node)) { const same = node[k][0] === web[k][0] && node[k][1] === web[k][1]; ok = ok && same; console.log(`${same ? 'same' : 'DIFF'}  ${k.padEnd(9)} node ${node[k].join(' ')} | chromium ${web[k].join(' ')}`); }
console.log(ok ? 'PASS  citygen output is byte-identical in Node and Chromium' : 'FAIL');
await b.close();
