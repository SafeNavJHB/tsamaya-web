// Bytes on the wire for a full first visit: load, wait for idle work (the 3D
// scene), then scroll to the bottom so lazy images load too.
// Usage: node xfer.mjs <url> [width] [height] [reduce]
import { chromium } from 'playwright';

const url = process.argv[2];
const w = +(process.argv[3] || 390), h = +(process.argv[4] || 844);
const reduce = process.argv[5] === 'reduce';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: w, height: h }, ignoreHTTPSErrors: true, reducedMotion: reduce ? 'reduce' : 'no-preference' });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send('Network.enable');
await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
const reqs = new Map();
cdp.on('Network.responseReceived', (e) => { reqs.set(e.requestId, { url: e.response.url, type: e.type, bytes: 0, enc: e.response.headers['content-encoding'] || e.response.headers['Content-Encoding'] || '' }); });
cdp.on('Network.loadingFinished', (e) => { const r = reqs.get(e.requestId); if (r) r.bytes = e.encodedDataLength; });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(3500);
const initial = [...reqs.values()].reduce((s, r) => s + r.bytes, 0);
const H = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < H; y += Math.round(h * 0.8)) {
  await page.evaluate((y) => (window.lenis ? window.lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y)), y);
  await page.waitForTimeout(120);
}
await page.waitForTimeout(1500);
const all = [...reqs.values()];
const by = {};
for (const r of all) by[r.type] = (by[r.type] || 0) + r.bytes;
const total = all.reduce((s, r) => s + r.bytes, 0);
console.log(`${url} @ ${w}x${h}${reduce ? ' reduced-motion' : ''}`);
console.log(`initial (load + 3.5 s): ${(initial / 1024).toFixed(1)} KB | full scroll: ${(total / 1024).toFixed(1)} KB | requests ${all.length}`);
console.log(Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${(v / 1024).toFixed(1)}`).join(', '));
for (const r of all.sort((a, b) => b.bytes - a.bytes).slice(0, 14)) console.log(`  ${(r.bytes / 1024).toFixed(1).padStart(7)} KB ${r.enc.padEnd(4)} ${r.url.replace(/^https?:\/\/[^/]+/, '')}`);
console.log('three.js requested:', all.some((r) => /three\.scene/.test(r.url)));
if (errors.length) console.log('ERRORS:', errors.slice(0, 5));
await browser.close();
