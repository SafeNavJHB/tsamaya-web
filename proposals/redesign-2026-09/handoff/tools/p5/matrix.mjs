// node p5/matrix.mjs [page.html ...]: the Phase 5 device matrix, emulated. Each
// profile is an engine (Chromium for Android and Chrome, WebKit for iPhone and
// Safari, Firefox) with the device's window, pixel ratio and touch. For every
// page: script or three.js errors, sideways scroll, broken images, whether the
// header and the page's h1 are on screen, and the 3D tier chosen. Screenshots
// of each page's first screen go to out/p5/. Real devices still have the last
// word (GPU speed, fonts, Safari's own quirks); this is the wide net.
import { chromium, webkit, firefox } from 'playwright';
import { mkdirSync } from 'node:fs';
const OUT = new URL('../out/p5/', import.meta.url).pathname; mkdirSync(OUT, { recursive: true });
const H = 'http://localhost:8795/';
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; SM-A155F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36';
const IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const PROFILES = [
  { n: 'galaxy-a06', e: chromium, v: [360, 800], dpr: 2, touch: true, ua: ANDROID },
  { n: 'galaxy-a15', e: chromium, v: [412, 892], dpr: 2.625, touch: true, ua: ANDROID },
  { n: 'iphone-se', e: webkit, v: [375, 667], dpr: 2, touch: true, ua: IOS },
  { n: 'iphone-16', e: webkit, v: [393, 852], dpr: 3, touch: true, ua: IOS },
  { n: 'phone-landscape', e: webkit, v: [852, 393], dpr: 3, touch: true, ua: IOS },
  { n: 'ipad-portrait', e: webkit, v: [820, 1180], dpr: 2, touch: true },
  { n: 'laptop-chrome', e: chromium, v: [1366, 657], dpr: 1 },
  { n: 'laptop-safari', e: webkit, v: [1440, 789], dpr: 2 },
  { n: 'laptop-firefox', e: firefox, v: [1366, 657], dpr: 1 },
];
const pages = process.argv.slice(2).length ? process.argv.slice(2) : ['index.html', 'how-it-works.html', 'coverage.html', 'johannesburg.html', 'demo.html', 'updates.html', 'about.html', 'sponsor.html', 'track.html'];
const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
let bad = 0;
for (const pr of PROFILES.filter((x) => !only || only.includes(x.n))) {
  const args = pr.e === chromium ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : [];
  // a browser that cannot start here (Playwright's Firefox on macOS 27) is reported, not fatal
  let b;
  try { b = await pr.e.launch({ args }); } catch (e) { console.log(`== ${pr.n}: could not launch ${pr.e.name()} here (${e.message.split('\n')[0].slice(0, 80)})`); continue; }
  const opts = { viewport: { width: pr.v[0], height: pr.v[1] }, deviceScaleFactor: pr.dpr, hasTouch: !!pr.touch, colorScheme: process.env.COLOR || 'dark' };
  if (pr.e !== firefox && pr.touch) opts.isMobile = true;
  if (pr.ua) opts.userAgent = pr.ua;
  const ctx = await b.newContext(opts);
  await ctx.route(/cloudflareinsights/, (r) => r.abort());
  const rows = [];
  for (const pg of pages) {
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message.slice(0, 90)));
    p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|cloudflare|ERR_FAILED|404/.test(m.text())) errs.push(m.text().slice(0, 90)); });
    await p.goto(H + pg + (pg === 'track.html' ? '?id=x' : ''), { waitUntil: 'load', timeout: 45000 }).catch((e) => errs.push('load: ' + e.message.slice(0, 60)));
    await p.waitForTimeout(3500);
    const r = await p.evaluate(() => {
      const de = document.documentElement, h1 = document.querySelector('h1'), hb = h1 && h1.getBoundingClientRect(), head = document.querySelector('.site-header').getBoundingClientRect();
      const broken = [...document.images].filter((i) => i.complete && i.loading !== 'lazy' && i.naturalWidth === 0).length;
      const tier = (window.__home && window.__home.tier) || (window.__how && window.__how.tier) || de.className.match(/tier-(\w+)/)?.[1] || '-';
      return { sw: de.scrollWidth > de.clientWidth + 1, broken, h1: !!hb && hb.bottom > 0 && hb.top < innerHeight + 400, head: head.top >= -1 && head.height > 30, tier };
    }).catch((e) => ({ err: e.message }));
    const fails = [];
    if (errs.length) fails.push('errors: ' + [...new Set(errs)].slice(0, 2).join(' | '));
    if (r.sw) fails.push('sideways scroll');
    if (r.broken) fails.push(r.broken + ' broken images');
    if (!r.head) fails.push('header missing');
    if (r.err) fails.push(r.err);
    await p.screenshot({ path: `${OUT}${pr.n}-${pg.replace('.html', '')}.png` }).catch(() => {});
    rows.push(`${fails.length ? 'FAIL' : 'ok  '} ${pg.padEnd(18)} tier ${String(r.tier).padEnd(6)} ${fails.join('; ')}`);
    bad += fails.length ? 1 : 0;
    await p.close();
  }
  console.log(`== ${pr.n} (${pr.e.name()} ${pr.v.join('x')} @${pr.dpr}${pr.touch ? ' touch' : ''})\n  ` + rows.join('\n  '));
  await b.close();
}
console.log(bad ? `FAIL  ${bad} page loads with problems` : 'every profile loads every page clean');
