// node p3/metro.mjs: a metro page's band switch (public/js/metro.js) with a
// mouse, the keyboard and no JavaScript, checked against the built page's own
// figures. Numbers must only ever show true values (sampled every frame).
import { chromium } from 'playwright';
const b = await chromium.launch();
let fails = 0;
const check = (name, ok, detail = '') => { if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`); };
for (const pg of ['johannesburg', 'stellenbosch']) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(`http://localhost:8795/${pg}.html`, { waitUntil: 'load' });
  await p.waitForTimeout(600);
  const figs = await p.evaluate(() => [...document.querySelectorAll('.mx .tab')].map((t) => t.dataset.r));
  const now = await p.evaluate(() => window.Tsamaya.bands.indexOf(window.Tsamaya.bandAt(window.Tsamaya.saMinutes())));
  let s = await p.evaluate(() => ({ sel: [...document.querySelectorAll('.mx .tab')].findIndex((t) => t.getAttribute('aria-selected') === 'true'), n: document.getElementById('mx-n').textContent, nowMark: [...document.querySelectorAll('.mx .tab .now')].map((x) => x.textContent) }));
  check(`${pg}: starts on the band in force, marked Now`, s.sel === now && s.nowMark[now] === 'Now' && s.n.replace(/\s/g, '') === figs[now], JSON.stringify(s));
  // sample the number every frame while switching
  await p.evaluate(() => { window.__seen = new Set(); const t = () => { window.__seen.add(document.getElementById('mx-n').textContent.replace(/\s/g, '')); requestAnimationFrame(t); }; requestAnimationFrame(t); });
  for (const i of [0, 1, 2, 0]) { await p.click(`.mx .tab[data-b="${i}"]`); await p.waitForTimeout(400); }
  s = await p.evaluate(() => ({ sel: [...document.querySelectorAll('.mx .tab')].findIndex((t) => t.getAttribute('aria-selected') === 'true'), n: document.getElementById('mx-n').textContent, bar: document.querySelector('.tp-bar i').style.transform, lab: document.getElementById('mx-p').getAttribute('aria-labelledby'), seen: [...window.__seen] }));
  check(`${pg}: a click shows that band's figure, bar and label`, s.sel === 0 && s.n.replace(/\s/g, '') === figs[0] && s.lab === 'mx-t0' && s.bar.startsWith('scaleX('), JSON.stringify({ n: s.n, bar: s.bar }));
  check(`${pg}: only true figures ever shown`, s.seen.every((v) => figs.includes(v)), s.seen.join(','));
  await p.focus('.mx .tab[data-b="0"]'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(300);
  let k = await p.evaluate(() => ({ foc: document.activeElement.dataset.b, sel: [...document.querySelectorAll('.mx .tab')].findIndex((t) => t.getAttribute('aria-selected') === 'true'), tabstops: [...document.querySelectorAll('.mx .tab')].filter((t) => t.tabIndex === 0).length }));
  check(`${pg}: arrow keys move and select, one tab stop`, k.foc === '1' && k.sel === 1 && k.tabstops === 1, JSON.stringify(k));
  await p.keyboard.press('End'); await p.waitForTimeout(300);
  k = await p.evaluate(() => document.activeElement.dataset.b);
  check(`${pg}: End jumps to the last band`, k === '2');
  check(`${pg}: no page errors`, !errs.length, errs.join(' | '));
  await ctx.close();
  const nj = await b.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const q = await nj.newPage();
  await q.goto(`http://localhost:8795/${pg}.html`, { waitUntil: 'load' });
  const v = await q.evaluate(() => ({ tabs: getComputedStyle(document.querySelector('.mx .tabs')).display, rows: [...document.querySelectorAll('.tp-all b')].map((x) => x.textContent.replace(/\s/g, '')) }));
  check(`${pg}: without JavaScript the switch hides and the list gives every band`, v.tabs === 'none' && v.rows.join() === figs.join(), JSON.stringify(v));
  await nj.close();
}
// at 10:00 SAST the page (written showing night) switches to Daytime at once
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.clock.install({ time: new Date('2026-09-25T08:00:00Z') });
  await p.goto('http://localhost:8795/johannesburg.html', { waitUntil: 'load' });
  await p.waitForTimeout(100);
  const s = await p.evaluate(() => ({ sel: [...document.querySelectorAll('.mx .tab')].findIndex((t) => t.getAttribute('aria-selected') === 'true'), n: document.getElementById('mx-n').textContent.replace(/\s/g, ''), day: document.querySelector('.mx .tab[data-b="0"]').dataset.r, mark: document.querySelector('.mx .tab[data-b="0"] .now').textContent, swap: document.getElementById('mx-p').classList.contains('is-swap') }));
  check('10:00 SAST: starts on Daytime, marked Now, with no fade', s.sel === 0 && s.n === s.day && s.mark === 'Now' && !s.swap, JSON.stringify(s));
  await ctx.close();
}
await b.close();
console.log(fails ? `${fails} failure(s)` : 'every metro check passes');
