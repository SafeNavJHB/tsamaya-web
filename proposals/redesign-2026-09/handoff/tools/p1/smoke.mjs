// node smoke.mjs url out.png w h [waitMs] [scrollY...]
import { chromium } from 'playwright';
const [,, url, out, w = '1440', h = '900', wait = '4000', ...ys] = process.argv;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, ignoreHTTPSErrors: true });
const p = await ctx.newPage();
const log = [];
p.on('pageerror', (e) => log.push('pageerror: ' + e.message + '\n' + e.stack));
p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') log.push(m.type() + ': ' + m.text()); });
p.on('requestfailed', (r) => { if (!/cloudflareinsights/.test(r.url())) log.push('reqfail: ' + r.url()); });
await p.goto(url, { waitUntil: 'load' });
await p.waitForTimeout(+wait);
const st = await p.evaluate(() => ({ tier: window.__home && window.__home.tier, ready: window.__home && window.__home.ready, state: window.__home && window.__home.state(), cls: document.documentElement.className, live: document.getElementById('scene').className }));
console.log(JSON.stringify(st));
await p.screenshot({ path: out });
let i = 0;
for (const y of ys) {
  await p.evaluate((yy) => { if (window.lenis) window.lenis.scrollTo(+yy, { immediate: true, force: true }); else window.scrollTo(0, +yy); }, y);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: out.replace('.png', `-${i++}.png`) });
  console.log(y, JSON.stringify(await p.evaluate(() => window.__home.state())));
}
console.log(log.join('\n') || 'no errors');
await b.close();
