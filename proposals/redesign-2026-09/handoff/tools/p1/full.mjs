// node full.mjs url out.png w h [mode]  mode: nojs | rm | (none)
// Full-page screenshot plus the network log (does Three.js load?) and errors.
import { chromium } from 'playwright';
const [,, url, out, w = '1440', h = '900', mode = ''] = process.argv;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, ignoreHTTPSErrors: true, javaScriptEnabled: mode !== 'nojs', reducedMotion: mode === 'rm' ? 'reduce' : 'no-preference' });
const p = await ctx.newPage();
const log = [], reqs = [];
p.on('pageerror', (e) => log.push('pageerror: ' + e.message));
p.on('console', (m) => { if (m.type() === 'error' && !/ERR_TUNNEL|cloudflareinsights/.test(m.text())) log.push('console: ' + m.text()); });
p.on('request', (r) => reqs.push(r.url()));
await p.goto(url, { waitUntil: 'load' });
await p.waitForTimeout(4000);
// walk the page so lazy images and reveals fire, then come back up
const H = await p.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < H; y += 600) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(60); }
await p.evaluate(() => window.scrollTo(0, 0));
await p.waitForTimeout(3500);
const info = await p.evaluate(() => ({ H: document.documentElement.scrollHeight, sw: document.documentElement.scrollWidth, cls: document.documentElement.className }));
// A very tall page can exceed what one screenshot may hold (it fails on a Mac
// at about 16 000 px): then save screen-sized tiles, out-00.png, out-01.png...
try { await p.screenshot({ path: out, fullPage: true }); } catch {
  for (let y = 0, i = 0; y < info.H; y += +h, i++) {
    await p.evaluate((yy) => window.scrollTo(0, yy), y);
    await p.waitForTimeout(250);
    await p.screenshot({ path: out.replace(/\.png$/, `-${String(i).padStart(2, '0')}.png`) });
  }
}
const three = reqs.filter((u) => /three|scene\/(engine|city|chapters)/.test(u));
console.log(JSON.stringify(info), '| scene requests:', three.length ? three.map((u) => u.replace(/^.*\//, '')).join(',') : 'none');
console.log(log.join('\n') || 'no errors');
await b.close();
