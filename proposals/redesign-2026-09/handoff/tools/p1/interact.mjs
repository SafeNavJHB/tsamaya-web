// node interact.mjs [base]: the checklist interactions (spec section 4, item 7).
// Prints one PASS/FAIL line per check and saves a few PNGs under p1/int-*.png.
import { chromium } from 'playwright';
const base = process.argv[2] || 'http://localhost:8795/';
const OUT = (process.env.OUT || decodeURIComponent(new URL('../out/p1/', import.meta.url).pathname));
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`); };
const errors = [];
async function open(url, w, h, extra = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, ignoreHTTPSErrors: true, ...extra });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errors.push(`${url} ${w}: pageerror ${e.message}`));
  p.on('console', (m) => { if (m.type() === 'error' && !/ERR_TUNNEL|cloudflareinsights/.test(m.text())) errors.push(`${url} ${w}: console ${m.text()}`); });
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__home && window.__home.ready, null, { timeout: 30000 });
  return { ctx, p };
}
const st = (p) => p.evaluate(() => window.__home.state());
const scrollTo = (p, y) => p.evaluate((yy) => { if (window.lenis) window.lenis.scrollTo(yy, { immediate: true, force: true }); else window.scrollTo(0, yy); }, y);
const settle = async (p, ms = 400) => {
  // wait until the scroll and the smoothed chapter clock stop moving
  let last = null;
  for (let i = 0; i < 60; i++) {
    await p.waitForTimeout(ms / 4);
    const now = await p.evaluate(() => [Math.round(window.scrollY), window.__home.state().cs].join());
    if (now === last) return;
    last = now;
  }
};
const cardUp = (p, id) => p.waitForFunction((i) => +getComputedStyle(document.getElementById(i)).opacity > 0.9, id, { timeout: 4000 }).catch(() => {});
const center = (p, sel) => p.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);

/* ---------- desktop, full tier ---------- */
{
  const { ctx, p } = await open(base, 1440, 900);
  await p.waitForTimeout(3600); // the intro: the route tags come up at about 2.9 s
  const s0 = await st(p);
  check('desktop loads the full tier with the scene live', s0.tier === 'full' && (await p.evaluate(() => document.getElementById('scene').classList.contains('is-live'))), `tier ${s0.tier}`);

  // band chips
  const live = s0.live, other = (live + 1) % 3, third = (live + 2) % 3;
  const pressed = () => p.evaluate(() => [...document.querySelectorAll('.bchip')].map((c) => (c.hidden ? 'h' : c.getAttribute('aria-pressed') === 'true' ? '1' : '0')).join(''));
  const backHidden = () => p.evaluate(() => document.querySelector('.bchip.lv').hidden);
  check('chips: the live band is pressed at load, Back to live hidden', (await pressed())[live] === '1' && (await backHidden()));
  await p.click(`.bchip[data-b="${other}"]`);
  await p.waitForTimeout(1300);
  let s = await st(p);
  check(`chips: ${other} pressed, scene band eases to it`, (await pressed())[other] === '1' && Math.abs(s.band - other) < 0.02 && s.preview === true, `band ${s.band.toFixed(3)} pressed ${await pressed()}`);
  check('chips: Back to live appears during a preview', !(await backHidden()));
  const pvText = await p.evaluate(() => document.querySelector('.hud-pv').textContent);
  check('chips: HUD says Previewing ... live now', /^Previewing .* live now: /.test(pvText), pvText);
  await p.screenshot({ path: OUT + 'int-chip-preview-d.png' });
  await p.click(`.bchip[data-b="${third}"]`);
  await p.waitForTimeout(1300);
  s = await st(p);
  check(`chips: ${third} pressed, scene band ${third}`, (await pressed())[third] === '1' && Math.abs(s.band - third) < 0.02, `band ${s.band.toFixed(3)}`);
  await p.click('.bchip.lv');
  await p.waitForTimeout(1300);
  s = await st(p);
  check('chips: Back to live returns to the live band and hides itself', (await backHidden()) && (await pressed())[live] === '1' && Math.abs(s.band - live) < 0.02 && !s.preview, `band ${s.band.toFixed(3)}`);

  // route spotlight: mouse hover
  const f = await center(p, '[data-co="hf"] button');
  await p.mouse.move(f.x, f.y, { steps: 4 });
  await cardUp(p, 'sp-f');
  s = await st(p);
  const open1 = await p.evaluate(() => { const el = document.querySelector('[data-co="hf"]'); const c = el.querySelector('.sp-card'); return { cls: el.classList.contains('open'), exp: el.querySelector('button').getAttribute('aria-expanded'), op: getComputedStyle(c).opacity, text: c.textContent }; });
  check('spotlight: mouse hover opens the Fastest card', s.spot === 'f' && open1.cls && open1.exp === 'true' && +open1.op > 0.9, JSON.stringify(open1));
  await p.screenshot({ path: OUT + 'int-spot-hover-d.png' });
  await p.mouse.move(40, 600, { steps: 4 });
  await p.waitForTimeout(400);
  s = await st(p);
  check('spotlight: leaving with the mouse closes it', s.spot === '');
  // keyboard: Tab from the link before it, Enter keeps it, Escape closes
  await p.focus('.home-cta .link-q');
  await p.keyboard.press('Tab');
  await p.waitForTimeout(250);
  const focused = await p.evaluate(() => document.activeElement.closest('[data-co]') && document.activeElement.closest('[data-co]').dataset.co);
  s = await st(p);
  check('spotlight: Tab focuses the Fastest tag and opens its card', focused === 'hf' && s.spot === 'f', `focused ${focused}`);
  await p.waitForTimeout(600);
  await p.keyboard.press('Enter');
  await p.waitForTimeout(250);
  s = await st(p);
  check('spotlight: Enter keeps it open (pinned)', s.spot === 'f' && s.pinned === true);
  await p.keyboard.press('Tab');
  await p.waitForTimeout(250);
  s = await st(p);
  check('spotlight: Tab on to the Lower-risk tag switches cards', s.spot === 'l');
  await p.keyboard.press('Enter');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(250);
  s = await st(p);
  const expAll = await p.evaluate(() => [...document.querySelectorAll('.spot button')].map((x) => x.getAttribute('aria-expanded')).join());
  check('spotlight: Escape closes it', s.spot === '' && expAll === 'false,false', expAll);
  await p.mouse.move(20, 880);

  // pause motion: the render loop stops and resumes
  await p.waitForTimeout(800);
  const fr = () => p.evaluate(() => window.__home.frames);
  let a = await fr(); await p.waitForTimeout(1000); let bb = await fr();
  check('pause: the loop runs while motion is on (full tier idle drift)', bb - a > 10, `${bb - a} frames/s`);
  await p.click('.pause');
  await p.waitForTimeout(600);
  a = await fr(); await p.waitForTimeout(1500); bb = await fr();
  const pl = await p.evaluate(() => ({ pressed: document.querySelector('.pause').getAttribute('aria-pressed'), label: document.querySelector('.pause .motion-label').textContent, cls: document.documentElement.classList.contains('motion-paused') }));
  check('pause: the loop stops (no frames in 1.5 s)', bb - a === 0 && pl.pressed === 'true' && pl.label === 'Play motion', `${bb - a} frames, ${JSON.stringify(pl)}`);
  // while paused, the visitor's own actions still redraw
  await p.click(`.bchip[data-b="${other}"]`);
  await p.waitForTimeout(1300);
  s = await st(p);
  check('pause: a chip still changes the scene while paused', Math.abs(s.band - other) < 0.02, `band ${s.band.toFixed(3)}`);
  await p.click('.bchip.lv');
  await p.waitForTimeout(1300);
  a = await fr(); await p.waitForTimeout(1000); bb = await fr();
  check('pause: and the loop stops again after it', bb - a === 0, `${bb - a} frames`);
  await p.click('.pause');
  await p.waitForTimeout(400);
  a = await fr(); await p.waitForTimeout(1000); bb = await fr();
  check('pause: Play motion resumes the loop', bb - a > 10, `${bb - a} frames/s`);

  // chapter 1 rail labels jump to their step
  const pins = (await st(p)).pins;
  await scrollTo(p, pins[0][0] + 30);
  await settle(p);
  const railOk = [];
  for (const i of [2, 0, 3, 1]) {
    await p.click(`#bend .rail-l button[data-step="${i}"]`);
    await p.waitForTimeout(1500);
    await settle(p);
    railOk.push((await st(p)).step === i ? 'ok' : `want ${i} got ${(await st(p)).step}`);
  }
  check('rail: each chapter 1 label jumps to its step', railOk.every((x) => x === 'ok'), railOk.join(' '));
  await p.screenshot({ path: OUT + 'int-rail-d.png' });

  // chapter 2: the day line at 02:00, the keyboard, the band rows
  await scrollTo(p, pins[1][0] + 200);
  await settle(p);
  const click0200 = await p.evaluate(() => { const r = document.querySelector('#dayline .dl-track').getBoundingClientRect(); return { x: r.left + ((1560 - 300) / 1440) * r.width, y: r.top + r.height / 2 }; });
  await p.mouse.click(click0200.x, click0200.y);
  await p.waitForTimeout(1800);
  await settle(p);
  s = await st(p);
  const on2 = await p.evaluate(() => [...document.querySelectorAll('#clocks .bands li')].findIndex((li) => li.classList.contains('on')));
  const mins = (t) => { const [hh, mm] = t.split(':').map(Number); return (hh < 5 ? hh + 24 : hh) * 60 + mm; };
  check('day line: a click at 02:00 lands on 02:00 (+-5 min), night row on', Math.abs(mins(s.clock) - (26 * 60)) <= 5 && on2 === 2, `clock ${s.clock}, row ${on2}`);
  await p.screenshot({ path: OUT + 'int-dayline-0200-d.png' });
  const vt = await p.evaluate(() => { const d = document.getElementById('dayline'); return [d.getAttribute('role'), d.getAttribute('aria-valuenow'), d.getAttribute('aria-valuetext'), d.tabIndex].join(' | '); });
  check('day line: a keyboard slider with a value text', /^slider \| \d+ \| .+ratings \| 0$/.test(vt), vt);
  await p.focus('#dayline');
  await p.keyboard.press('Home');
  await p.waitForTimeout(1800); await settle(p);
  const home = (await st(p)).clock;
  await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(1800); await settle(p);
  const plus60 = (await st(p)).clock;
  await p.keyboard.press('End');
  await p.waitForTimeout(1800); await settle(p);
  const end = (await st(p)).clock;
  check('day line: Home, two ArrowRight, End', home === '05:00' && plus60 === '06:00' && end === '04:55', `${home} ${plus60} ${end}`);
  const rowRes = [];
  for (const i of [1, 0, 2]) {
    await p.click(`#clocks .bands li[data-b="${i}"] button`);
    await p.waitForTimeout(1800); await settle(p);
    const r = await p.evaluate(() => [...document.querySelectorAll('#clocks .bands li')].findIndex((li) => li.classList.contains('on')));
    rowRes.push(`${i}:${(await st(p)).clock}:${r === i ? 'on' : 'row ' + r}`);
  }
  check('band rows jump to the middle of their band (11:15, 18:30, 00:15)', rowRes.join(' ') === '1:18:30:on 0:11:15:on 2:00:15:on', rowRes.join(' '));

  // Watch it re-route lands at the start of chapter 1
  await scrollTo(p, 0); await settle(p);
  await p.click('.home-cta .link-q');
  await p.waitForTimeout(2200); await settle(p);
  s = await st(p);
  check('"Watch it re-route" lands at the start of chapter 1', s.c >= 1 && s.c < 1.05, `c ${s.c.toFixed(3)}`);
  // lost context: the page drops to the static tier
  await p.evaluate(() => { const c = document.getElementById('gl'); const g = c.getContext('webgl2') || c.getContext('webgl'); g.getExtension('WEBGL_lose_context').loseContext(); });
  await p.waitForTimeout(1200);
  const lost = await p.evaluate(() => ({ cls: document.documentElement.className, tier: window.__home.tier, pins: document.querySelectorAll('.pin-spacer').length, poster: getComputedStyle(document.querySelector('.scene-poster')).opacity, fig: getComputedStyle(document.querySelector('#bend .plan-fig')).display }));
  check('lost context: static tier, no pins, poster back, figures shown', lost.tier === 'static' && !/is-cine/.test(lost.cls) && lost.pins === 0 && lost.poster === '1' && lost.fig !== 'none', JSON.stringify(lost));
  await p.screenshot({ path: OUT + 'int-lost-d.png' });
  await ctx.close();
}

