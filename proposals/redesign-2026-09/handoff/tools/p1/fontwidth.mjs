// node fontwidth.mjs: how much wider or narrower each system fallback sets the
// home page body copy than Archivo, at 16 px; the size-adjust values of the
// Archivo Fallback faces in styles.css come from here (Roboto was measured the
// same way against a copy of the Google Fonts file).
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('http://localhost:8795/?tier=static', { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
const r = await p.evaluate(() => {
  const txt = [...document.querySelectorAll('.hero-sub, .ch-p, .seq p, .lead, .faq-list p, .feat-grid dd')].map((e) => e.textContent).join(' ');
  const s = document.createElement('span');
  s.style.cssText = 'position:absolute;white-space:nowrap;font-size:16px;font-stretch:100%;letter-spacing:0;visibility:hidden';
  s.textContent = txt; document.body.append(s);
  const out = {};
  for (const wt of [400, 700]) for (const f of ["'Archivo'", 'system-ui', 'Arial', 'Helvetica', "'Helvetica Neue'"]) { s.style.fontFamily = f; s.style.fontWeight = wt; out[wt + ' ' + f] = s.getBoundingClientRect().width; }
  return out;
});
for (const wt of [400, 700]) { const a = r[wt + " 'Archivo'"]; for (const [k, v] of Object.entries(r)) if (k.startsWith(wt + ' ')) console.log(k.padEnd(22), (v / a).toFixed(4), '-> size-adjust', (100 * a / v).toFixed(2) + '%'); }
await b.close();
