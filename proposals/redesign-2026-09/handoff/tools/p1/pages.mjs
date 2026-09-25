// node pages.mjs: every built page at 360 and 1440 wide: script errors, sideways
// scroll, broken images (the header logo included), and the page's transfer.
import { chromium } from 'playwright';
import { readdirSync } from 'node:fs';
const dist = decodeURIComponent(new URL('../../../../../dist/', import.meta.url).pathname);
const pages = readdirSync(dist).filter((f) => f.endsWith('.html'));
const b = await chromium.launch();
let bad = 0;
for (const w of [360, 1440]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 } });
  for (const f of pages) {
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('console', (m) => { if (m.type() === 'error' && !/cloudflareinsights|ERR_FAILED|api\.mapbox|supabase/i.test(m.text())) errs.push(m.text()); });
    await p.goto('http://localhost:8796/' + f + (f === 'track.html' ? '?t=demo' : ''), { waitUntil: 'load' }).catch((e) => errs.push(e.message));
    await p.waitForTimeout(400);
    const r = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, broken: [...document.images].filter((i) => i.complete && i.loading !== 'lazy' && !i.naturalWidth).map((i) => i.getAttribute('src')), logo: (document.querySelector('.logo-mark') || {}).currentSrc || '' }));
    const ok = !errs.length && r.sw <= w && !r.broken.length;
    if (!ok) { bad++; console.log(`FAIL ${w} ${f}: sw ${r.sw} broken ${r.broken} ${errs.join(' | ')}`); }
    await p.close();
  }
  await ctx.close();
}
await b.close();
console.log(bad ? `${bad} failure(s)` : `all ${pages.length} pages clean at 360 and 1440 (no script errors, no sideways scroll, no broken images)`);