/* ---------- phone, full tier: tap ---------- */
{
  const { ctx, p } = await open(base, 390, 844, { hasTouch: true });
  await p.waitForTimeout(3600);
  const f = await center(p, '[data-co="hf"] button');
  await p.touchscreen.tap(f.x, f.y);
  await cardUp(p, 'sp-f');
  let s = await st(p);
  const vis = await p.evaluate(() => { const c = document.querySelector('#sp-f'); const r = c.getBoundingClientRect(); return { op: getComputedStyle(c).opacity, l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top) }; });
  check('phone: a tap opens the Fastest card, inside the screen', s.spot === 'f' && +vis.op > 0.9 && vis.l >= 0 && vis.r <= 390, JSON.stringify(vis) + ' spot ' + s.spot);
  await p.screenshot({ path: OUT + 'int-spot-tap-m.png' });
  await p.waitForTimeout(500);
  await p.touchscreen.tap(f.x, f.y);
  await p.waitForTimeout(400);
  s = await st(p);
  check('phone: a second tap closes it', s.spot === '');
  const chipBox = await p.evaluate(() => [...document.querySelectorAll('.bchip:not([hidden])')].map((c) => Math.round(c.getBoundingClientRect().height)).join());
  check('phone: chips are 44 px tall tap targets', chipBox.split(',').every((h) => +h >= 44), chipBox);
  await ctx.close();
}

