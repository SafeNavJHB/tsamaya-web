// node p2/explore.mjs [home|coverage]: every row of BUILD_PLAN table 5.1 (the
// explore map) with a mouse, a touch screen and the keyboard, in the 3D tier
// and the static tier, on the home page's chapter 4 (the default) or the
// coverage page. Prints PASS/FAIL per check; screenshots under tools/out/p2/.
import { chromium } from 'playwright';
const PAGE = process.argv[2] === 'coverage' ? 'coverage' : 'home';
const HOME = PAGE === 'home', PRE = HOME ? '' : 'cov-';
const OUT = process.env.OUT || decodeURIComponent(new URL('../out/p2/', import.meta.url).pathname);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
let fails = 0;
const check = (name, ok, detail = '') => { if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`); };
const errs = [];
// window.__t: the same few hooks on either page
const hooks = () => {
  const h = window.__home, c = window.__cov;
  window.__t = h
    ? { ready: () => h.ready, ex: () => h.ex(), xp: () => h.xp(), built: () => !!(h.state().ex && h.state().ex.built), flying: () => { const s = h.state(); return !!(s.ex && s.ex.flying); } }
    : { ready: () => c.ready, ex: () => c.ex(), xp: () => c.xp(), built: () => !!c.xp(), flying: () => !!(c.xp() && c.xp().flying()) };
};
async function open(w, h, q = '', extra = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, ...extra });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(`${w} ${q}: ${e.message}`));
  // the Cloudflare analytics beacon is refused on localhost (CORS); nothing of ours
  p.on('console', (m) => { if (m.type() === 'error' && !/cloudflare|ERR_FAILED/.test(m.text())) errs.push(`${w} ${q}: ${m.text()}`); });
  await p.goto('http://localhost:8795/' + (HOME ? '' : 'coverage.html') + q, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__home || window.__cov, null, { timeout: 30000 });
  await p.evaluate(hooks);
  await p.waitForFunction(() => window.__t.ready(), null, { timeout: 30000 });
  if (!q.includes('static')) await p.waitForFunction(() => window.__t.built(), null, { timeout: 30000 });
  if (HOME) {
    const y = await p.evaluate(() => document.getElementById('explore').getBoundingClientRect().top + scrollY);
    await p.evaluate((yy) => (window.lenis ? window.lenis.scrollTo(yy, { immediate: true, force: true }) : scrollTo(0, yy)), Math.round(y) + 2);
    if (!q.includes('static')) await p.waitForFunction(() => { const s = window.__home.state(); return Math.abs(s.cs - s.c) < 0.005 && s.ex.act; }, null, { timeout: 15000 }).catch(() => {});
  }
  if (q.includes('static')) await p.waitForFunction(() => window.__t.ex().svg, null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(600);
  return { ctx, p };
}
const ex = (p) => p.evaluate(() => window.__t.ex());
const settle = (p) => p.waitForFunction(() => !window.__t.flying(), null, { timeout: 6000 }).catch(() => {}).then(() => p.waitForTimeout(350));
const card = (p) => p.evaluate(() => { const c = document.getElementById('ex-card'), r = c.getBoundingClientRect(); return { on: c.classList.contains('is-on'), pin: c.classList.contains('is-pin'), name: document.getElementById('exc-n').textContent, link: document.getElementById('exc-a').getAttribute('href'), op: +getComputedStyle(c).opacity, r: [r.left, r.top, r.right, r.bottom].map(Math.round), inView: r.left >= 0 && r.right <= innerWidth && r.top >= 60 && r.bottom <= innerHeight }; });
const live = (p) => p.waitForTimeout(150).then(() => p.evaluate(() => document.getElementById('ex-live').textContent));

/* ---------- desktop, 3D ---------- */
{
  const { ctx, p } = await open(1440, 900);
  let s = await ex(p);
  check(`${PAGE} 3D 1440: the section is the view, all 12, no card`, s.act && s.lvl === 'nat' && s.sel < 0 && !(await card(p)).on);
  // 1. hover a metro on the map
  const at = await p.evaluate(() => window.__t.xp().screen('cape_town', 0.5));
  await p.mouse.move(at.x, at.y); await p.waitForTimeout(500);
  s = await ex(p); let c = await card(p);
  const row = await p.evaluate(() => document.querySelector('#ex-list button[data-m="0"]').classList.contains('hov'));
  check('hover a pillar: that metro lights, its card follows, its row too', s.hov === 0 && c.on && c.name === 'Cape Town' && c.inView && row, `hov ${s.hov} card ${c.name}`);
  await p.screenshot({ path: OUT + PRE + 'd-hover-map.png' });
  // 2. click it: fly in, card pinned
  await p.mouse.click(at.x, at.y); await settle(p);
  s = await ex(p); c = await card(p);
  check('click it: flies in, the card pins open with the metro page link', s.lvl === 'metro' && s.sel === 0 && c.pin && c.link === 'cape-town.html' && c.inView, `lvl ${s.lvl} sel ${s.sel}`);
  check('the live region reads the pick', /^Cape Town, Western Cape\. 909 rated areas\./.test(await live(p)), await live(p));
  if (HOME) check('the HUD names the metro', (await p.evaluate(() => document.getElementById('hud-place').textContent)) === 'Cape Town · Western Cape');
  await p.screenshot({ path: OUT + PRE + 'd-picked.png' });
  // 3. another metro from the list flies straight across
  await p.click('#ex-list button[data-m="5"]'); await settle(p);
  s = await ex(p);
  check('clicking another metro flies straight across', s.sel === 5 && s.lvl === 'metro');
  // 4. Escape back to all 12
  await p.keyboard.press('Escape'); await settle(p);
  s = await ex(p);
  check('Escape flies back to all 12', s.lvl === 'nat' && s.sel < 0 && /^All 12 metros\.$/.test(await live(p)));
  // 5. the Gauteng cluster at national scale
  await p.mouse.move(5, 5);
  const gc = await p.evaluate(() => window.__t.xp().cluster());
  // points near the cluster centre but off every pillar
  let hinted = false, hp = null;
  for (const [dx, dy] of [[0, 30], [0, -30], [30, 10], [-30, 10], [20, 40], [-20, 40], [0, 50]]) {
    await p.mouse.move(gc.x + dx, gc.y + dy); await p.waitForTimeout(250);
    const on = await p.evaluate(() => document.getElementById('ex-hint').classList.contains('is-on'));
    if (on) { hinted = true; hp = [gc.x + dx, gc.y + dy]; break; }
  }
  check('pointing at the Gauteng area names the cluster', hinted, hp ? hp.join(',') : 'no spot found');
  if (hp) {
    await p.mouse.click(hp[0], hp[1]); await settle(p);
    s = await ex(p);
    check('clicking it flies to the regional view', s.lvl === 'reg' && /^Gauteng and surrounds: 7 metros\.$/.test(await live(p)), s.lvl);
    await p.screenshot({ path: OUT + PRE + 'd-region.png' });
    const jo = await p.evaluate(() => window.__t.xp().screen('west_rand', 0.5));
    await p.mouse.move(jo.x, jo.y); await p.waitForTimeout(400);
    check('in the region each metro is easy to pick (West Rand lights)', (await ex(p)).hov === 6, `hov ${(await ex(p)).hov}`);
    await p.click('#ex-back'); await settle(p);
    check('Back to all 12 flies home', (await ex(p)).lvl === 'nat');
  }
  // 6. the band switch: rings change, pillar height does not
  // the pillar's height on screen (top minus base: the idle sway moves both alike)
  const height = () => p.evaluate(() => { const x = window.__t.xp(); return x.screen('cape_town', 0).y - x.screen('cape_town', 1).y; });
  const h0 = await height();
  await p.click('.exb[data-b="2"]'); await p.waitForTimeout(900);
  s = await ex(p);
  const h1 = await height();
  check('the band switch picks Night; pillar height unchanged', s.band === 2 && Math.abs(h0 - h1) <= 1 && (await p.getAttribute('.exb[data-b="2"]', 'aria-pressed')) === 'true', `band ${s.band} top ${h0}->${h1}`);
  await p.screenshot({ path: OUT + PRE + 'd-night.png' });
  // 7. keyboard on the list
  await p.focus('#ex-list button[data-m="0"]'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown');
  const foc = await p.evaluate(() => document.activeElement.dataset.m);
  s = await ex(p);
  check('arrows move along the list and light the metro', foc === '2' && s.hov === 2);
  await p.keyboard.press('Enter'); await settle(p);
  s = await ex(p);
  check('Enter flies in', s.sel === 2 && s.lvl === 'metro');
  const tabStops = await p.evaluate(() => [...document.querySelectorAll('#ex-list button')].filter((x) => x.tabIndex === 0).length);
  check('the list is one tab stop', tabStops === 1);
  await p.keyboard.press('Escape'); await settle(p);
  // Tab from a row goes on into its card's link; the card stays up around it
  await p.focus('#ex-list button[data-m="3"]'); await p.keyboard.press('Tab'); await p.waitForTimeout(400);
  const k = await p.evaluate(() => ({ id: document.activeElement.id, vis: getComputedStyle(document.getElementById('ex-card')).visibility, name: document.getElementById('exc-n').textContent }));
  check('Tab from a row goes into its card link, and the card stays up', k.id === 'exc-a' && k.vis === 'visible' && k.name === 'Ekurhuleni', JSON.stringify(k));
  await p.keyboard.press('Tab'); await p.waitForTimeout(400);
  check('Tab on out of the card ends the preview', (await ex(p)).hov < 0);
  await ctx.close();
}
/* ---------- phone, 3D, touch ---------- */
{
  const { ctx, p } = await open(390, 844, '', { hasTouch: true });
  const at = await p.evaluate(() => window.__t.xp().screen('durban', 0.5));
  await p.touchscreen.tap(at.x, at.y); await settle(p);
  let s = await ex(p), c = await card(p);
  const bk = await p.evaluate(() => { const b = document.getElementById('ex-back').getBoundingClientRect(), c = document.getElementById('ex-card').getBoundingClientRect(); return { above: b.bottom <= c.top + 1, vis: !document.getElementById('ex-back').hidden }; });
  check('390 touch: tapping a pillar picks it and flies in', s.sel === 2 && s.lvl === 'metro', `sel ${s.sel}`);
  check(HOME ? '390: the card docks under the map, Back above it' : '390: the card sits in its place under the map, Back above it', c.on && c.inView && bk.vis && bk.above, JSON.stringify(c.r));
  await p.screenshot({ path: OUT + PRE + 'm-picked.png' });
  await p.tap('#ex-back'); await settle(p);
  check('390: Back to all 12', (await ex(p)).lvl === 'nat');
  await p.tap('#ex-list button[data-m="1"]'); await settle(p);
  check('390: tapping a list row flies in', (await ex(p)).sel === 1);
  // a row low in the list, with the map scrolled away above: the map comes back
  const low = await p.evaluate(() => Math.round(document.getElementById('ex-list').getBoundingClientRect().bottom + scrollY - innerHeight + 20));
  await p.evaluate((y) => (window.lenis ? window.lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y)), low);
  await p.waitForTimeout(500);
  await p.tap('#ex-list button[data-m="11"]'); await p.waitForTimeout(1600); await settle(p);
  const rv = await p.evaluate(() => { const st = document.querySelector('.ex-stage').getBoundingClientRect(), c = document.getElementById('ex-card').getBoundingClientRect(); return { sel: window.__t.ex().sel, top: Math.round(st.top), card: Math.round(c.bottom) }; });
  check('390: a row tapped low in the list brings the map and card back into view', rv.sel === 11 && rv.top >= 60 && rv.top <= 76 && rv.card <= 844, JSON.stringify(rv));
  await ctx.close();
}
/* ---------- tablet, stacked (under 1024 wide), touch ---------- */
{
  const { ctx, p } = await open(820, 1180, '', { hasTouch: true });
  const low = await p.evaluate(() => Math.round(document.getElementById('ex-list').getBoundingClientRect().bottom + scrollY - innerHeight + 20));
  await p.evaluate((y) => (window.lenis ? window.lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y)), low);
  await p.waitForTimeout(600);
  const free = await p.evaluate(() => [...document.querySelectorAll('#ex-list button')].every((b) => { const r = b.getBoundingClientRect(); if (r.bottom > innerHeight || r.top < 70) return true; const e = document.elementFromPoint(r.right - 8, r.top + r.height / 2); return b.contains(e); }));
  check("820 tablet: nothing covers the list's rows", free);
  await p.tap('#ex-list button[data-m="11"]'); await p.waitForTimeout(1600); await settle(p);
  const t = await p.evaluate(() => {
    const ov = (a, q) => a.left < q.right && q.left < a.right && a.top < q.bottom && q.top < a.bottom;
    const c = document.getElementById('ex-card').getBoundingClientRect(), bk = document.getElementById('ex-back').getBoundingClientRect(), rows = [...document.querySelectorAll('#ex-list button')].map((x) => x.getBoundingClientRect());
    return { sel: window.__t.ex().sel, onRows: rows.some((r) => ov(c, r)), backOnCard: ov(bk, c), inView: c.top >= 60 && c.bottom <= innerHeight };
  });
  check('820 tablet: the pick brings the map back, its card clear of the rows and Back', t.sel === 11 && !t.onRows && !t.backOnCard && t.inView, JSON.stringify(t));
  await p.screenshot({ path: OUT + PRE + 't-picked.png' });
  await ctx.close();
}
/* ---------- static tier (reduced motion, no WebGL) ---------- */
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const { ctx, p } = await open(w, h, '?tier=static');
  let s = await ex(p);
  check(`static ${w}: the SVG map is up, a card shows`, s.svg && (await card(p)).on && !s.gl);
  const path = await p.evaluate(() => { const r = document.querySelector('.ex-map path[data-m="3"]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  if (w > 800) { await p.mouse.move(path.x, path.y); await p.waitForTimeout(300); s = await ex(p); check(`static ${w}: hovering an outline lights it and shows its card`, s.hov === 3 && (await card(p)).name === 'Ekurhuleni'); }
  await p.click('#ex-list button[data-m="4"]'); await p.waitForTimeout(300);
  s = await ex(p);
  const lit = await p.evaluate(() => document.querySelector('.ex-map path[data-m="4"]').classList.contains('on'));
  check(`static ${w}: picking from the list lights its outline, no camera`, s.sel === 4 && lit && (await card(p)).pin);
  const r0 = await p.getAttribute('.ex-map .rg:nth-of-type(1)', 'r');
  await p.click('.exb[data-b="2"]'); await p.waitForTimeout(300);
  const r2 = await p.getAttribute('.ex-map .rg:nth-of-type(1)', 'r');
  check(`static ${w}: the band switch resizes the rings`, r0 !== r2, `${r0} -> ${r2}`);
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  check(`static ${w}: Escape clears the pick`, (await ex(p)).sel < 0);
  await p.screenshot({ path: OUT + PRE + `s-${w}.png` });
  await ctx.close();
}
await b.close();
console.log(errs.length ? 'ERRORS: ' + errs.slice(0, 6).join(' | ') : 'no page errors');
console.log(fails ? `${fails} failure(s)` : 'every explore check passes');
