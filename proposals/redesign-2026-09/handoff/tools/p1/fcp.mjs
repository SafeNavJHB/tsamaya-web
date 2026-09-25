// node fcp.mjs [variant]: first paint and first-contentful paint for the home
// page at 412 x 823 (Lighthouse's phone), 4x CPU slowdown via CDP, SwiftShader
// GL like the Lighthouse run. Variants rewrite the HTML on the way in, to find
// what delays the first paint: none | noposter | nodefs | nosvg
import { chromium } from 'playwright';
const variant = process.argv[2] || 'none';
const runs = +(process.argv[3] || 3);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const out = [];
for (let i = 0; i < runs; i++) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 823 } });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await p.route((u) => u.pathname === '/' || u.pathname.endsWith('.html'), async (route) => {
    const r = await route.fetch();
    let html = await r.text();
    if (variant === 'noposter') html = html.replace(/<div class="scene-poster poster">[\s\S]*?<canvas id="gl">/, '<canvas id="gl">');
    if (variant === 'nodefs') html = html.replace(/<svg class="defs"[\s\S]*?<\/svg>/, '');
    if (variant === 'nosvg') html = html.replace(/<svg[\s\S]*?<\/svg>/g, '');
    await route.fulfill({ response: r, body: html, headers: { ...r.headers(), 'content-length': String(Buffer.byteLength(html)) } });
  });
  await p.goto(process.env.PAGE || 'http://localhost:8796/?tier=static', { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  const t = await p.evaluate(() => {
    const e = Object.fromEntries(performance.getEntriesByType('paint').map((x) => [x.name, Math.round(x.startTime)]));
    return new Promise((res) => new PerformanceObserver((l) => { const es = l.getEntries(); res({ ...e, lcp: Math.round(es[es.length - 1].startTime), lcpEl: es[es.length - 1].element && es[es.length - 1].element.id, bytes: document.documentElement.outerHTML.length }); }).observe({ type: 'largest-contentful-paint', buffered: true }));
  });
  out.push(t);
  await ctx.close();
}
await b.close();
console.log(variant.padEnd(9), out.map((t) => `FP ${t['first-paint']} FCP ${t['first-contentful-paint']} LCP ${t.lcp} (${t.lcpEl})`).join(' | '), `html ${out[0].bytes} chars`);
