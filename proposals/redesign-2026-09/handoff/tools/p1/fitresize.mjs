// node fitresize.mjs: the chapter 3 fit after a window resize must equal the
// fit of a fresh load at the new size (it used to go stale: measured before
// ScrollTrigger re-pinned the section at its new width).
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const at3 = async (p) => {
  const st = await p.evaluate(() => window.__home.state());
  if (!st.pins) throw new Error('the 3D scene is not live (tier ' + st.tier + ')');
  const pins = st.pins;
  await p.evaluate((y) => window.lenis.scrollTo(y, { immediate: true, force: true }), Math.round(pins[2][0] + 0.6 * (pins[2][1] - pins[2][0])));
  await p.waitForTimeout(1800);
  return p.evaluate(() => { const f = window.__home.state().fit; return { z: +f.z.toFixed(2), dx: Math.round(f.dx) }; });
};
// A load where a library request fails falls back to the static tier, as
// designed; the local test server drops one now and then under heavy use, so
// such a load is logged with the failed request and retried once.
const open = async (w, h, retry = true) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const failed = [];
  p.on('requestfailed', (r) => { if (!/cloudflare/.test(r.url())) failed.push(r.url().replace(/^.*\//, '') + ' ' + (r.failure() || {}).errorText); });
  p.on('pageerror', (e) => console.log('  pageerror ' + e.message));
  await p.goto('http://localhost:8795/', { waitUntil: 'load' });
  await p.waitForFunction(() => window.__home && window.__home.ready, null, { timeout: 30000 });
  await p.waitForTimeout(1200);
  if (retry && (await p.evaluate(() => window.__home.tier)) === 'static') {
    console.log(`  (static tier at ${w}x${h}; failed requests: ${failed.join(', ') || 'none'}; retrying)`);
    await ctx.close();
    return open(w, h, false);
  }
  return { ctx, p };
};
let bad = 0;
for (const [a, c] of [[[1920, 1080], [1280, 720]], [[1440, 900], [1920, 1080]], [[1280, 800], [1440, 900]]]) {
  const { ctx, p } = await open(...a);
  await at3(p);
  await p.setViewportSize({ width: c[0], height: c[1] });
  await p.waitForTimeout(2500);
  const after = await at3(p);
  await ctx.close();
  const f = await open(...c);
  const fresh = await at3(f.p);
  await f.ctx.close();
  const ok = Math.abs(after.z - fresh.z) <= 0.02 && Math.abs(after.dx - fresh.dx) <= 3;
  if (!ok) bad++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${a.join('x')} -> ${c.join('x')}: after resize z ${after.z} dx ${after.dx} | fresh z ${fresh.z} dx ${fresh.dx}`);
}
await b.close();
console.log(bad ? `${bad} stale fit(s)` : 'the fit follows every resize');
