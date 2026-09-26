import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1580, height: 560 } });
await p.goto(new URL('../out/p1/_plan.html', import.meta.url).href);
await p.waitForTimeout(800);
await p.screenshot({ path: decodeURIComponent(new URL('../out/p1/plan-lone-cell.png', import.meta.url).pathname) });
await b.close();
