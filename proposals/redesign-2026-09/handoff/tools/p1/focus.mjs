import { chromium } from 'playwright';
const OUT = '/tmp/claude-0/-home-user/cc91829d-9738-5aed-8992-96cc2510c765/scratchpad/p1/';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:8795/', { waitUntil: 'load' });
await p.waitForFunction(() => window.__home && window.__home.ready);
await p.waitForTimeout(3800);
const shots = [];
// keyboard focus (Tab) so :focus-visible applies
async function tabTo(sel) { await p.focus('.home-cta .btn'); for (let i = 0; i < 40; i++) { if (await p.evaluate((s) => document.activeElement && document.activeElement.matches(s), sel)) return true; await p.keyboard.press(sel.startsWith('.bchip') ? 'Shift+Tab' : 'Tab'); } return false; }
for (const [name, sel, clip] of [['chip', '.bchip[data-b="1"]', { x: 1000, y: 70, width: 440, height: 90 }], ['spot', '[data-co="hf"] button', null]]) {
  await tabTo(sel);
  await p.waitForTimeout(500);
  const r = await p.evaluate((s) => { const e = document.querySelector(s).getBoundingClientRect(); return { x: e.left, y: e.top }; }, sel);
  await p.screenshot({ path: OUT + `focus-${name}.png`, clip: clip || { x: Math.max(0, r.x - 60), y: Math.max(0, r.y - 60), width: 460, height: 200 } });
}
const pins = (await p.evaluate(() => window.__home.state())).pins;
await p.evaluate((y) => window.lenis.scrollTo(y, { immediate: true, force: true }), pins[0][0] + 400);
await p.waitForTimeout(1500);
await p.focus('#bend .rail-l button[data-step="1"]'); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab');
await p.waitForTimeout(600);
await p.screenshot({ path: OUT + 'focus-rail.png', clip: { x: 100, y: 700, width: 600, height: 120 } });
await p.evaluate((y) => window.lenis.scrollTo(y, { immediate: true, force: true }), pins[1][0] + 400);
await p.waitForTimeout(1500);
await p.keyboard.press('Shift');
await p.evaluate(() => document.getElementById('dayline').focus({ preventScroll: true }));
await p.waitForTimeout(600);
await p.screenshot({ path: OUT + 'focus-dayline.png' });
console.log('active:', await p.evaluate(() => document.activeElement.id || document.activeElement.className));
await b.close();
