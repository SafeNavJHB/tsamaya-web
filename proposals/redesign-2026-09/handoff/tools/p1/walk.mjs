// node walk.mjs url outPrefix w h mode stepFraction [maxFrames]
//   mode: full | nojs | rm   (full = normal context; the URL can carry ?tier=)
// Viewport frames down the whole page, the scroll width at each, the scene
// requests made, and every console or page error. Prints a JSON summary.
import { chromium } from 'playwright';
const [,, url, out, w = '1440', h = '900', mode = 'full', step = '1', maxF = '40'] = process.argv;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, ignoreHTTPSErrors: true, javaScriptEnabled: mode !== 'nojs', reducedMotion: mode === 'rm' ? 'reduce' : 'no-preference' });
const p = await ctx.newPage();
const log = [], reqs = [];
p.on('pageerror', (e) => log.push('pageerror: ' + e.message));
p.on('console', (m) => { if (m.type() === 'error' && !/ERR_TUNNEL|cloudflareinsights/.test(m.text())) log.push('console: ' + m.text()); });
p.on('request', (r) => reqs.push(r.url()));
await p.goto(url, { waitUntil: 'load' });
await p.waitForTimeout(mode === 'nojs' ? 800 : 4500);
const H = await p.evaluate(() => document.documentElement.scrollHeight);
const frames = [];
let i = 0;
for (let y = 0; y < H && i < +maxF; y += Math.round(+h * +step), i++) {
  await p.evaluate((yy) => { if (window.lenis) window.lenis.scrollTo(yy, { immediate: true, force: true }); else window.scrollTo(0, yy); }, y);
  await p.waitForTimeout(mode === 'nojs' ? 150 : 1300);
  const f = `${out}-${String(i).padStart(2, '0')}.png`;
  await p.screenshot({ path: f });
  frames.push({ y, sw: await p.evaluate(() => document.documentElement.scrollWidth), f });
}
const three = reqs.filter((u) => /three\.scene|scene\/(engine|city|chapters)\.js/.test(u)).map((u) => u.replace(/^.*\//, ''));
const cls = await p.evaluate(() => document.documentElement.className);
console.log(JSON.stringify({ url, w, h, mode, H, cls, maxScrollWidth: Math.max(...frames.map((f) => f.sw)), sceneRequests: three, errors: log }));
await b.close();
