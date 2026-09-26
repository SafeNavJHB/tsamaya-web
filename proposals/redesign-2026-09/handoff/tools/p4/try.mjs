// node p4/try.mjs: "Try it", the toy router on How it works. Example trips, taps
// with a mouse and on a touch screen, the bands, and the readout held to the
// lines actually drawn: the emerald route's cells (sampled off its own path) are
// counted again here, and the numbers in the readout must match.
import { chromium } from 'playwright';
const H = 'http://localhost:8795/how-it-works.html';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
let fails = 0;
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fails++; };
// what the page drew, measured independently of its own readout
const drawn = (p) => p.evaluate(() => {
  const T = window.__try, pts = (sel) => { const e = document.querySelector(sel); if (!e) return null; return e.getAttribute('d').slice(1).split('L').map((s) => s.split(' ').map(Number)); };
  const s = pts('.try-s'), l = pts('.try-l');
  const count = (line, lv) => line ? T.crossed(line).filter((c) => T.lv(c) === lv).length : null;
  return { out: document.querySelector('.try-out').textContent, sHigh: count(s, 3), lHigh: count(l, 3), lMed: count(l, 2), hot: document.querySelectorAll('.try-hot').length, hasL: !!l, sLen: s && T.len(s), lLen: l && T.len(l) };
});
const truthful = (d) => {
  if (!d.hasL) return /no high-risk cell/.test(d.out) ? d.sHigh === 0 : /too long/.test(d.out) && d.hot === d.sHigh && d.sHigh > 0;
  const m = d.out.match(/^(\d+) high-risk cells? avoided/);
  const un = d.out.match(/; (\d+) high-risk cells? could not/);
  const med = d.out.match(/still passes (\d+) medium-risk/);
  return m && +m[1] === d.sHigh - d.lHigh && (un ? +un[1] : 0) === d.lHigh && (med ? +med[1] : 0) === d.lMed && d.lHigh < d.sHigh;
};
for (const [w, h, touch] of [[1440, 900, false], [390, 844, true]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch });
  await ctx.route(/cloudflareinsights/, (r) => r.abort());
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(H, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__try);
  await p.locator('#try').scrollIntoViewIfNeeded();
  const tag = `${w}${touch ? ' touch' : ''}`;
  for (const band of [0, 1, 2]) {
    await p.locator(`.try-b[data-b="${band}"]`).click();
    ok(await p.evaluate((b) => document.getElementById('try-cells').getAttribute('href') === '#pl-c' + b && window.__try.band === b, band), `${tag}: band ${band} shows its cells`);
    for (const k of [0, 1, 2]) {
      await p.locator('.try-trip').nth(k).click(); await p.waitForTimeout(150);
      const d = await drawn(p);
      ok(truthful(d), `${tag} band ${band} trip ${k + 1}: "${d.out}" (straight ${d.sHigh} high, route ${d.lHigh} high / ${d.lMed} medium)`);
    }
  }
  // two taps on the city itself, with the whole city in the window
  await p.evaluate(() => { const y = document.querySelector('.try-svg').getBoundingClientRect().top + scrollY - 76; if (window.lenis) window.lenis.scrollTo(y, { immediate: true, force: true }); else scrollTo(0, y); });
  await p.waitForTimeout(300);
  const box = await p.locator('.try-svg').boundingBox();
  ok(box.y >= 60 && box.y + box.height <= h + 1, `${w}: the whole city fits in the window (${Math.round(box.height)} px tall)`);
  const at = (fx, fy) => [box.x + box.width * fx, box.y + box.height * fy];
  const tap = async (fx, fy) => { const [x, y] = at(fx, fy); if (touch) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); await p.waitForTimeout(150); };
  await tap(0.12, 0.88);
  ok(/destination/.test(await p.locator('.try-out').textContent()) && await p.locator('.try-a').count() === 1, `${tag}: the first ${touch ? 'tap' : 'click'} sets the start`);
  await tap(0.88, 0.12);
  let d = await drawn(p);
  ok(d.sLen > 80 && truthful(d), `${tag}: the second sets the destination and routes: "${d.out}"`);
  await tap(0.1, 0.1); await tap(0.2, 0.12);
  d = await drawn(p);
  ok(truthful(d), `${tag}: a short hop: "${d.out}"`);
  ok(!errs.length, `${tag}: no page errors ${errs.join(' | ')}`);
  await ctx.close();
}
// without JavaScript the section is not shown
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, javaScriptEnabled: false });
  const p = await ctx.newPage();
  await p.goto(H, { waitUntil: 'load' });
  ok(!(await p.locator('#try').isVisible()), 'no JavaScript: Try it is not shown');
  await ctx.close();
}
await b.close();
console.log(fails ? `FAIL  ${fails}` : 'every try-it check passes');
