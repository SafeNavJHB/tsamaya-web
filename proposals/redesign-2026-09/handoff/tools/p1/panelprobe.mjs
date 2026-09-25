// node panelprobe.mjs [w h]: each chapter panel's opacity during its pin (must be
// 1.00 throughout) and after the pin lets go (must fade). Adapted from ../pinprobe.mjs.
import { chromium } from 'playwright';
const [,, w = '1440', h = '900'] = process.argv;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await (await b.newContext({ viewport: { width: +w, height: +h } })).newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
await p.goto('http://localhost:8795/', { waitUntil: 'load' });
await p.waitForFunction(() => window.__home && window.__home.ready);
await p.waitForTimeout(1200);
const pins = (await p.evaluate(() => window.__home.state())).pins;
console.log(`${w}x${h} pins`, JSON.stringify(pins));
let ok = true;
for (let i = 0; i < pins.length; i++) {
  const [s, e] = pins[i];
  const during = [], after = [];
  for (let k = 0; k <= 10; k++) {
    const y = Math.round(s + 2 + (e - s - 12) * k / 10);
    await p.evaluate((yy) => window.lenis.scrollTo(yy, { immediate: true, force: true }), y);
    await p.waitForTimeout(120);
    during.push((+await p.evaluate((n) => getComputedStyle(document.querySelectorAll('.ch-panel')[n]).opacity, i)).toFixed(2));
  }
  for (const dy of [60, 150, 250, 342, 400]) {
    await p.evaluate((yy) => window.lenis.scrollTo(yy, { immediate: true, force: true }), e + dy);
    await p.waitForTimeout(150);
    after.push(`+${dy}:` + (+await p.evaluate((n) => getComputedStyle(document.querySelectorAll('.ch-panel')[n]).opacity, i)).toFixed(2));
  }
  const pinOk = during.every((v) => v === '1.00');
  const fadeVals = after.map((a) => +a.split(':')[1]);
  const fadeOk = fadeVals[0] < 1 && fadeVals.every((v, j) => j === 0 || v <= fadeVals[j - 1]) && fadeVals[fadeVals.length - 1] === 0;
  ok = ok && pinOk && fadeOk;
  console.log(`chapter ${i + 1}: during pin [${during.join(' ')}] ${pinOk ? 'PASS' : 'FAIL'} | after release [${after.join(' ')}] ${fadeOk ? 'PASS' : 'FAIL'}`);
}
console.log(ok ? 'PASS  panels hold at 1.00 for the whole pin and fade only after it' : 'FAIL');
console.log(errs.length ? 'errors: ' + errs.join(' | ') : 'no page errors');
await b.close();
