// node p3/theme.mjs: light and dark. The device's theme by default; the header
// button switches and remembers; switching back to the device's theme forgets
// (the site follows the device again); the right theme is on the page before
// its first paint; the dark areas stay dark in the light theme; the header goes
// dark over them; without JavaScript the page follows the device.
import { chromium } from 'playwright';
const H = 'http://localhost:8795/';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
let fails = 0;
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fails++; };
const theme = (p) => p.evaluate(() => document.documentElement.getAttribute('data-theme'));
const bg = (p, s = 'body') => p.evaluate((s) => getComputedStyle(document.querySelector(s)).backgroundColor, s);
for (const dev of ['dark', 'light']) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: dev });
  await ctx.route(/cloudflareinsights/, (r) => r.abort());
  const p = await ctx.newPage();
  // the theme attribute is set before the stylesheet is parsed: check at the first frame
  await p.addInitScript(() => { window.__first = null; new MutationObserver(() => {}).observe(document, { childList: true }); requestAnimationFrame(() => { window.__first = document.documentElement.getAttribute('data-theme'); }); });
  await p.goto(H + 'about.html', { waitUntil: 'load' });
  ok(await theme(p) === dev, `device ${dev}: the page opens ${dev}`);
  ok(await p.evaluate(() => window.__first) === dev, `device ${dev}: already ${dev} at the first frame`);
  const other = dev === 'dark' ? 'light' : 'dark';
  const before = await bg(p);
  await p.locator('.theme-toggle').click(); await p.waitForTimeout(500);
  ok(await theme(p) === other && (await bg(p)) !== before, `the button switches to ${other}`);
  ok(await p.evaluate(() => localStorage.getItem('ts-theme')) === other, 'and remembers it');
  ok((await p.locator('.theme-toggle').getAttribute('aria-label')) === `Switch to ${dev} mode`, 'its label says where it goes next');
  await p.goto(H + 'coverage.html', { waitUntil: 'load' });
  ok(await theme(p) === other, 'the next page opens in the chosen theme');
  await p.locator('.theme-toggle').click(); await p.waitForTimeout(500);
  ok(await theme(p) === dev && await p.evaluate(() => localStorage.getItem('ts-theme')) === null, 'switching back to the device theme forgets the choice');
  // the device changes while nothing is stored: the page follows
  await p.emulateMedia({ colorScheme: other }); await p.waitForTimeout(500);
  ok(await theme(p) === other, `the device switching to ${other} carries the page with it`);
  await p.emulateMedia({ colorScheme: dev }); await p.waitForTimeout(500);
  await ctx.close();
}
// the canvas's own colour at a point (the renderer's clear colour where no dot is drawn)
const px = async (p, sel, fx = 0.02, fy = 0.02) => {
  const r = await p.locator(sel).boundingBox();
  const buf = await p.screenshot({ clip: { x: r.x + r.width * fx, y: r.y + r.height * fy, width: 3, height: 3 } });
  return p.evaluate(async (b64) => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode(); const c = document.createElement('canvas'); c.width = 3; c.height = 3; const g = c.getContext('2d'); g.drawImage(im, 0, 0); const d = g.getImageData(1, 1, 1, 1).data; return (0.2126 * d[0] + 0.7152 * d[1] + 0.0722 * d[2]) / 255; }, buf.toString('base64'));
};
// light: the 3D city and the maps are light too, and switch live with the button
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: 'light' });
  await ctx.route(/cloudflareinsights/, (r) => r.abort());
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  // three.js reports a bad material on the console, not as a page error
  p.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && /THREE|WebGL/.test(m.text())) errs.push(m.text()); });
  await p.goto(H + 'index.html', { waitUntil: 'load' });
  await p.waitForFunction(() => window.__home && window.__home.ready, null, { timeout: 30000 });
  await p.waitForTimeout(2500);
  const lum = (c) => { const m = c.match(/[\d.]+/g).map(Number); return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255; };
  ok(lum(await bg(p, 'body')) > 0.8, 'light: the page ground is light');
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('.home-hero .hero-h')).color).then((c) => lum(c) < 0.2), 'light: the hero headline over the scene is dark ink');
  const sky = await px(p, '.scene canvas');
  ok(sky > 0.8, `light: the 3D city is drawn on a light ground (${sky.toFixed(2)})`);
  await p.locator('.theme-toggle').click(); await p.waitForTimeout(900);
  const sky2 = await px(p, '.scene canvas');
  ok(sky2 < 0.15, `the button switches the running city to dark (${sky2.toFixed(2)})`);
  await p.locator('.theme-toggle').click(); await p.waitForTimeout(900);
  ok(await px(p, '.scene canvas') > 0.8, 'and back to light');
  ok(!errs.length, `no page or three.js errors ${errs.slice(0, 2).join(' | ')}`);
  await p.goto(H + 'how-it-works.html', { waitUntil: 'load' });
  ok(lum(await bg(p, '.hw-scene')) > 0.8, 'light: How it works draws its city on a light stage');
  await ctx.close();
}
// ?scenes=dark: the other way, night panels in a light page (remembered for the tab)
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: 'light' });
  await ctx.route(/cloudflareinsights/, (r) => r.abort());
  const p = await ctx.newPage();
  await p.goto(H + 'index.html?scenes=dark', { waitUntil: 'load' });
  await p.waitForFunction(() => window.__home && window.__home.ready, null, { timeout: 30000 });
  await p.waitForTimeout(2500);
  const lum = (c) => { const m = c.match(/[\d.]+/g).map(Number); return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255; };
  ok(lum(await bg(p, 'body')) > 0.8, 'scenes=dark: the page ground is still light');
  ok(await px(p, '.scene canvas') < 0.15, 'scenes=dark: the 3D city stays dark');
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('.home-hero .hero-h')).color).then((c) => lum(c) > 0.8), 'scenes=dark: the hero headline over it is light text');
  ok(await p.evaluate(() => document.querySelector('.site-header').classList.contains('on-dark')), 'scenes=dark: the header is dark over the scene');
  await p.goto(H + 'how-it-works.html', { waitUntil: 'load' });
  ok(lum(await bg(p, '.hw-scene')) < 0.1, 'scenes=dark: remembered on the next page (How it works keeps a dark stage)');
  await ctx.close();
}
// no JavaScript: the stylesheet follows the device, and the button is not shown
for (const dev of ['dark', 'light']) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: dev, javaScriptEnabled: false });
  const p = await ctx.newPage();
  await p.goto(H + 'about.html', { waitUntil: 'load' });
  const c = await bg(p);
  ok((dev === 'light') === (c === 'rgb(244, 246, 249)'), `no JavaScript, device ${dev}: the page is ${dev} (${c})`);
  ok(!(await p.locator('.theme-toggle').isVisible()), 'no JavaScript: no button');
  await ctx.close();
}
await b.close();
console.log(fails ? `FAIL  ${fails}` : 'every theme check passes');
