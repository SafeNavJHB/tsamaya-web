import { chromium } from 'playwright';
const [,, url, out, w = '400', h = '170', dpr = '2'] = process.argv;
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: +dpr })).newPage();
await p.goto(url); await p.waitForTimeout(500); await p.screenshot({ path: out }); await b.close();
