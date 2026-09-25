// node numbers.mjs [w h]: sample the chapter 1 stat and the chapter 2 count on
// every animation frame while wheel-scrolling through both chapters and back.
// Every value seen (the element's text, and the outgoing value a flip shows)
// must be a true value.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const [,, w = '1440', h = '900'] = process.argv;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await (await b.newContext({ viewport: { width: +w, height: +h } })).newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
await p.goto('http://localhost:8795/', { waitUntil: 'load' });
await p.waitForFunction(() => window.__home && window.__home.ready);
await p.waitForTimeout(1500);
const pins = (await p.evaluate(() => window.__home.state())).pins;
await p.evaluate(() => {
  const S = window.__seen = { stat: new Set(), statOld: new Set(), from: new Set(), count: new Set(), countOld: new Set(), frames: 0, flips: 0 };
  const a = document.getElementById('stat-to'), f = document.getElementById('stat-from'), c = document.getElementById('cnt-n');
  const tick = () => {
    S.frames++;
    S.stat.add(a.textContent); S.from.add(f.textContent); S.count.add(c.textContent);
    if (a.classList.contains('is-flip') && a.dataset.old) S.statOld.add(a.dataset.old);
    if (c.classList.contains('is-flip') && c.dataset.old) S.countOld.add(c.dataset.old);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
await p.mouse.move(+w / 2, +h / 2);
const end = pins[1][1] + 300;
let y = 0;
while (y < end) { await p.mouse.wheel(0, 140); y += 140; await p.waitForTimeout(45); }
await p.waitForTimeout(1500);
while (y > 0) { await p.mouse.wheel(0, -140); y -= 140; await p.waitForTimeout(45); }
await p.waitForTimeout(1500);
const seen = await p.evaluate(() => { const S = window.__seen; const o = {}; for (const k in S) o[k] = S[k] instanceof Set ? [...S[k]] : S[k]; return o; });
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const truth = await p.evaluate(() => ({ stat: [document.getElementById('stat-from').textContent, document.querySelector('#stat .sr').textContent], rows: [...document.querySelectorAll('#clocks .bands li b')].map((x) => x.textContent) }));
// the true values: the route card (src/data/route-card.json) and the national counts (stats.json)
const card = JSON.parse(readFileSync('/home/user/tsamaya-web/src/data/route-card.json', 'utf8'));
const stats = JSON.parse(readFileSync('/home/user/tsamaya-web/src/data/stats.json', 'utf8'));
const TRUE_STAT = [String(card.standard.highRisk), String(card.lower.highRisk)];
const TRUE_COUNT = ['day', 'evening', 'night'].map((b) => fmt(stats.byTime[b].red));
const sub = (a, set) => a.every((v) => set.includes(v));
const vis = (v) => v.replace(/ /g, '␣');
console.log(`${w}x${h}: ${seen.frames} frames sampled`);
console.log('chapter 1 stat, "to" value seen:', seen.stat.map(vis), '| outgoing during a flip:', seen.statOld.map(vis), '| "from":', seen.from.map(vis));
console.log('chapter 2 count seen:', seen.count.map(vis), '| outgoing during a flip:', seen.countOld.map(vis));
console.log('page rows (from stats.json):', truth.rows.map(vis).join(', '));
const ok1 = sub([...seen.stat, ...seen.statOld, ...seen.from], TRUE_STAT);
const ok2 = sub([...seen.count, ...seen.countOld], TRUE_COUNT) && sub(TRUE_COUNT, truth.rows);
console.log(`${ok1 ? 'PASS' : 'FAIL'}  stat values are a subset of {${TRUE_STAT.join(', ')}}`);
console.log(`${ok2 ? 'PASS' : 'FAIL'}  count values are a subset of {${TRUE_COUNT.join(', ')}} (NBSP-grouped)`);
console.log(`${seen.count.length === 3 && seen.stat.includes(TRUE_STAT[1]) && seen.statOld.includes(TRUE_STAT[0]) ? 'PASS' : 'FAIL'}  every band count was shown on the way through, and the stat flipped from ${TRUE_STAT[0]} to ${TRUE_STAT[1]}`);
console.log(errs.length ? 'errors: ' + errs.join(' | ') : 'no page errors');
await b.close();
