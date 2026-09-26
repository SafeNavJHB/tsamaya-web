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
// light: the dark areas stay dark, and the header over them
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: 'light' });
  await ctx.route(/cloudflareinsights/, (r) => r.abort());
  const p = await ctx.newPage();
  await p.goto(H + 'index.html', { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  const lum = (c) => { const m = c.match(/[\d.]+/g).map(Number); return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255; };
  ok(lum(await bg(p, 'body')) > 0.8, 'light: the page ground is light');
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('.home-hero .hero-h')).color).then((c) => lum(c) > 0.8), 'light: the hero headline over the scene stays light text');
  ok(await p.evaluate(() => document.querySelector('.site-header').classList.contains('on-dark')), 'light: the header is dark over the scene');
  await p.evaluate(() => window.lenis.scrollTo(document.querySelector('.home-flow').getBoundingClientRect().top + scrollY + 200, { immediate: true, force: true }));
  await p.waitForTimeout(800);
  ok(!(await p.evaluate(() => document.querySelector('.site-header').classList.contains('on-dark'))), 'light: and light again over the light sections');
  await p.goto(H + 'how-it-works.html', { waitUntil: 'load' });
  ok(lum(await bg(p, '.hw-scene')) < 0.1, 'light: How it works keeps its city on a dark stage');
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
