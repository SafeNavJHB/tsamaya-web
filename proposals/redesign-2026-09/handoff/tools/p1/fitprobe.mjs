// node fitprobe.mjs [sizes]: chapter 3 on wide screens. At the end of the pin,
// is any coast point or metro label level with the panel's text also left of
// its right edge (an overlap)? Prints the fit (zoom, shift) and saves a frame.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const OUT = (process.env.OUT || decodeURIComponent(new URL('../out/p1/fit/', import.meta.url).pathname));
mkdirSync(OUT, { recursive: true });
const sizes = (process.argv[2] || '1280x720,1280x800,1366x768,1440x900,1536x864,1920x1080,2560x1440,1024x768,820x1180').split(',');
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
let bad = 0;
for (const sz of sizes) {
  const [w, h] = sz.split('x').map(Number);
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8795/', { waitUntil: 'load' });
  await p.waitForFunction(() => window.__home && window.__home.ready, null, { timeout: 30000 });
  await p.waitForTimeout(1500);
  const pins = await p.evaluate(() => window.__home.state().pins);
  const res = [];
  for (const f of [0.1, 0.9]) {
    await p.evaluate((yy) => window.lenis.scrollTo(yy, { immediate: true, force: true }), Math.round(pins[2][0] + f * (pins[2][1] - pins[2][0])));
    await p.waitForTimeout(1600);
    res.push(await p.evaluate(() => {
      const panel = document.querySelector('#metros .ch-panel'), rg = document.createRange();
      const walk = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT);
      let tr = -1, tt = 1e9, tb = -1e9;
      for (let n = walk.nextNode(); n; n = walk.nextNode()) {
        if (!n.data.trim() || n.parentElement.closest('.sr, .rail')) continue;
        rg.selectNodeContents(n);
        for (const r of rg.getClientRects()) { tr = Math.max(tr, r.right); tt = Math.min(tt, r.top); tb = Math.max(tb, r.bottom); }
      }
      // metro labels that are showing
      const tags = [...document.querySelectorAll('#callouts .co-m')].filter((e) => +e.style.opacity > 0.05).map((e) => e.firstElementChild.getBoundingClientRect());
      const over = tags.filter((r) => r.left < tr && r.bottom > tt && r.top < tb).length;
      const offR = tags.filter((r) => r.right > innerWidth || r.left < 0).length;
      // labels against each other
      let clash = 0;
      for (let i = 0; i < tags.length; i++) for (let j = i + 1; j < tags.length; j++) { const a = tags[i], b = tags[j]; if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) clash++; }
      return { tr: Math.round(tr), band: [Math.round(tt), Math.round(tb)], over, offR, clash, shown: tags.length, zoom: +(window.__home.state().zoom || 0).toFixed(2) };
    }));
    await p.screenshot({ path: `${OUT}${sz}-ch3-${f}.png` });
  }
  const ok = res.every((r) => !r.over && !r.offR && !r.clash) && !errs.length;
  if (!ok) bad++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${sz.padEnd(10)} text right ${res[1].tr}, labels shown ${res[1].shown}, over text ${res.map((r) => r.over)}, off screen ${res.map((r) => r.offR)}, overlapping ${res.map((r) => r.clash)}, zoom ${res[1].zoom} ${errs.length ? 'ERR ' + errs.join(' ') : ''}`);
  await ctx.close();
}
await b.close();
console.log(bad ? `${bad} size(s) failed` : 'all sizes pass (labels); check the frames for the coast');
