// node targets.mjs: at 390 x 844 in the pinned layout, every visible interactive
// element's hit area (its box, grown by a ::before hit extension where it has one) is at least 44 px tall.
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
await p.goto('http://localhost:8795/', { waitUntil: 'load' });
await p.waitForFunction(() => window.__home && window.__home.ready);
await p.waitForTimeout(3800);
const pins = (await p.evaluate(() => window.__home.state())).pins;
const out = [];
for (const y of [0, pins[0][0] + 300, pins[1][0] + 300, 9000, 11000, 12500, 14000]) {
  await p.evaluate((yy) => window.lenis.scrollTo(yy, { immediate: true, force: true }), y);
  await p.waitForTimeout(700);
  out.push(...await p.evaluate(() => [...document.querySelectorAll('main a, main button, main [role="slider"]')].filter((el) => {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    return r.width > 0 && r.bottom > 0 && r.top < innerHeight && cs.visibility !== 'hidden' && +cs.opacity > 0 && el.closest('[style*="visibility: hidden"]') === null;
  }).map((el) => {
    const r = el.getBoundingClientRect(), be = getComputedStyle(el, '::before');
    const ext = be.content !== 'none' && be.position === 'absolute' ? -(parseFloat(be.top) || 0) - (parseFloat(be.bottom) || 0) : 0;
    return { t: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 26), h: Math.round(r.height + Math.max(0, ext)), w: Math.round(r.width) };
  })));
}
const seen = new Map(); out.forEach((o) => seen.set(o.t, o));
const small = [...seen.values()].filter((o) => o.h < 44);
console.log([...seen.values()].map((o) => `${o.t}: ${o.w}x${o.h}`).join('\n'));
console.log(small.length ? `FAIL  under 44 px: ${small.map((o) => o.t + ' ' + o.h).join('; ')}` : `PASS  ${seen.size} visible interactive elements, all at least 44 px tall`);
await b.close();
