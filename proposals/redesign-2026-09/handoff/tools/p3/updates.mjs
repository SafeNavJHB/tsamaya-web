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
  }
  shown = now;
  if (presses > 40) break;
}
ok(shown === total, `every release reachable (${shown} of ${total}, ${presses} presses)`);
ok(reqs.filter((u) => u.includes('updates-archive')).length === 1, 'the archive is fetched once');
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
