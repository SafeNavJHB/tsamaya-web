// node hash.mjs: load the page at a fragment; after the scene arrives, the target must still be at the top.
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const [w, h] of [[1440, 900], [390, 844]]) for (const id of ['get', 'faq', 'coverage', 'bend', 'clocks']) {
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  await p.goto('http://localhost:8795/#' + id, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__home && window.__home.ready, null, { timeout: 30000 });
  await p.waitForTimeout(2500);
  const r = await p.evaluate((i) => { const el = document.getElementById(i); const box = el.parentElement.classList.contains('pin-spacer') ? el.parentElement : el; const s = window.__home.state(); return { top: Math.round(box.getBoundingClientRect().top), c: s.c, y: Math.round(scrollY), tier: s.tier, cls: document.documentElement.className, keys: Object.keys(s).length }; }, id);
  const want = { get: 6, faq: 6, coverage: 6, bend: 1, clocks: 3 }[id]; const ok = Math.abs(r.top) <= 90 && Math.abs((+r.c || 0) - want) < 0.05;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${w} #${id}: target top at ${r.top}px (scrollY ${r.y}, c ${(+r.c || 0).toFixed(3)}, ${r.tier}, ${r.cls}, ${r.keys} keys)`);
  await p.context().close();
}
await b.close();
