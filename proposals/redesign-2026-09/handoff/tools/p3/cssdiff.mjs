// node p3/cssdiff.mjs <a.css> <b.css>: every element's computed style (and its
// ::before / ::after) on every page, at 1440 and 390, with stylesheet A and then B
// served in place of styles.css. Prints the elements whose styles differ
// (PAGES=index.html,about.html for some pages only; MAX=n lines, default 40).
// Reduced motion and a fixed clock keep the pages still between the two runs.
// Used to prove the style clean-up (p3/prune-css.py) changed nothing, and to
// find Phase 3 rules leaking onto the home page (against the Phase 2 styles).
import { chromium } from 'playwright';
import { readFileSync, readdirSync } from 'node:fs';
const [,, A, B] = process.argv;
const dist = new URL('../../../../../dist/', import.meta.url).pathname;
const pages = process.env.PAGES ? process.env.PAGES.split(',') : readdirSync(dist).filter((f) => f.endsWith('.html')).sort();
const b = await chromium.launch();
async function dump(cssFile, w, h) {
  const css = readFileSync(cssFile, 'utf8');
  const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
  await ctx.route('**/styles.css*', (r) => r.fulfill({ contentType: 'text/css', body: css }));
  await ctx.route(/mapbox|plausible|googletagmanager|analytics/, (r) => r.abort());
  const out = {};
  for (const f of pages) {
    const p = await ctx.newPage();
    await p.clock.install({ time: new Date('2026-09-25T10:00:00+02:00') });
    await p.goto('http://localhost:8795/' + f + (f === 'track.html' ? '?t=x' : ''), { waitUntil: 'load' }).catch(() => {});
    await p.waitForTimeout(600);
    out[f] = await p.evaluate(() => {
      const res = {};
      const all = [...document.querySelectorAll('body *')];
      const key = (el) => { const path = []; for (let e = el; e && e !== document.body; e = e.parentElement) { const i = e.parentElement ? [...e.parentElement.children].indexOf(e) : 0; path.unshift(e.tagName.toLowerCase() + ':' + i); } return path.join('>'); };
      for (const el of all) {
        for (const pseudo of [null, '::before', '::after']) {
          const cs = getComputedStyle(el, pseudo);
          if (pseudo && (cs.content === 'none' || cs.content === 'normal')) continue;
          const o = {};
          for (let i = 0; i < cs.length; i++) { const n = cs[i]; o[n] = cs.getPropertyValue(n); }
          res[key(el) + (pseudo || '')] = o;
        }
      }
      return res;
    });
    await p.close();
  }
  await ctx.close();
  return out;
}
let diffs = 0;
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const a = await dump(A, w, h), c = await dump(B, w, h);
  for (const f of pages) {
    const ka = Object.keys(a[f]), kc = new Set(Object.keys(c[f]));
    for (const k of ka) {
      if (!kc.has(k)) { diffs++; if (diffs < +(process.env.MAX || 40)) console.log(`${w} ${f} ${k}: only in A`); continue; }
      const pa = a[f][k], pc = c[f][k];
      const bad = Object.keys(pa).filter((n) => pa[n] !== pc[n]);
      if (bad.length) { diffs++; if (diffs < +(process.env.MAX || 40)) console.log(`${w} ${f} ${k}: ${bad.slice(0, 5).map((n) => `${n} ${pa[n]} -> ${pc[n]}`).join('; ')}`); }
    }
    for (const k of kc) if (!(k in a[f])) { diffs++; if (diffs < +(process.env.MAX || 40)) console.log(`${w} ${f} ${k}: only in B`); }
  }
  console.log(`${w}: ${pages.length} pages compared`);
}
console.log(diffs ? `FAIL  ${diffs} element styles differ` : 'PASS  every element on every page computes the same style with both stylesheets');
await b.close();
