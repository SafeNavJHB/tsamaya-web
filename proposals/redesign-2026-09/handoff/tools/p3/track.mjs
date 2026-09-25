// node p3/track.mjs: the live-trip tracker's states against a mocked trip (the
// config, the get_live_trip RPC and Mapbox GL are stubbed), so the page's logic
// runs without a real shared trip: missing token, active, arrived, a waiting
// Guardian link, the next drive, and SOS. A real end-to-end test still needs a
// trip shared from the app.
import { chromium } from 'playwright';
const b = await chromium.launch();
let fails = 0;
const check = (name, ok, detail = '') => { if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`); };
const STUB = `window.mapboxgl={accessToken:'',Map:function(o){window.__style=o.style;return{on:function(){},isStyleLoaded:function(){return true},getSource:function(){return null},addSource:function(){},addLayer:function(l){window.__route=l.paint['line-color'];},fitBounds:function(){},easeTo:function(){}}},Marker:function(o){(window.__markers=window.__markers||[]).push(o.color);return{setLngLat:function(){return this},addTo:function(){return this}}},LngLatBounds:function(){return{extend:function(){}}}};`;
const trip = (o) => [Object.assign({ lng: 28.05, lat: -26.1, dest_name: 'Melrose Arch', dest_lng: 28.07, dest_lat: -26.13, status: 'active', kind: 'drive', eta_epoch: Date.parse('2026-09-25T10:30:00Z'), route_geojson: { type: 'LineString', coordinates: [[28.05, -26.1], [28.07, -26.13]] } }, o)];
async function open(query, seq) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.clock.install({ time: new Date('2026-09-25T09:00:00Z') });
  await p.route('**/config.json', (r) => r.fulfill({ json: { supabaseUrl: 'https://mock.supabase', anonKey: 'anon', mapboxToken: 'pk.mock' } }));
  await p.route('https://api.mapbox.com/**', (r) => r.fulfill(r.request().url().endsWith('.js') ? { body: STUB, contentType: 'text/javascript' } : { body: '', contentType: 'text/css' }));
  let n = 0;
  await p.route('https://mock.supabase/**', (r) => r.fulfill({ json: seq[Math.min(n++, seq.length - 1)] }));
  await p.goto('http://localhost:8795/track.html' + query, { waitUntil: 'load' });
  await p.clock.runFor(500);
  return { ctx, p, errs, calls: () => n };
}
const status = (p) => p.evaluate(() => { const s = document.getElementById('trip-status'); return { t: s.textContent, st: s.getAttribute('data-state'), arr: getComputedStyle(document.getElementById('arrived')).display }; });
{
  const { ctx, p } = await open('', [[]]);
  const s = await status(p);
  check('no token: says the link is missing its trip code', /missing its trip code/.test(s.t), s.t);
  await ctx.close();
}
{
  const { ctx, p, errs, calls } = await open('?id=abc', [trip({}), trip({ status: 'arrived', arrived_at: '2026-09-25T10:28:00Z' }), [], trip({ dest_name: 'Rosebank' }), trip({ kind: 'sos' })]);
  let s = await status(p);
  const map = await p.evaluate(() => ({ style: window.__style, route: window.__route, markers: window.__markers }));
  check('active: on the way, with the destination and an ETA, live state', /^On the way to Melrose Arch · ETA ~\d{1,2}:\d{2}\.$/.test(s.t) && s.st === 'live', s.t);
  check('dark map, emerald route and driver, light destination pin', map.style === 'mapbox://styles/mapbox/dark-v11' && map.route === '#34D399' && map.markers[0] === '#34D399' && map.markers[1] === '#E6EDF5', JSON.stringify(map));
  await p.clock.runFor(10000);
  s = await status(p);
  check('arrived: the arrived panel shows, with the time', s.st === 'arrived' && s.arr === 'flex' && /Arrived at Melrose Arch\./.test(s.t) && /Arrived at \d/.test(await p.textContent('#arrived-sub')), `${s.t} | ${await p.textContent('#arrived-sub')}`);
  // waiting: polls slow down to every third tick (about 30 s)
  const before = calls();
  await p.clock.runFor(20000);
  const mid = calls();
  await p.clock.runFor(10000);
  s = await status(p);
  check('waiting: polls every ~30 s, not every 10 s', mid === before && calls() === before + 1, `${before} -> ${mid} -> ${calls()}`);
  check('a Guardian link with no drive keeps waiting', s.st === 'wait' && /picks up their next shared drive/.test(s.t), s.t);
  await p.clock.runFor(30000);
  s = await status(p);
  check('the next drive appears: the arrived panel clears', s.st === 'live' && s.arr === 'none' && /Rosebank/.test(s.t), `${s.t} | ${s.arr}`);
  await p.clock.runFor(10000);
  s = await status(p);
  check('SOS: the emergency line, sos state', s.st === 'sos' && /^Emergency\. Following their live location\.$/.test(s.t), s.t);
  check('no page errors', !errs.length, errs.join(' | '));
  const txt = await p.evaluate(() => document.body.innerText);
  check('no emoji in the page', !/[\u{1F300}-\u{1FAFF}✅⚠]/u.test(txt));
  await ctx.close();
}
await b.close();
console.log(fails ? `${fails} failure(s)` : 'every tracker check passes');
