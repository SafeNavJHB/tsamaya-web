// node p3-axe.mjs [page.html ...]: axe-core accessibility scan of whole pages at
// 1440 and 390 (violations only). Needs axe-core in node_modules (npm i axe-core).
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const axe = readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
const pages = process.argv.slice(2);
const b = await chromium.launch();
let bad = 0;
for (const pg of pages) for (const w of [1440, 390]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
  const p = await ctx.newPage();
  await p.goto('http://localhost:8795/' + pg, { waitUntil: 'load' });
  await p.waitForTimeout(800);
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } scrollTo(0, 0); });
  await p.waitForTimeout(1200);
  await p.addScriptTag({ content: axe });
  const v = await p.evaluate(async () => (await axe.run(document, { resultTypes: ['violations'] })).violations.map((x) => `${x.id} (${x.impact}): ${x.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`));
  bad += v.length;
  console.log(`${v.length ? 'FAIL' : 'PASS'}  ${pg} ${w}${v.length ? '\n    ' + v.join('\n    ') : ''}`);
  await ctx.close();
}
await b.close();
console.log(bad ? `${bad} violation(s)` : 'no axe violations');
