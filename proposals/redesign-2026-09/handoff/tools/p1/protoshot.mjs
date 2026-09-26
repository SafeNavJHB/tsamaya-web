// node protoshot.mjs out.png w h [scrollY...]: prototype screenshots with its fonts confirmed loaded
import { chromium } from 'playwright';
import { attachCdnRoutes } from '../cdnroute.mjs';
const [,, out, w = '1440', h = '900', ...ys] = process.argv;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, ignoreHTTPSErrors: true });
await attachCdnRoutes(ctx);
const p = await ctx.newPage();
await p.goto('http://localhost:8780/concept-4-sensor.html', { waitUntil: 'networkidle' }).catch(() => {});
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(4500);
console.log(await p.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family + ' ' + f.weight + ' ' + f.stretch).join(' | ')));
await p.screenshot({ path: out });
let i = 0;
for (const y of ys) {
  await p.evaluate((yy) => window.lenis.scrollTo(+yy, { immediate: true, force: true }), y);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: out.replace('.png', `-${i++}.png`) });
}
await b.close();
