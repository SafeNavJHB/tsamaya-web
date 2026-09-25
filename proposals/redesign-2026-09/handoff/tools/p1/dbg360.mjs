import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const mob of [false, true]) {
const p = await (await b.newContext({ viewport: { width: 360, height: 740 }, hasTouch: mob, isMobile: mob })).newPage();
await p.goto('http://localhost:8795/', { waitUntil: 'load' });
await p.waitForFunction(() => window.__home && window.__home.ready);
await p.waitForTimeout(4200);
await p.click('[data-co="hf"] button');
await p.waitForTimeout(700);
console.log(mob, await p.evaluate(() => {
  const el = document.querySelector('[data-co="hf"]'), c = el.querySelector('.sp-card'), bt = el.querySelector('button');
  const wide = [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > innerWidth + 1 && getComputedStyle(e).visibility !== 'hidden').slice(0, 8).map((e) => e.tagName + '.' + e.className + ' ' + Math.round(e.getBoundingClientRect().right));
  return { iw: innerWidth, vv: visualViewport.width, sw: document.documentElement.scrollWidth, x: el._x, y: el._y, tw: bt.offsetWidth, cw: c.offsetWidth, tr: c.style.transform, wide };
}));
}
await b.close();
