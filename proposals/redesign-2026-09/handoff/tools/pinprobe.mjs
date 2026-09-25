import { chromium } from 'playwright';
import { attachCdnRoutes } from './cdnroute.mjs';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
await attachCdnRoutes(ctx);
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:8780/concept-4-sensor.html', { waitUntil: 'networkidle' }).catch(() => {});
await p.waitForTimeout(2500);
const pins = await p.evaluate(() => ScrollTrigger.getAll().filter(t => t.pin).map(t => [Math.round(t.start), Math.round(t.end)]));
console.log('pins', JSON.stringify(pins), 'errors', errs.length ? errs : 'none');
for (const [s, e] of pins) {
  for (const y of [s + 50, Math.round((s + e) / 2), e - 10, e + 150, e + 400]) {
    await p.evaluate((yy) => window.lenis.scrollTo(yy, { immediate: true, force: true }), y);
    await p.waitForTimeout(400);
    const ops = await p.evaluate(() => [...document.querySelectorAll('.ch-panel')].map(el => (+getComputedStyle(el).opacity).toFixed(2)).join(' '));
    console.log('y', y, 'panel opacities', ops);
  }
}
await b.close();
