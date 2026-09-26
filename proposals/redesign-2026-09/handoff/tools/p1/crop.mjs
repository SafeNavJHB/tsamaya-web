// node crop.mjs in.png out.png x y w h [scale]
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
const [,, inp, out, x, y, w, h, sc = '1'] = process.argv;
const html = resolve(dirname(resolve(inp)), '_crop.html');
writeFileSync(html, `<body style="margin:0;overflow:hidden"><img src="${basename(inp)}" style="position:absolute;left:${-x}px;top:${-y}px"></body>`);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: +sc });
await p.goto('file://' + html);
await p.waitForTimeout(300);
await p.screenshot({ path: out });
await b.close();
