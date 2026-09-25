// node compare.mjs w h outDir [query]
// The prototype and the build at the same points of the story: the hero, each
// chapter at several progress points, the gaps between them, then the top of
// each flow section. Both pages pin their chapters for the same number of
// screen heights, so a chapter progress p maps to the same moment in both.
// Writes outDir/NN-name-proto.png and -build.png, and outDir/sheet-*.jpg pairs.
import { chromium } from 'playwright';
import { attachCdnRoutes } from '../cdnroute.mjs';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
const [,, w = '1440', h = '900', out = 'cmp', query = ''] = process.argv;
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
// [name, where]: where = ['pin', i, progress] | ['gap', i, fraction of the gap after pin i] | ['sec', selector] | ['after3', screens]
const POINTS = [
  ['hero', ['top']],
  ['ch1-fastest', ['pin', 0, 0.12]], ['ch1-reroute', ['pin', 0, 0.36]], ['ch1-bend', ['pin', 0, 0.62]], ['ch1-drive', ['pin', 0, 0.9]],
  ['gap-1-2', ['gap', 0, 0.55]],
  ['ch2-0730', ['pin', 1, 0.12]], ['ch2-1500', ['pin', 1, 0.3]], ['ch2-evening', ['pin', 1, 0.45]], ['ch2-night', ['pin', 1, 0.7]],
  ['gap-2-3', ['gap', 1, 0.5]],
  ['ch3-grow', ['pin', 2, 0.25]], ['ch3-labels', ['pin', 2, 0.85]],
  ['after-ch3', ['after3', 0.45]],
  ['how', ['sec', '#how']], ['coverage', ['sec', '#coverage']], ['faq', ['sec', '#faq']], ['get', ['sec', '#get']], ['help', ['sec', '#help']],
];
async function run(kind, url) {
  const ctx = await b.newContext({ viewport: { width: +w, height: +h }, ignoreHTTPSErrors: true });
  if (kind === 'proto') await attachCdnRoutes(ctx);
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(url, { waitUntil: kind === 'proto' ? 'networkidle' : 'load' }).catch(() => {});
  await p.evaluate(() => document.fonts.ready);
  if (kind === 'build') await p.waitForFunction(() => window.__home && window.__home.ready, null, { timeout: 30000 });
  await p.waitForTimeout(5200);
  const pins = await p.evaluate(() => (window.__home ? window.__home.state().pins : window.ScrollTrigger.getAll().filter((t) => t.pin).map((t) => [t.start, t.end])));
  const files = [];
  let n = 0;
  for (const [name, where] of POINTS) {
    let y = 0;
    if (where[0] === 'pin') y = pins[where[1]][0] + where[2] * (pins[where[1]][1] - pins[where[1]][0]);
    else if (where[0] === 'gap') y = pins[where[1]][1] + where[2] * (pins[where[1] + 1][0] - pins[where[1]][1]);
    else if (where[0] === 'after3') y = pins[2][1] + where[1] * +h;
    else if (where[0] === 'sec') y = await p.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + window.scrollY, where[1]);
    await p.evaluate((yy) => window.lenis.scrollTo(yy, { immediate: true, force: true }), Math.round(y));
    await p.waitForTimeout(1600);
    const f = `${out}/${String(n++).padStart(2, '0')}-${name}-${kind}.png`;
    await p.screenshot({ path: f });
    files.push(f);
  }
  await ctx.close();
  return { files, errs };
}
const P = await run('proto', 'http://localhost:8780/concept-4-sensor.html');
const B = await run('build', 'http://localhost:8795/' + query);
await b.close();
console.log('proto errors:', P.errs.length ? P.errs : 'none', '| build errors:', B.errs.length ? B.errs : 'none');
// sheets of pairs, prototype left and build right: desktop one pair per row,
// phone two pairs per row
const phoneSheet = +w < 800;
const cols = phoneSheet ? 4 : 2, cw = phoneSheet ? 300 : 720, per = phoneSheet ? 12 : 8;
const pairs = P.files.map((f, i) => [f, B.files[i]]).flat();
for (let s = 0; s * per < pairs.length; s++) {
  execFileSync('node', ['grid.mjs', `${out}/sheet-${s}.jpg`, String(cols), String(cw), ...pairs.slice(s * per, (s + 1) * per)]);
}
console.log('sheets written to', out);
