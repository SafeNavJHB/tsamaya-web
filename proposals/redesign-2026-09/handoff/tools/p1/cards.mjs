// node cards.mjs: open each hero card at 390 x 844 (full and static tiers) and 1440 x 900, and report where it lands against the headline.
import { chromium } from 'playwright';
const OUT = (process.env.OUT || decodeURIComponent(new URL('../out/p1/', import.meta.url).pathname));
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errs = [];
let bad = 0;
for (const [w, h, tier] of [[390, 844, ''], [390, 844, 'static'], [360, 740, ''], [360, 740, 'static'], [1440, 900, ''], [1440, 900, 'static']]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8795/' + (tier ? '?tier=' + tier : ''), { waitUntil: 'load' });
  await p.waitForFunction(() => window.__home && window.__home.ready);
  await p.waitForTimeout(4200);
  for (const q of ['hf', 'hl']) {
    await p.click(`[data-co="${q}"] button`);
    await p.waitForTimeout(700);
    const r = await p.evaluate((q) => {
      const c = document.querySelector(`[data-co="${q}"] .sp-card`).getBoundingClientRect();
      const s = document.querySelector('.home-hero-in > *').getBoundingClientRect();
      const rg = document.createRange(); rg.selectNodeContents(document.getElementById('hero-h')); const lines = [...rg.getClientRects()]; // the headline's text, line by line
      const ch = document.querySelector('.bchips').getBoundingClientRect();
      const t = document.querySelector(`[data-co="${q}"] button`).getBoundingClientRect();
      const ov = (a, b) => !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
      return { card: [c.left, c.top, c.right, c.bottom].map(Math.round), coversHeadline: lines.some((r) => ov(c, r)), coversSay: ov(c, s), coversChips: ov(c, ch), coversTag: ov(c, t), tagInView: t.left >= 0 && t.right <= innerWidth, tagUnderChips: ov(t, ch) && getComputedStyle(document.querySelector('.bchips')).visibility !== 'hidden', inView: c.left >= 0 && c.right <= innerWidth && c.top >= 0 && c.bottom <= innerHeight };
    }, q);
    const okc = !r.coversHeadline && !r.coversTag && r.inView && r.tagInView && !r.tagUnderChips;
    if (!okc) bad++;
    console.log(`${w}x${h}${tier ? ' ' + tier : ''} ${q}: ${okc ? 'ok ' : 'BAD'} ${JSON.stringify(r)}`);
    await p.screenshot({ path: `${OUT}card-${w}${tier ? '-' + tier : ''}-${q}.png` });
    await p.click(`[data-co="${q}"] button`);
    await p.waitForTimeout(200);
    if (await p.evaluate((q) => document.querySelector(`[data-co="${q}"]`).classList.contains('open'), q)) await p.keyboard.press('Escape');
    await p.waitForTimeout(300);
  }
  await p.close();
}
console.log(bad ? `FAIL ${bad} card placements cover the headline or their tag, leave the screen, or sit under the band chips` : 'PASS every hero card opens clear of the headline and its tag, inside the screen, with every tag whole and clear of the band chips');
console.log(errs.length ? 'errors ' + errs.join(' | ') : 'no page errors');
await b.close();
