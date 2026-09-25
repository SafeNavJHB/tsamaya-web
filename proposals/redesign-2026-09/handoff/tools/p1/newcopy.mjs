// node newcopy.mjs: frames of the new chapter 1 story, the hero cards and the phone pair.
import { chromium } from 'playwright';
const OUT = (process.env.OUT || decodeURIComponent(new URL('../out/p1/', import.meta.url).pathname));
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errs = [];
for (const [w, h, tag] of [[1440, 900, 'd'], [390, 844, 'm']]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8795/', { waitUntil: 'load' });
  await p.waitForFunction(() => window.__home && window.__home.ready);
  await p.waitForTimeout(4200);
  await p.click('[data-co="hl"] button');
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${OUT}new-hero-card-${tag}.png` });
  await p.click('[data-co="hl"] button');
  const pins = (await p.evaluate(() => window.__home.state())).pins;
  for (const [n, f] of [['ch1-standard', 0.12], ['ch1-bend', 0.62], ['ch1-drive', 0.9]]) {
    await p.evaluate((y) => window.lenis.scrollTo(y, { immediate: true, force: true }), Math.round(pins[0][0] + f * (pins[0][1] - pins[0][0])));
    await p.waitForTimeout(1600);
    await p.screenshot({ path: `${OUT}new-${n}-${tag}.png` });
  }
  await p.evaluate(() => window.lenis.scrollTo(document.querySelector('.phone').getBoundingClientRect().top + scrollY - 120, { immediate: true, force: true }));
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${OUT}new-phones-${tag}.png` });
  console.log(tag, JSON.stringify(await p.evaluate(() => ({ h1: document.getElementById('ch1-h').textContent, stat: document.querySelector('#stat').innerText.replace(/\n/g, ' | '), imgs: [...document.querySelectorAll('.phones img')].map((i) => [i.currentSrc.replace(/^.*\//, ''), getComputedStyle(i.closest('.device')).display]) }))));
}
console.log(errs.length ? 'errors ' + errs.join(' | ') : 'no page errors');
await b.close();
