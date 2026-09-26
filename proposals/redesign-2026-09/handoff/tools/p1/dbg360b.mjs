import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await (await b.newContext({ viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true })).newPage();
await p.goto('http://localhost:8795/', { waitUntil: 'load' });
await p.waitForFunction(() => window.__home && window.__home.ready);
await p.waitForTimeout(4200);
const snap = (q) => p.evaluate((q) => {
  const el = document.querySelector(`[data-co="${q}"]`), c = el.querySelector('.sp-card'), bt = el.querySelector('button');
  return { sl: document.getElementById('spots').scrollLeft, st: document.getElementById('spots').scrollTop, x: Math.round(el._x), y: Math.round(el._y), elT: el.style.transform, cT: c.style.transform, btn: Math.round(bt.getBoundingClientRect().left), card: Math.round(c.getBoundingClientRect().left), frames: window.__home.frames };
}, q);
for (const q of ['hf', 'hl']) {
  console.log(q, 'before', await snap(q));
  await p.click(`[data-co="${q}"] button`);
  for (let i = 0; i < 1; i++) { await p.waitForTimeout(250); console.log(q, i, await snap(q)); }
  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);
}
await b.close();
