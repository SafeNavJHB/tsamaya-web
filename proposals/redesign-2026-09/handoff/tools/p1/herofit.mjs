// node herofit.mjs [sizes] [url]: at the top of the page, does the hero's text
// collide with the fixed HUD corners or the spotlight tags, or come within 12 px
// of them vertically? Prints each offending pair.
import { chromium } from 'playwright';
const sizes = (process.argv[2] || '1280x720,1280x800,1366x768,1440x900,1536x864,1920x1080,1024x768,820x1180,390x844,375x667,360x780').split(',');
const url = process.argv[3] || 'http://localhost:8795/';
const proto = /concept-4/.test(url);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
let bad = 0;
for (const sz of sizes) {
  const [w, h] = sz.split('x').map(Number);
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: proto ? 'networkidle' : 'load' }).catch(() => {});
  if (!proto) await p.waitForFunction(() => window.__home && window.__home.ready, null, { timeout: 30000 });
  await p.waitForTimeout(3800);
  const r = await p.evaluate(() => {
    const vis = (e) => { if (!e) return false; const s = getComputedStyle(e); return s.display !== 'none' && s.visibility !== 'hidden' && +s.opacity > 0.05 && e.getClientRects().length; };
    const box = (sel) => [...document.querySelectorAll(sel)].filter(vis).map((e) => { const r = e.getBoundingClientRect(); return { sel, t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right) }; });
    // text extents, not block boxes
    // one box per line of text (a union box would count the empty space beside
    // a short last line)
    const textBox = (sel) => [...document.querySelectorAll(sel)].filter(vis).flatMap((e) => { const rg = document.createRange(); rg.selectNodeContents(e); return [...rg.getClientRects()].filter((x) => x.width > 1).map((x) => ({ sel, t: Math.round(x.top), b: Math.round(x.bottom), l: Math.round(x.left), r: Math.round(x.right) })); });
    const hero = [...textBox('.say'), ...textBox('.hero-h'), ...textBox('.hero-sub'), ...box('.home-cta a, .hero-cta a, .cta a'), ...textBox('.hero-note')];
    const hud = [...textBox('.hud-c.bl'), ...textBox('.hud-c.br'), ...box('.bchips'), ...textBox('.hud-c.tl'), ...textBox('.hud-c.tr p, .hud-now'), ...box('.spot .co-tag')];
    const ov = [];
    // a near miss counts too: text needs 12 px of air above and below a corner
    const M = 12;
    for (const a of hero) for (const c of hud) if (a.l < c.r && c.l < a.r && a.t < c.b + M && c.t < a.b + M) ov.push(`${a.sel} [${a.t}-${a.b}] x ${c.sel} [${c.t}-${c.b}]`);
    const last = hero[hero.length - 1];
    return { ov, heroBottom: Math.max(...hero.map((x) => x.b)), vh: innerHeight, sh: document.querySelector('.hero-h') ? Math.round(parseFloat(getComputedStyle(document.querySelector('.hero-h')).fontSize)) : 0 };
  });
  if (r.ov.length) bad++;
  console.log(`${sz.padEnd(10)} h1 ${r.sh}px, text bottom ${r.heroBottom}/${r.vh}  ${r.ov.length ? 'OVERLAP ' + r.ov.join(' | ') : 'clear'}`);
  await ctx.close();
}
await b.close();
console.log(bad ? `${bad} size(s) with overlaps` : 'no overlaps');