/* ---------- static tier (?tier=static), desktop and phone ---------- */
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const { ctx, p } = await open(base + '?tier=static', w, h, { hasTouch: w < 768 });
  await p.waitForTimeout(800);
  const s0 = await st(p);
  const other = (s0.live + 1) % 3;
  await p.click(`.bchip[data-b="${other}"]`);
  await p.waitForTimeout(200);
  const href = await p.evaluate(() => document.getElementById('poster-cells').getAttribute('href'));
  const s = await st(p);
  check(`static ${w}: a chip swaps the poster cells`, href === `#pl-c${other}` && s.band === other, href);
  await p.click('.bchip.lv');
  const f = await center(p, '[data-co="hf"] button');
  if (w < 768) await p.touchscreen.tap(f.x, f.y); else await p.mouse.move(f.x, f.y, { steps: 3 });
  await cardUp(p, 'sp-f');
  const sp = await st(p);
  const card = await p.evaluate(() => { const r = document.querySelector('#sp-f').getBoundingClientRect(); return { op: getComputedStyle(document.querySelector('#sp-f')).opacity, l: Math.round(r.left), r: Math.round(r.right) }; });
  check(`static ${w}: the spotlight opens as plain HTML`, sp.spot === 'f' && +card.op > 0.9 && card.l >= 0 && card.r <= w, JSON.stringify(card));
  await p.screenshot({ path: OUT + `int-static-spot-${w}.png` });
  await p.keyboard.press('Escape');
  await p.waitForTimeout(250);
  check(`static ${w}: Escape closes it`, (await st(p)).spot === '');
  await ctx.close();
}

console.log(`\n${results.filter((r) => r.ok).length}/${results.length} passed`);
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console or page errors');
await b.close();
