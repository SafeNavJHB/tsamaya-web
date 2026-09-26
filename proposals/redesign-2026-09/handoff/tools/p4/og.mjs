// node p4/og.mjs: draws the social image, public/img/og.png (1200 x 630), in the
// Sensor style from the site's own parts: the fonts, the app icon and the flat
// plan of the illustrative city with both routes (src/poster.mjs). Needs the
// site served on http://localhost:8795 (dist). No figures on it: a counted
// number in a picture would go out of date the day the data changes. Saved as
// a palette PNG with the repo's sharp (about 130 KB instead of 420).
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { posterDefs, planSvg } from '../../../../../src/poster.mjs';
const out = fileURLToPath(new URL('../../../../../public/img/og.png', import.meta.url));
const O = 'http://localhost:8795/';
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Archivo; src: url(${O}fonts/archivo-latin.woff2) format('woff2'); font-weight: 100 900; font-stretch: 62% 125%; }
@font-face { font-family: 'Martian Mono'; src: url(${O}fonts/martian-mono-latin.woff2) format('woff2'); font-weight: 100 800; }
html, body { margin: 0; }
.og { position: relative; width: 1200px; height: 630px; overflow: hidden; background: #0a0f1c; font-family: Archivo, sans-serif; color: #f1f5fa; }
.city { position: absolute; left: 560px; top: -150px; width: 820px; height: 820px; transform: perspective(1600px) rotateX(48deg) rotateZ(-36deg); }
.city svg { width: 100%; height: 100%; }
.fade { position: absolute; inset: 0; background: linear-gradient(90deg, #0a0f1c 34%, rgba(10, 15, 28, 0.85) 48%, rgba(10, 15, 28, 0) 70%), linear-gradient(0deg, rgba(10, 15, 28, 0.9), rgba(10, 15, 28, 0) 30%); }
.t { position: absolute; left: 80px; top: 72px; right: 540px; }
.brand { display: flex; align-items: center; gap: 16px; font-size: 38px; font-weight: 800; font-stretch: 112%; letter-spacing: -0.02em; }
.brand img { width: 58px; height: 58px; border-radius: 14px; }
.hud { font-family: 'Martian Mono', monospace; font-size: 17px; letter-spacing: 0.1em; text-transform: uppercase; color: #c9d6e3; }
.say { margin-top: 64px; }
h1 { margin: 18px 0 0; font-size: 84px; font-weight: 800; font-stretch: 118%; letter-spacing: -0.02em; line-height: 0.95; }
.url { position: absolute; left: 80px; bottom: 60px; color: #34d399; }
</style></head><body><div class="og">
${posterDefs()}
<div class="city">${planSvg(2, { routes: true })}</div>
<div class="fade"></div>
<div class="t">
  <div class="brand"><img src="${O}img/icon.png" alt="">Tsamaya</div>
  <p class="hud say">Lower-risk driving routes · South Africa</p>
  <h1>Go where the trouble isn't.</h1>
</div>
<p class="hud url">tsamayaapp.co.za</p>
</div></body></html>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await p.goto(O + 'index.html', { waitUntil: 'domcontentloaded' });
await p.setContent(html, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(300);
const shot = await p.screenshot({ clip: { x: 0, y: 0, width: 1200, height: 630 } });
await b.close();
const sharp = createRequire(new URL('../../../../../package.json', import.meta.url))('sharp');
writeFileSync(out, await sharp(shot).png({ palette: true, quality: 92, effort: 10, compressionLevel: 9 }).toBuffer());
console.log('wrote', out);
