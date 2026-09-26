// node herobudget.mjs: the hero's text height other than the headline, and
// where the disclaimer's right end sits against the Pause motion corner, per
// width. Feeds the short-screen headline rule in styles.css.
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
// The Pause motion button only exists once the 3D scene is live, so the
// corner is measured in the full tier (the static tier's corner is narrower).
const Q = process.argv[2] || '';
for (const w of (process.argv[3] || '768,800,900,960,1000,1024,1040,1060,1100,1280,1366,1440,1536,1920').split(',').map(Number)) {
  const ctx = await b.newContext({ viewport: { width: w, height: 700 } });
  const p = await ctx.newPage();
  await p.goto('http://localhost:8795/' + Q, { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => window.__home && window.__home.ready, null, { timeout: 30000 });
  await p.waitForTimeout(600);
  const r = await p.evaluate(() => {
    const q = (s) => document.querySelector(s).getBoundingClientRect();
    const first = q('.say'), h1 = q('#hero-h'), note = q('.hero-note');
    const rg = document.createRange(); rg.selectNodeContents(document.querySelector('.hero-note'));
    const noteRight = Math.max(...[...rg.getClientRects()].map((x) => x.right));
    return { other: Math.round(note.bottom - first.top - h1.height), noteRight: Math.round(noteRight), brLeft: Math.round(q('.hud-c.br').left), fs: parseFloat(getComputedStyle(document.querySelector('#hero-h')).fontSize) };
  });
  console.log(`${String(w).padEnd(5)} other text ${r.other}px  note right ${r.noteRight} vs pause corner left ${r.brLeft} ${r.noteRight > r.brLeft - 12 ? 'UNDER' : 'clear'}  (h1 ${r.fs}px)`);
  await ctx.close();
}
await b.close();
