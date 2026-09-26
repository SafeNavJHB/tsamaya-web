// node howshot.mjs: the "Inside the app" section at three widths (static tier, so no scene cost).
import { chromium } from 'playwright';
const OUT = (process.env.OUT || decodeURIComponent(new URL('../out/p1/', import.meta.url).pathname));
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errs = [];
for (const [w, h] of [[1440, 900], [1024, 768], [900, 900], [600, 900], [390, 844]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8795/?tier=static', { waitUntil: 'load' });
  await p.waitForFunction(() => window.__home && window.__home.ready);
  await p.evaluate(() => { const y = document.getElementById('how').getBoundingClientRect().top + scrollY; scrollTo(0, y); });
  await p.waitForTimeout(1500);
  const info = await p.evaluate(() => {
    const h2 = document.getElementById('how-h'); const r = document.createRange(); r.selectNodeContents(h2);
    const lines = new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size;
    const imgs = [...document.querySelectorAll('.phones img')].map((i) => Math.round(i.getBoundingClientRect().width));
    return { h2lines: lines, phoneWidths: imgs, sw: document.documentElement.scrollWidth };
  });
  console.log(`${w}x${h}`, JSON.stringify(info));
  await p.screenshot({ path: `${OUT}how-${w}.png` });
  await p.close();
}
console.log(errs.length ? 'errors ' + errs.join(' | ') : 'no page errors');
await b.close();
