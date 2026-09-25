// node contrast.mjs [w h]: text over the scene. For the hero and each pinned
// chapter (at several points of its pin), hide the text, screenshot the scene
// behind it, and compare each fully opaque text element's colour with the 95th
// percentile luminance of the pixels behind its box (WCAG contrast; AA is 4.5,
// or 3 for large text).
import { chromium } from 'playwright';
const [,, w = '1440', h = '900'] = process.argv;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ viewport: { width: +w, height: +h } });
const p = await ctx.newPage();
const lab = await ctx.newPage();
await p.goto('http://localhost:8795/', { waitUntil: 'load' });
await p.waitForFunction(() => window.__home && window.__home.ready);
await p.waitForTimeout(5000);
const pins = (await p.evaluate(() => window.__home.state())).pins;
const spots = [['hero', 0, '.home-hero-in']];
for (let i = 0; i < 3; i++) for (const f of [0.1, 0.5, 0.9]) spots.push([`ch${i + 1}@${f}`, Math.round(pins[i][0] + f * (pins[i][1] - pins[i][0])), `#${['bend', 'clocks', 'metros'][i]} .ch-panel`]);
const lum = (r, g, b2) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b2); };
let worst = [];
for (const [name, y, sel] of spots) {
  await p.evaluate((yy) => window.lenis.scrollTo(yy, { immediate: true, force: true }), y);
  await p.waitForTimeout(2200);
  // text leaves: elements with their own text, fully opaque up the chain
  const boxes = await p.evaluate((s) => {
    const root = document.querySelector(s), out = [];
    root.querySelectorAll('h1, h2, p, li, span, b, small, button').forEach((el) => {
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!own) return;
      let op = 1; for (let e = el; e && e !== document.body; e = e.parentElement) op *= +getComputedStyle(e).opacity;
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      if (op < 0.99 || r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight || cs.visibility === 'hidden') return;
      const m = cs.color.match(/[\d.]+/g).map(Number);
      const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700;
      out.push({ t: el.textContent.trim().slice(0, 28), x: Math.max(0, r.left), y: Math.max(0, r.top), w: Math.min(r.width, innerWidth - r.left), h: Math.min(r.height, innerHeight - r.top), c: m.slice(0, 3), a: m[3] == null ? 1 : m[3], large: size >= 24 || (bold && size >= 18.66) });
    });
    return out;
  }, sel);
  await p.evaluate((s) => { document.querySelector(s).style.visibility = 'hidden'; }, sel);
  await p.waitForTimeout(250);
  const png = (await p.screenshot()).toString('base64');
  await p.evaluate((s) => { document.querySelector(s).style.visibility = ''; }, sel);
  const bg = await lab.evaluate(async ({ png, boxes }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + png; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    return boxes.map((bx) => { const d = g.getImageData(Math.round(bx.x), Math.round(bx.y), Math.max(1, Math.round(bx.w)), Math.max(1, Math.round(bx.h))).data; const px = []; for (let i = 0; i < d.length; i += 4) px.push([d[i], d[i + 1], d[i + 2]]); return px; });
  }, { png, boxes });
  const rows = boxes.map((bx, i) => {
    const ls = bg[i].map(([r, g, b2]) => lum(r, g, b2)).sort((a, b2) => a - b2);
    const L = ls[Math.floor(ls.length * 0.95)] || 0;
    // text colour with its own alpha over that background is close enough to its opaque value here
    const Lt = lum(...bx.c);
    const ratio = (Math.max(Lt, L) + 0.05) / (Math.min(Lt, L) + 0.05);
    return { name, t: bx.t, ratio: +ratio.toFixed(2), need: bx.large ? 3 : 4.5 };
  });
  const fails = rows.filter((r) => r.ratio < r.need);
  const min = rows.reduce((m, r) => (r.ratio / r.need < m.ratio / m.need ? r : m), rows[0]);
  console.log(`${name.padEnd(9)} ${rows.length} text boxes, lowest ${min ? `${min.ratio} (need ${min.need}) "${min.t}"` : '-'} ${fails.length ? 'FAIL ' + fails.map((f) => `"${f.t}" ${f.ratio}`).join('; ') : 'PASS'}`);
  worst = worst.concat(fails);
}
console.log(worst.length ? `FAIL  ${worst.length} text boxes under AA` : 'PASS  all fully opaque text over the scene meets AA (95th percentile background)');
await b.close();
