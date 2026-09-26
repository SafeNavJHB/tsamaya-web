// node p3/updates.mjs: Updates shows the newest releases, "Show earlier updates"
// adds the rest a batch at a time (with JavaScript) or opens the archive page
// (without), and the filters keep working on everything shown.
import { chromium } from 'playwright';
const H = 'http://localhost:8795/';
const b = await chromium.launch();
let fails = 0;
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fails++; };
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.route(/cloudflareinsights/, (r) => r.abort());
const p = await ctx.newPage();
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
const reqs = []; p.on('request', (r) => reqs.push(r.url()));
await p.goto(H + 'updates.html', { waitUntil: 'load' });
const rels = () => p.evaluate(() => document.querySelectorAll('.up-tl > .rel').length);
const total = await p.evaluate(() => +document.querySelector('.up-stats .num').textContent);
ok(await rels() === 10, `the page opens with the newest 10 releases (of ${total})`);
ok(!reqs.some((u) => u.includes('updates-archive')), 'nothing earlier is fetched until asked');
const chipsTrue = () => p.evaluate(() => [...document.querySelectorAll('.chip[for^="f-"]')].every((c) => { const k = c.getAttribute('for').slice(2); return +c.querySelector('.num').textContent === document.querySelectorAll(k === 'all' ? '.up-tl .it' : `.up-tl .it[data-c="${k}"]`).length; }));
ok(await chipsTrue(), 'the chips count what is on the page');
const scope = () => p.evaluate(() => document.querySelector('[data-scope]').textContent);
ok(/^The 10 most recent updates · .+ 2026$/.test(await scope()), `the page says what the list holds: "${await scope()}"`);
let shown = 10, presses = 0;
while (await p.locator('.up-more').count()) {
  await p.locator('.up-more').click(); presses++;
  await p.waitForFunction((n) => document.querySelectorAll('.up-tl > .rel').length > n || !document.querySelector('.up-more'), shown);
  const now = await rels();
  if (presses === 1) {
    ok(now === 20, `first press adds 10 (${now})`);
    ok(await p.evaluate(() => document.activeElement.classList.contains('tl-d')), 'focus moves to the first release added');
    ok(/10 earlier releases added/.test(await p.locator('[data-more-status]').textContent()), 'the change is announced');
    const left = await p.locator('.up-more .num').textContent();
    ok(left === `${total - 20} more`, `the button counts what is left (${left})`);
    ok(/^The 20 most recent updates · /.test(await scope()), `the line above the chips follows: "${await scope()}"`);
  }
  shown = now;
  if (presses > 40) break;
}
ok(shown === total, `every release reachable (${shown} of ${total}, ${presses} presses)`);
ok(await chipsTrue(), 'the chips still count what is on the page');
ok(/^All \d+ updates · 25 June to .+ 2026$/.test(await scope()), `and says when it holds them all: "${await scope()}"`);
ok(reqs.filter((u) => u.includes('updates-archive')).length === 1, 'the archive is fetched once');
// the last press with Bug fixes on keeps focus off the body (review 2026/09/26)
{
  const q = await ctx.newPage();
  await q.goto(H + 'updates.html', { waitUntil: 'load' });
  await q.locator('label[for=f-fix]').click();
  while (await q.locator('.up-more').count()) { await q.locator('.up-more').focus(); await q.keyboard.press('Enter'); await q.waitForTimeout(120); }
  ok(await q.evaluate(() => document.activeElement !== document.body), `after the last press, focus is on ${await q.evaluate(() => document.activeElement.className || document.activeElement.tagName)}`);
  await q.close();
}
// filters over what was added
await p.locator('label[for=f-fix]').click();
const wrong = await p.evaluate(() => [...document.querySelectorAll('.up-tl .it')].filter((e) => e.offsetParent && e.dataset.c !== 'fix').length);
const fixes = await p.evaluate(() => [...document.querySelectorAll('.up-tl .it')].filter((e) => e.offsetParent).length);
const chip = +(await p.locator('label[for=f-fix] .num').textContent());
ok(!wrong && fixes === chip, `Bug fixes shows ${fixes} items, the chip says ${chip}, none of another kind`);
ok(!errs.length, `no page errors ${errs.join(' | ')}`);
// without JavaScript: the button is a link to the archive
const c2 = await b.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
const q = await c2.newPage();
await q.goto(H + 'updates.html', { waitUntil: 'load' });
await Promise.all([q.waitForNavigation(), q.locator('.up-more').click()]);
ok(q.url().endsWith('updates-archive.html'), 'without JavaScript it opens the archive page');
const ar = await q.evaluate(() => document.querySelectorAll('.up-tl > .rel').length);
ok(ar === total - 10, `the archive lists the ${ar} earlier releases`);
await b.close();
console.log(fails ? `FAIL  ${fails}` : 'every updates check passes');
