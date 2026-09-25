// poster.mjs: the home page's drawings, made at build time.
//
// The illustrative city is drawn from the same generator the 3D scene uses
// (public/js/scene/citygen.js, same seeds), so the static poster, the chapter
// figures and the live scene all show one city. The poster is what paints first,
// what the static tier keeps (reduced motion, no WebGL, a lost context) and what
// a reader without JavaScript sees.
//
//   posterDefs()       a hidden <svg class="defs"> holding the shared pieces:
//                        pl-base   streets, long roads and building footprints
//                        pl-c0..2  the risk cells in daytime, evening and night
//                        pl-fast   the fastest route (dashed)
//                        pl-low    the lower-risk route (emerald)
//                      plus the dot patterns. Every figure <use>s these, so the
//                      city is in the HTML once however often it is drawn.
//   planSvg(band, o)   one view of the city: <svg><use href="#pl-..."/></svg>
//   saSvg()            South Africa for chapter 3: land, provincial borders and
//                      a dot per metro sized by its rated areas (coverage, never
//                      risk), labelled for the six largest. Figures from stats.
//   tagAnchors()       where the two hero route tags sit on the poster, for the
//                      static tier (the live scene projects its own).
//
// Coordinates are rounded to 0.1, and paths are written with relative commands
// to keep the HTML small.
import { CITY, crSample, genCity, genCells } from '../public/js/scene/citygen.js';
import { geoData, siteData } from './sitedata.mjs';
import { fmt } from '../site.config.mjs';

/* ---------------------------------------------------------------------------
 * Compact path writer. Points are rounded to tenths first (as integers), so the
 * relative steps add up exactly and the drawing cannot drift.
 * ------------------------------------------------------------------------ */
const tenth = (v) => Math.round(v * 10);
function num(t) {
  const a = Math.abs(t);
  const s = (a % 10 ? (a / 10).toFixed(1) : String(a / 10)).replace(/^0\./, '.');
  return (t < 0 ? '-' : '') + s;
}
const sep = (s) => (s[0] === '-' ? s : ' ' + s);

// subpaths: arrays of [x, y] points. closed: end each subpath with z.
function pathD(subpaths, closed) {
  let d = '';
  let cx = 0;
  let cy = 0;
  subpaths.forEach((pts, n) => {
    const q = pts.map(([x, y]) => [tenth(x), tenth(y)]);
    if (closed && q.length > 2 && q[0][0] === q[q.length - 1][0] && q[0][1] === q[q.length - 1][1]) q.pop();
    const [sx, sy] = q[0];
    d += n ? 'm' + num(sx - cx) + sep(num(sy - cy)) : 'M' + num(sx) + sep(num(sy));
    let px = sx;
    let py = sy;
    let last = '';
    for (let k = 1; k < q.length; k++) {
      const dx = q[k][0] - px;
      const dy = q[k][1] - py;
      if (!dx && !dy) continue;
      if (!dy) { d += 'h' + num(dx); last = 'h'; } else if (!dx) { d += 'v' + num(dy); last = 'v'; } else { d += (last === 'l' ? sep(num(dx)) : 'l' + num(dx)) + sep(num(dy)); last = 'l'; }
      px = q[k][0];
      py = q[k][1];
    }
    if (closed) { d += 'z'; cx = sx; cy = sy; } else { cx = px; cy = py; }
  });
  return d;
}

/* ---------------------------------------------------------------------------
 * The city (seeds as in the scene: city 7, cells 11, hex radius 2.65).
 * ------------------------------------------------------------------------ */
const city = genCity(7);
const cells = genCells(2.65, 11);
const HEX_R = 2.65 * 0.88; // the scene draws each cell at 88% of its spacing
const hexCorners = [0, 1, 2, 3, 4, 5].map((k) => [HEX_R * Math.sin((k * Math.PI) / 3), HEX_R * Math.cos((k * Math.PI) / 3)]);
const hex = (x, z) => hexCorners.map(([hx, hz]) => [x + hx, z + hz]);
const thin = (pts, step) => pts.filter((_, i) => i % step === 0 || i === pts.length - 1);

// Risk colours are status colours: yellow, amber, red for levels 1 to 3.
const CELL = [null, ['#EBC846', '.32'], ['#F59E0B', '.42'], ['#EF4444', '.55']];

function cellGroup(band) {
  let out = `<g id="pl-c${band}">`;
  for (let level = 1; level <= 3; level++) {
    const shapes = cells.filter((c) => c[3][band] === level).map((c) => hex(c[0], c[1]));
    if (!shapes.length) continue;
    const [col, op] = CELL[level];
    out += `<path d="${pathD(shapes, true)}" fill="${col}" fill-opacity="${op}" stroke="${col}" stroke-opacity=".7" stroke-width=".25"/>`;
  }
  return out + '</g>';
}

const streets = pathD(city.segs.map((s) => [[s[0], s[1]], [s[2], s[3]]]), false);
const arterials = pathD(city.polys.filter((p) => p.cls !== 3).map((p) => thin(p.pts, 2)), false);
const boxes = pathD(city.boxes.map(([x0, z0, x1, z1]) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]), true);
const fastD = pathD([crSample(CITY.FAST, 60)], false);
const lowD = pathD([crSample(CITY.LOW, 90)], false);

