// node fontshift.mjs: the hero with the web fonts blocked vs loaded. Any hero
// element whose height differs moves the ones above it when the fonts land
// (the hero is bottom-aligned), which is a layout shift.
import { chromium } from 'playwright';
const b = await chromium.launch();
let bad = 0;
const SIZES = process.argv[2] ? process.argv[2].split(',').map((x) => x.split('x').map(Number)) : [[320, 568], [340, 700], [360, 780], [375, 667], [390, 844], [412, 823], [600, 900], [768, 1024], [900, 620], [1280, 800], [1366, 625], [1366, 768], [1440, 900], [1920, 1080]];
for (const [w, h] of SIZES) {
  const res = [];
  for (const block of [true, false]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const p = await ctx.newPage();
    if (block) await p.route(/\.woff2$/, (r) => r.abort());
    await p.goto('http://localhost:8795/?tier=static', { waitUntil: 'load' });
    await p.waitForTimeout(500);
    res.push(await p.evaluate(() => Object.fromEntries(['.say', '#hero-h', '.hero-sub', '.home-cta', '.hero-note'].map((s) => { const r = document.querySelector(s).getBoundingClientRect(); return [s, [Math.round(r.top), Math.round(r.height)]]; }))));
    await ctx.close();
  }
  const diff = Object.keys(res[0]).filter((k) => res[0][k][1] !== res[1][k][1]).map((k) => `${k} ${res[0][k][1]}->${res[1][k][1]}`);
  const moved = Object.keys(res[0]).filter((k) => res[0][k][0] !== res[1][k][0]).map((k) => `${k} ${res[0][k][0] - res[1][k][0]}`);
  if (moved.length) bad++;
  console.log(`${(w + 'x' + h).padEnd(10)} ${moved.length ? 'MOVES ' + moved.join(', ') : 'still'}${diff.length ? '  | heights (fallback->Archivo): ' + diff.join(', ') : ''}`);
}
await b.close();
console.log(bad ? `${bad} size(s) shift when the fonts load` : 'no hero element moves when the fonts load');
