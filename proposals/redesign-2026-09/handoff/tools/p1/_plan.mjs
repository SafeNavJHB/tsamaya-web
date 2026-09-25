import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1580, height: 560 } });
await p.goto('file:///tmp/claude-0/-home-user/cc91829d-9738-5aed-8992-96cc2510c765/scratchpad/p1/_plan.html');
await p.waitForTimeout(800);
await p.screenshot({ path: '/tmp/claude-0/-home-user/cc91829d-9738-5aed-8992-96cc2510c765/scratchpad/p1/plan-lone-cell.png' });
await b.close();
