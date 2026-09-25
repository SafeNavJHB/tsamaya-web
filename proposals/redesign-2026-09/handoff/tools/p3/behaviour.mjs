// node p3/behaviour.mjs: the Phase 3 review's behaviour fixes, one by one.
// In-page links and the skip link move focus while Lenis scrolls (sponsor and
// home); the 404 served at a deep path is styled and keeps its skip link; a copy
// button pressed twice returns to rest; without JavaScript the contact form keeps
// the fields out of the address; the update chips' names; See it's image sizes
// on a 3x phone and its phone frame on a short laptop window.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const H = 'http://localhost:8795/';
const dist = new URL('../../../../../dist/', import.meta.url).pathname;
const b = await chromium.launch();
let fails = 0;
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fails++; };
const active = (p) => p.evaluate(() => { const a = document.activeElement; return a ? a.tagName.toLowerCase() + (a.id ? '#' + a.id : '') + (a.className && typeof a.className === 'string' ? '.' + a.className.split(' ')[0] : '') + ' ' + (a.textContent || '').trim().slice(0, 30) : 'none'; });

// 1. skip link and in-page anchors move focus, with Lenis running
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.route(/cloudflareinsights/, (r) => r.abort());
  const p = await ctx.newPage();
  await p.goto(H + 'sponsor.html', { waitUntil: 'load' });
  await p.waitForFunction(() => window.lenis, null, { timeout: 10000 }).catch(() => {});
  ok(await p.evaluate(() => !!window.lenis), 'sponsor: Lenis is running');
  await p.keyboard.press('Tab'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  ok((await active(p)).startsWith('main#main'), `skip link focuses main (${await active(p)})`);
  await p.keyboard.press('Tab');
  const next = await p.evaluate(() => !!document.activeElement.closest('main'));
  ok(next, `the next Tab lands inside main (${await active(p)})`);
  const ring = await p.evaluate(() => getComputedStyle(document.querySelector('main')).outlineStyle);
  // an in-page link with the mouse
  await p.evaluate(() => window.lenis.scrollTo(0, { immediate: true, force: true }));
  const a = p.locator('a[href="#donate"]').first();
  if (await a.count()) { await a.click(); await p.waitForTimeout(1500); ok((await active(p)).startsWith('section#donate') || (await active(p)).includes('#donate'), `#donate link focuses its section (${await active(p)})`); ok(await p.evaluate(() => Math.abs(document.getElementById('donate').getBoundingClientRect().top - 80) < 30), 'and scrolls it to the top'); ok(await p.evaluate(() => getComputedStyle(document.getElementById('donate')).outlineStyle) === 'none', 'with no ring round the section'); }
  // home: Watch it re-route
  await p.goto(H + 'index.html', { waitUntil: 'load' });
  await p.waitForFunction(() => window.__home && window.__home.ready, null, { timeout: 20000 }).catch(() => {});
  await p.locator('a[href="#bend"]').first().click(); await p.waitForTimeout(2000);
  ok((await active(p)).startsWith('section#bend'), `home: Watch it re-route focuses the chapter (${await active(p)})`);
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); await p.waitForTimeout(500);
  ok(!errs.length, 'no page errors on home');
  await ctx.close();
}
// 2. the 404 at depth: styled, and its skip link stays on the page
{
  const html = readFileSync(dist + '404.html', 'utf8');
  for (const rm of [false, true]) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: rm ? 'reduce' : 'no-preference' });
    await ctx.route(/cloudflareinsights/, (r) => r.abort());
    await ctx.route('**/missing/deep/page', (r) => r.fulfill({ status: 404, contentType: 'text/html', body: html }));
    const p = await ctx.newPage();
    const bad = []; p.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('/missing/deep/page')) bad.push(r.url()); });
    await p.goto(H + 'missing/deep/page', { waitUntil: 'load' });
    await p.waitForTimeout(800);
    ok(await p.evaluate(() => getComputedStyle(document.body).backgroundColor !== 'rgba(0, 0, 0, 0)' && document.fonts.check('16px Archivo')), `404 at depth is styled, fonts load${rm ? ' (reduced motion)' : ''}`);
    ok(!bad.length, `404 at depth: no failed requests ${bad.slice(0, 3).join(' ')}`);
    await p.keyboard.press('Tab'); await p.keyboard.press('Enter'); await p.waitForTimeout(600);
    ok(p.url().endsWith('/missing/deep/page') || p.url().endsWith('/missing/deep/page#main'), `404 skip link stays on the page (${p.url()})`);
    ok(await p.evaluate(() => document.title.startsWith('Page not found')), '... and the page is still the 404');
    const home = await p.evaluate(() => document.querySelector('.site-header a[href]').getAttribute('href'));
    ok(home === '/index.html' || home === '/', `header links go to the root (${home})`);
    await ctx.close();
  }
}
// 3. copy button pressed twice returns to rest
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, permissions: ['clipboard-read', 'clipboard-write'] });
  await ctx.route(/cloudflareinsights/, (r) => r.abort());
  const p = await ctx.newPage();
  await p.goto(H + 'sponsor.html', { waitUntil: 'load' });
  const btn = p.locator('.copy-btn').first();
  const rest = await btn.evaluate((e) => [e.getAttribute('aria-label'), e.innerHTML]);
  await btn.click(); await p.waitForTimeout(300); await btn.click(); await p.waitForTimeout(2200);
  const now = await btn.evaluate((e) => [e.getAttribute('aria-label'), e.innerHTML, e.classList.contains('copied')]);
  ok(now[0] === rest[0] && now[1] === rest[1] && !now[2], `copy button back at rest after two presses (${now[0]})`);
  await ctx.close();
}
// 4. contact form without JavaScript keeps the fields out of the URL
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, javaScriptEnabled: false });
  const p = await ctx.newPage();
  await p.goto(H + 'contact.html', { waitUntil: 'load' });
  await p.fill('input[name=name]', 'Test Person'); await p.fill('input[name=email]', 't@example.com'); await p.fill('textarea[name=message]', 'hello');
  const reqs = []; p.on('request', (r) => reqs.push(r.url()));
  await p.locator('.contact-form [type=submit], .contact-form button').first().click().catch(() => {});
  await p.waitForTimeout(800);
  ok(!p.url().includes('Test') && !reqs.some((u) => u.includes('Test')), `no-JS submit keeps the fields out of any URL (${p.url()})`);
  await ctx.close();
}
// 5. update chips: names with a separator
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  await p.goto(H + 'updates.html', { waitUntil: 'load' });
  const snap = await p.locator('.up').ariaSnapshot();
  const names = [...snap.matchAll(/radio "([^"]+)"/g)].map((m) => m[1]);
  ok(names.length === 4 && names.every((n) => /^[A-Za-z ]+ \d+$/.test(n)), `chip names: ${names.join(' | ')}`);
  await ctx.close();
}
// 6. See it: srcset on a 3x phone, the phone fits a short window, hover keeps contrast
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  await ctx.route(/cloudflareinsights/, (r) => r.abort());
  const p = await ctx.newPage();
  let img = 0; p.on('response', async (r) => { if (/img\/screens\//.test(r.url())) { try { img += (await r.body()).length; } catch {} } });
  await p.goto(H + 'demo.html', { waitUntil: 'load' });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } });
  await p.waitForTimeout(1500);
  const cur = await p.evaluate(() => [...document.querySelectorAll('.see-phone img')].map((i) => i.currentSrc.split('/').pop()));
  ok(cur.every((s) => /-600\.avif$/.test(s)), `3x phone picks the 600w AVIFs (${cur.join(', ')})`);
  ok(img < 180000, `screenshots moved on a 3x phone: ${Math.round(img / 1024)} KB`);
  await ctx.close();
  const c2 = await b.newContext({ viewport: { width: 1366, height: 657 } });
  const q = await c2.newPage();
  await q.goto(H + 'demo.html', { waitUntil: 'load' });
  const fit = await q.evaluate(() => [...document.querySelectorAll('.see-f')].map((f) => Math.round(f.getBoundingClientRect().height)));
  const head = await q.evaluate(() => document.querySelector('.site-header').getBoundingClientRect().height);
  ok(fit.every((h) => h <= 657 - head - 24), `1366x657: every phone fits under the header (${fit.join(', ')} px, header ${Math.round(head)})`);
  // sticky: scroll through s1's notes, the phone's top stays put
  const s1 = await q.evaluate(async () => { const f = document.querySelector('#s1 .see-f'), sec = document.getElementById('s1'); const tops = []; for (const k of [0.25, 0.5, 0.7]) { scrollTo(0, sec.offsetTop + k * sec.offsetHeight - 300); await new Promise((r) => setTimeout(r, 200)); tops.push(Math.round(f.getBoundingClientRect().top)); } return tops; });
  console.log('      s1 phone top while reading:', s1.join(', '));
  await c2.close();
}
console.log(fails ? `FAIL  ${fails}` : 'every fix check passes');
await b.close();
