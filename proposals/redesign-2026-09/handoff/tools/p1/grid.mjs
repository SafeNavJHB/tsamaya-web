// node grid.mjs out.jpg cols cellWidth img1 img2 ...  (labels = file names)
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
const [,, out, cols, cw, ...imgs] = process.argv;
const dir = dirname(resolve(out));
const html = resolve(dir, '_grid_' + Date.now() + '.html');
const cells = imgs.map((i) => `<figure style="margin:0;width:${cw}px"><img src="${relative(dir, resolve(i))}" style="width:${cw}px;display:block"><figcaption style="font:11px monospace;color:#ddd;padding:2px 0">${relative(dir, resolve(i))}</figcaption></figure>`).join('');
writeFileSync(html, `<body style="margin:0;background:#333;display:grid;grid-template-columns:repeat(${cols},${cw}px);gap:6px;padding:6px;width:max-content">${cells}</body>`);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +cols * (+cw + 6) + 6, height: 400 } });
await p.goto('file://' + html);
await p.waitForTimeout(400);
await p.screenshot({ path: out, type: 'jpeg', quality: 78, fullPage: true });
await b.close();
