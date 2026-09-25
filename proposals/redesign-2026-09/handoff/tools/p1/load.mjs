// node load.mjs w h [throttle]: loading order and stability.
//  - the h1 is visible (opacity 1, visibility visible, in the viewport) at first paint
//  - LCP time and element; CLS over load + 6 s
//  - when three.scene.min.js and the scene modules were requested, against FCP
//  - when the canvas went live
// throttle: Lighthouse "Slow 4G" (150 ms RTT, 1.6 Mbps down) plus 4x CPU. The
// local python server does not compress, so throttled times are pessimistic.
import { chromium } from 'playwright';
const [,, w = '390', h = '844', throttle = ''] = process.argv;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ viewport: { width: +w, height: +h } });
const p = await ctx.newPage();
if (throttle) {
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
}
await p.addInitScript(() => {
  window.__load = { cls: 0, shifts: [], lcp: null, h1AtPaint: null, live: null };
  new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) { window.__load.cls += e.value; window.__load.shifts.push({ t: Math.round(e.startTime), v: +e.value.toFixed(4), nodes: e.sources.map((s) => s.node && (s.node.id || s.node.className || s.node.nodeName)).join(',') }); } })).observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver((l) => { const e = l.getEntries().pop(); window.__load.lcp = { t: Math.round(e.startTime), el: e.element ? (e.element.id || e.element.className || e.element.nodeName) : e.url, size: e.size }; }).observe({ type: 'largest-contentful-paint', buffered: true });
  // the h1's state in the first frame that paints
  const firstFrame = () => {
    const h1 = document.querySelector('h1');
    if (!h1) { requestAnimationFrame(firstFrame); return; }
    const cs = getComputedStyle(h1), r = h1.getBoundingClientRect();
    window.__load.h1AtPaint = { t: Math.round(performance.now()), opacity: cs.opacity, visibility: cs.visibility, top: Math.round(r.top), bottom: Math.round(r.bottom), text: h1.textContent };
  };
  requestAnimationFrame(firstFrame);
  const watch = new MutationObserver(() => { const s = document.getElementById('scene'); if (s && s.classList.contains('is-live') && !window.__load.live) window.__load.live = Math.round(performance.now()); });
  document.addEventListener('DOMContentLoaded', () => watch.observe(document.getElementById('scene'), { attributes: true }));
});
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
await p.goto(process.env.BASE || 'http://localhost:8795/', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(throttle ? 15000 : 6000);
const r = await p.evaluate(() => {
  const paint = Object.fromEntries(performance.getEntriesByType('paint').map((e) => [e.name, Math.round(e.startTime)]));
  const res = performance.getEntriesByType('resource').filter((e) => /three\.scene|scene\/|home\.js|site\.js|gsap|lenis|fonts\//.test(e.name)).map((e) => ({ f: e.name.replace(/^.*\//, ''), start: Math.round(e.startTime), end: Math.round(e.responseEnd) }));
  return { paint, load: window.__load, res };
});
const fcp = r.paint['first-contentful-paint'];
console.log(`${w}x${h}${throttle ? ' throttled (Slow 4G + 4x CPU) from ' + (process.env.BASE || 'the uncompressed python server') : ''}`);
console.log(`  FCP ${fcp} ms, LCP ${r.load.lcp && r.load.lcp.t} ms on ${r.load.lcp && r.load.lcp.el}, CLS ${r.load.cls.toFixed(4)}`, r.load.shifts.length ? JSON.stringify(r.load.shifts) : '(no shifts)');
console.log(`  h1 at first paint: ${JSON.stringify(r.load.h1AtPaint)}`);
for (const x of r.res) console.log(`  ${x.f.padEnd(24)} requested ${String(x.start).padStart(6)} ms  done ${String(x.end).padStart(6)} ms${/three|scene\//.test(x.f) || /engine|city|chapters|citygen/.test(x.f) ? (x.start > fcp ? '  (after FCP)' : '  BEFORE FCP') : ''}`);
console.log(`  canvas live at ${r.load.live} ms`);
const threeOk = r.res.filter((x) => /three\.scene|engine|city|chapters|citygen/.test(x.f)).every((x) => x.start > fcp);
const h1 = r.load.h1AtPaint;
console.log(`${h1 && h1.opacity === '1' && h1.visibility === 'visible' && h1.bottom <= +h && h1.top >= 0 ? 'PASS' : 'FAIL'}  h1 visible in the first painted frame`);
console.log(`${threeOk ? 'PASS' : 'FAIL'}  Three.js and the scene modules requested only after first paint`);
console.log(`${r.load.cls < 0.1 ? 'PASS' : 'FAIL'}  CLS ${r.load.cls.toFixed(4)} (budget 0.1)`);
console.log(errs.length ? 'errors: ' + errs.join(' | ') : 'no page errors');
await b.close();
