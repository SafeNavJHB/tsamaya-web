// node widths.mjs outDir [query]: the hero and each chapter at common desktop
// sizes, to check how the 3D framing sits against the text column.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const [,, out = decodeURIComponent(new URL('../out/p1/widths', import.meta.url).pathname), query = '', sizes = '1280x800,1440x900,1536x864,1920x1080'] = process.argv;
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const sz of sizes.split(',')) {
  const [w, h] = sz.split('x').map(Number);
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  await p.goto('http://localhost:8795/' + query, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__home && window.__home.ready, null, { timeout: 30000 });
  await p.waitForTimeout(4200);
  const pins = await p.evaluate(() => window.__home.state().pins);
  for (const [name, y] of [['hero', 0], ['ch1', pins[0][0] + 0.7 * (pins[0][1] - pins[0][0])], ['ch2', pins[1][0] + 0.5 * (pins[1][1] - pins[1][0])], ['ch3', pins[2][0] + 0.9 * (pins[2][1] - pins[2][0])]]) {
    await p.evaluate((yy) => window.lenis.scrollTo(yy, { immediate: true, force: true }), Math.round(y));
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `${out}/${sz}-${name}.png` });
  }
  await ctx.close();
}
await b.close();
