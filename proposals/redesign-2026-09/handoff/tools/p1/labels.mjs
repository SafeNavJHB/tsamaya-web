// node labels.mjs: chapter 3's metro labels and list. Names only by default;
// hovering, focusing or pressing a list row, or hovering or clicking a label,
// opens that metro's count and lights its pillar; Escape clears; a label hidden
// to avoid an overlap comes back when its row is hovered.
import { chromium } from 'playwright';
const OUT = (process.env.OUT || decodeURIComponent(new URL('../out/p1/', import.meta.url).pathname));
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
let fails = 0;
const check = (name, ok, detail = '') => { if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`); };
async function at3(w, h) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8795/', { waitUntil: 'load' });
  await p.waitForFunction(() => window.__home && window.__home.ready && window.__home.state().pins, null, { timeout: 30000 });
  const pins = await p.evaluate(() => window.__home.state().pins);
  await p.evaluate((y) => window.lenis.scrollTo(y, { immediate: true, force: true }), Math.round(pins[2][0] + 0.8 * (pins[2][1] - pins[2][0])));
  // the smoothed clock catches up with the scroll (slow under software GL)
  await p.waitForFunction(() => { const s = window.__home.state(); return Math.abs(s.cs - s.c) < 0.005; }, null, { timeout: 15000 });
  await p.waitForTimeout(400);
  return { ctx, p, errs };
}
const countOp = (p, k) => p.evaluate((k) => +getComputedStyle(document.querySelector(`#callouts [data-k="${k}"] .co-n`)).opacity, k);
const st = (p) => p.evaluate(() => window.__home.state());
{
  const { ctx, p, errs } = await at3(1440, 900);
  const s0 = await st(p);
  check('1440: all six labels, names only', s0.labels.length === 6 && (await countOp(p, 'cape_town')) === 0, s0.labels.join(','));
  const row = p.locator('#metros .m-list li[data-k="durban"] button');
  await row.hover(); await p.waitForTimeout(450);
  let s = await st(p);
  check('hover a row: its label opens its count', s.shown === 'durban' && (await countOp(p, 'durban')) > 0.95, `shown ${s.shown}`);
  await p.screenshot({ path: OUT + 'labels-hover-row-1440.png' });
  await p.mouse.move(5, 5); await p.waitForTimeout(450);
  s = await st(p);
  check('leave the row: closed again', s.shown === '' && (await countOp(p, 'durban')) < 0.05);
  const tag = p.locator('#callouts [data-k="cape_town"] .co-tag');
  await tag.hover(); await p.waitForTimeout(450);
  s = await st(p);
  check('hover a label on the map: its count opens', s.shown === 'cape_town' && (await countOp(p, 'cape_town')) > 0.95, `shown ${s.shown}`);
  await p.screenshot({ path: OUT + 'labels-hover-map-1440.png' });
  await tag.click(); await p.mouse.move(5, 5); await p.waitForTimeout(450);
  s = await st(p);
  const pressed = await p.evaluate(() => document.querySelector('#metros li[data-k="cape_town"] button').getAttribute('aria-pressed'));
  check('click a label: it stays open, its row is pressed', s.pin === 'cape_town' && s.shown === 'cape_town' && pressed === 'true');
  await p.keyboard.press('Escape'); await p.waitForTimeout(450);
  s = await st(p);
  check('Escape closes it', s.pin === '' && s.shown === '');
  await p.focus('#metros li[data-k="gqeberha"] button'); await p.waitForTimeout(450);
  s = await st(p);
  check('focus a row with the keyboard: it opens', s.shown === 'gqeberha');
  await p.keyboard.press('Enter'); await p.keyboard.press('Tab'); await p.waitForTimeout(450);
  s = await st(p);
  check('Enter pins it, Tab onward previews the next', s.pin === 'gqeberha' && s.shown !== '', `pin ${s.pin} shown ${s.shown}`);
  check('no page errors at 1440', !errs.length, errs.join(' | '));
  await ctx.close();
}
{
  const { ctx, p, errs } = await at3(800, 600);
  const s0 = await st(p);
  const hidden = ['cape_town', 'johannesburg', 'durban', 'ekurhuleni', 'pretoria', 'gqeberha'].filter((k) => !s0.labels.includes(k));
  check('800x600: a label gives way instead of overlapping', hidden.length >= 1, `hidden ${hidden}`);
  if (hidden.length) {
    await p.locator(`#metros .m-list li[data-k="${hidden[0]}"] button`).hover(); await p.waitForTimeout(450);
    const s = await st(p);
    check('hovering its row brings the hidden label back, open', s.labels.includes(hidden[0]) && s.shown === hidden[0], `labels ${s.labels}`);
    await p.screenshot({ path: OUT + 'labels-hidden-back-800.png' });
  }
  check('no page errors at 800', !errs.length, errs.join(' | '));
  await ctx.close();
}
{
  const { ctx, p, errs } = await at3(390, 844);
  await p.locator('#metros .m-list li[data-k="johannesburg"] button').tap().catch(async () => p.locator('#metros .m-list li[data-k="johannesburg"] button').click());
  await p.waitForTimeout(450);
  const s = await st(p);
  check('390 phone: tapping a row pins that metro (its pillar lights)', s.pin === 'johannesburg', `pin ${s.pin}`);
  await p.screenshot({ path: OUT + 'labels-phone-390.png' });
  check('no page errors at 390', !errs.length, errs.join(' | '));
  await ctx.close();
}
await b.close();
console.log(fails ? `${fails} failure(s)` : 'all label checks pass');
