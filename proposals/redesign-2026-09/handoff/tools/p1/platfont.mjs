// node platfont.mjs: which font Chrome actually draws the hero in, with the web
// fonts blocked and loaded (CSS.getPlatformFontsForNode).
import { chromium } from 'playwright';
const b = await chromium.launch();
for (const block of [true, false]) {
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 } });
  const p = await ctx.newPage();
  if (block) await p.route(/\.woff2$/, (r) => r.abort());
  await p.goto('http://localhost:8795/?tier=static', { waitUntil: 'load' });
  await p.waitForTimeout(500);
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const out = [];
  for (const sel of ['.hero-sub', '#hero-h', '.say']) {
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: sel });
    const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
    const cs = await p.evaluate((s) => { const c = getComputedStyle(document.querySelector(s)); return c.fontSize + ' ' + c.fontStretch + ' lh ' + c.lineHeight; }, sel);
    out.push(`${sel}: ${fonts.map((f) => f.familyName + (f.isCustomFont ? '*' : '')).join(', ')} (${cs})`);
  }
  console.log(block ? 'blocked:' : 'loaded: ', out.join(' | '));
  await ctx.close();
}
await b.close();