export function posterDefs() {
  return `<svg class="defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>` +
    `<pattern id="pdots" width="1.2" height="1.2" patternUnits="userSpaceOnUse"><rect width=".5" height=".5" fill="#C9D6E3" fill-opacity=".55"/></pattern>` +
    `<pattern id="sadots" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#C9D6E3" fill-opacity=".45"/></pattern>` +
    `<g id="pl-base"><path d="${streets}" fill="none" stroke="#414758" stroke-width=".28"/><path d="${arterials}" fill="none" stroke="#5D667A" stroke-width=".5"/><path d="${boxes}" fill="url(#pdots)"/></g>` +
    cellGroup(0) + cellGroup(1) + cellGroup(2) +
    `<path id="pl-fast" d="${fastD}" fill="none" stroke="#E6EDF5" stroke-opacity=".7" stroke-width=".55" stroke-dasharray="1.6 1.1"/>` +
    `<g id="pl-low"><path d="${lowD}" fill="none" stroke="#34D399" stroke-opacity=".22" stroke-width="3.2" stroke-linecap="round"/><path d="${lowD}" fill="none" stroke="#34D399" stroke-width="1.1" stroke-linecap="round"/></g>` +
    `</defs></svg>`;
}

// One view of the city. band: which cells (0 day, 1 evening, 2 night).
//   routes  draw both routes on top
//   cellsId an id for the cells <use>, so a script can swap the band
//   attrs   extra attributes for the <svg> (role, viewBox, aria)
//   extra   more SVG inside, after the routes (labels)
export function planSvg(band, { routes = false, cellsId = '', attrs = 'viewBox="-56 -56 112 112" aria-hidden="true"', extra = '' } = {}) {
  const id = cellsId ? ` id="${cellsId}"` : '';
  return `<svg ${attrs} focusable="false"><use href="#pl-base"/><use${id} href="#pl-c${band}"/>${routes ? '<use href="#pl-fast"/><use href="#pl-low"/>' : ''}${extra}</svg>`;
}

// A point part-way along a route, by distance: the scene's CatmullRomCurve3
// getPointAt() on the same control points, so the static tags sit where the
// live ones do.
function along(ctrl, frac) {
  const pts = crSample(ctrl, 400);
  const seg = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); total += l; }
  let want = total * frac;
  for (let i = 0; i < seg.length; i++) {
    if (want <= seg[i]) { const t = want / seg[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]; }
    want -= seg[i];
  }
  return pts[pts.length - 1];
}

// The hero's route tags on the poster, as percentages of the square poster
// plane: the fastest route's tag at 64% of its length, the lower-risk one at 36%
// (the same points the scene's anchors use).
export function tagAnchors() {
  const pct = ([x, z]) => ({ left: (((x + CITY.S) / (2 * CITY.S)) * 100).toFixed(2), top: (((z + CITY.S) / (2 * CITY.S)) * 100).toFixed(2) });
  return { hf: pct(along(CITY.FAST, 0.64)), hl: pct(along(CITY.LOW, 0.36)) };
}

/* ---------------------------------------------------------------------------
 * South Africa, chapter 3. Pillar height and dot size are rated areas: how much
 * of a metro is covered, never how risky it is.
 * ------------------------------------------------------------------------ */
// Where each labelled metro's text sits beside its dot: [dx, dy, anchor].
const SA_LABEL = {
  cape_town: [14, 26, 'start'],
  johannesburg: [-16, 4, 'end'],
  durban: [16, 5, 'start'],
  ekurhuleni: [16, 6, 'start'],
  pretoria: [12, -12, 'start'],
  gqeberha: [14, 26, 'start'],
};

// The metros sorted by rated areas, largest first, with their map points.
export function metrosBySize() {
  const pts = Object.fromEntries(geoData().metros.map((m) => [m.key, m.point]));
  return siteData().metros
    .map((m) => ({ ...m, point: pts[m.key] }))
    .sort((a, b) => b.zones - a.zones);
}

export function saSvg({ title }) {
  const geo = geoData();
  const metros = metrosBySize();
  const dots = metros
    .map((m) => `<circle cx="${m.point[0]}" cy="${m.point[1]}" r="${(3 + Math.sqrt(m.zones) * 0.32).toFixed(1)}" data-k="${m.key}" data-z="${m.zones}"/>`)
    .join('');
  const labels = metros.slice(0, 6).map((m) => {
    const [dx, dy, anchor] = SA_LABEL[m.key] || [14, 5, 'start'];
    return `<text x="${(m.point[0] + dx).toFixed(1)}" y="${(m.point[1] + dy).toFixed(1)}" text-anchor="${anchor}">${m.name.toUpperCase()} ${fmt(m.zones)}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${geo.width} ${Math.ceil(geo.height)}" role="img" aria-labelledby="f3t" focusable="false"><title id="f3t">${title}</title>` +
    `<path class="land" id="sa-land" fill-rule="evenodd" d="${pathD(geo.land, true)}"/>` +
    `<path class="brd" id="sa-borders" d="${pathD(geo.borders, false)}"/>` +
    `<g id="sa-dots" fill="#E6EDF5" fill-opacity=".9">${dots}</g><g class="sa-lbl">${labels}</g></svg>`;
}
