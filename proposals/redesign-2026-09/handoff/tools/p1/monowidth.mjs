// node monowidth.mjs: the advance of Martian Mono (as the HUD sets it) against
// the system monospace fonts, for the Martian Mono Fallback faces' size-adjust.
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('http://localhost:8795/?tier=static', { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
const r = await p.evaluate(() => {
  const s = document.createElement('span');
  s.style.cssText = 'position:absolute;white-space:nowrap;font-size:100px;letter-spacing:0;visibility:hidden;font-weight:400';
  s.textContent = 'LOWER RISK IS NOT NO RISK. FREE, IN OPEN BETA 0123456789'; document.body.append(s);
  const hud = getComputedStyle(document.querySelector('.hero-note'));
  s.style.fontStretch = hud.fontStretch; s.style.fontWeight = hud.fontWeight;
  const out = { stretch: hud.fontStretch, weight: hud.fontWeight };
  for (const f of ["'Martian Mono'", 'Menlo', "'Courier New'", 'Monaco', "'SF Mono'", 'ui-monospace']) { s.style.fontFamily = f; out[f] = s.getBoundingClientRect().width / s.textContent.length / 100; }
  return out;
});
console.log('hud font-stretch', r.stretch, 'weight', r.weight);
for (const [k, v] of Object.entries(r)) if (typeof v === 'number') console.log(k.padEnd(16), 'advance', v.toFixed(4), 'em -> size-adjust', (100 * r["'Martian Mono'"] / v).toFixed(1) + '%');
await b.close();
