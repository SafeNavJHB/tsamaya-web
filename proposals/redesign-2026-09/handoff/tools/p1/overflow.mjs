// node overflow.mjs: at 360 x 780, document.documentElement.scrollWidth <= 360 at
// the top, the middle and the bottom of the page, in every mode. Also saves a
// frame of each and names any element sticking out past the right edge.
import { chromium } from 'playwright';
const OUT = (process.env.OUT || decodeURIComponent(new URL('../out/p1/', import.meta.url).pathname));
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
let all = true;
const errs = [];
for (const [mode, q, js, rm] of [['full', '', true, false], ['light', '?tier=light', true, false], ['static', '?tier=static', true, false], ['reduced-motion', '', true, true], ['no-js', '', false, false]]) {
  const ctx = await b.newContext({ viewport: { width: 360, height: 780 }, javaScriptEnabled: js, reducedMotion: rm ? 'reduce' : 'no-preference' });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(mode + ': ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/ERR_TUNNEL|cloudflareinsights/.test(m.text())) errs.push(mode + ': ' + m.text()); });
  await p.goto('http://localhost:8795/' + q, { waitUntil: 'load' });
  if (js) await p.waitForFunction(() => window.__home && window.__home.ready, null, { timeout: 30000 });
  await p.waitForTimeout(js ? 2500 : 300);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  const res = [];
  for (const [name, y] of [['top', 0], ['mid', Math.round(H / 2)], ['bottom', H]]) {
    await p.evaluate((yy) => { if (window.lenis) window.lenis.scrollTo(yy, { immediate: true, force: true }); else window.scrollTo(0, yy); }, y);
    await p.waitForTimeout(js ? 900 : 150);
    const r = await p.evaluate(() => {
      const sw = document.documentElement.scrollWidth;
      const wide = [...document.querySelectorAll('body *')].filter((el) => { const b2 = el.getBoundingClientRect(); return b2.width && b2.right > innerWidth + 0.5 && getComputedStyle(el).visibility !== 'hidden'; }).slice(0, 3).map((el) => el.className || el.nodeName);
      return { sw, wide };
    });
    res.push(`${name} ${r.sw}${r.sw > 360 ? ' OVERFLOW ' + r.wide.join(',') : ''}`);
    all = all && r.sw <= 360;
    if (name === 'mid') await p.screenshot({ path: `${OUT}overflow-360-${mode}-mid.png` });
  }
  console.log(`${res.every((x) => !/OVERFLOW/.test(x)) ? 'PASS' : 'FAIL'}  360x780 ${mode}: scrollWidth ${res.join(' | ')}`);
  await ctx.close();
}
console.log(all ? 'PASS  no horizontal overflow at 360 px' : 'FAIL');
console.log(errs.length ? 'errors: ' + errs.join(' | ') : 'no console or page errors');
await b.close();
