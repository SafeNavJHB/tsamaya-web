// Viewport frames at scroll positions: node frames.mjs url outPrefix width height [scale] [maxFrames] [stepFraction]
import { chromium } from 'playwright';
import { attachCdnRoutes } from './cdnroute.mjs';
const [,, url, out, w = '1440', h = '900', scale = '0.5', maxF = '14', step = '0.9', rm = ''] = process.argv;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: +scale, ignoreHTTPSErrors: true, reducedMotion: rm ? 'reduce' : 'no-preference' });
const log = [];
await attachCdnRoutes(ctx, log);
const p = await ctx.newPage();
p.on('pageerror', e => log.push('pageerror: ' + e.message));
p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|TOO_MANY_RETRIES/.test(m.text())) log.push('console: ' + m.text()); });
await p.goto(url, { waitUntil: 'networkidle' }).catch(e => log.push('goto ' + e.message));
await p.evaluate(() => document.fonts && document.fonts.ready);
await p.waitForTimeout(2600);
const H = await p.evaluate(() => document.documentElement.scrollHeight);
const vh = +h; let i = 0;
for (let y = 0; y < H && i < +maxF; y += Math.round(vh * +step), i++) {
  await p.evaluate((yy) => { if (window.lenis && window.lenis.scrollTo) window.lenis.scrollTo(yy, { immediate: true, force: true }); else window.scrollTo(0, yy); }, y);
  await p.waitForTimeout(1100);
  await p.screenshot({ path: `${out}-${String(i).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 80 });
}
const info = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, H: document.documentElement.scrollHeight, fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family).filter((v, i, a) => a.indexOf(v) === i).join(', '), libs: ['gsap', 'ScrollTrigger', 'SplitText', 'Lenis', 'THREE'].filter(k => k in window).join(',') }));
console.log(`frames ${i} | height ${info.H} | scrollWidth ${info.sw}/${info.iw}${info.sw > info.iw ? ' OVERFLOW' : ''} | fonts: ${info.fonts} | libs: ${info.libs}`);
if (log.length) console.log(log.slice(0, 12).join('\n'));
await b.close();
