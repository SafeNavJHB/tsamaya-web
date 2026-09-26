// try.js: "Try it" on How it works (src/pages/how-it-works.mjs), the toy router.
// Tap a start and a destination on the flat plan of the illustrative city. The
// straight line goes in grey. If it crosses a high-risk cell, a path search on
// the hex cells (a high-risk cell costs far more to cross than an ordinary one)
// finds the way round, drawn in emerald, with a readout of what it avoided and
// roughly what it costs. As in the app, a detour past the limit is thrown out:
// the straight line stays, with its high-risk cells marked.
//
// A toy, and labelled so on the panel: the cells are the illustrative city's,
// not real ratings, and the app routes on real roads. Every count in the readout
// is measured on the line actually drawn.
import { genCells, CITY } from './scene/citygen.js';

const svg = document.querySelector('.try-svg');
if (svg) {
  const NS = 'http://www.w3.org/2000/svg';
  const marks = svg.querySelector('.try-marks');
  const use = document.getElementById('try-cells');
  const out = document.querySelector('.try-out');
  const bandBtns = [...document.querySelectorAll('.try-b')];
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TS = window.Tsamaya;

  // the city's cells, as the scene and the poster draw them (seed 11, radius 2.65)
  const R = 2.65, S = CITY.S;
  const cells = genCells(R, 11).map(([x, z, , L]) => ({ x, z, L }));
  // neighbours: the six cells about one spacing away
  const W = Math.sqrt(3) * R;
  const key = (x, z) => `${Math.floor(x / 6)},${Math.floor(z / 6)}`;
  const grid = new Map();
  cells.forEach((c, i) => { const k = key(c.x, c.z); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(i); });
  const nearIdx = (x, z, rad) => {
    const res = [], gx = Math.floor(x / 6), gz = Math.floor(z / 6), r2 = rad * rad;
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) (grid.get(`${gx + a},${gz + b}`) || []).forEach((i) => { const c = cells[i]; if ((c.x - x) ** 2 + (c.z - z) ** 2 < r2) res.push(i); });
    return res;
  };
  cells.forEach((c, i) => { c.n = nearIdx(c.x, c.z, W * 1.05).filter((j) => j !== i); });
  // the cell a point is in: the nearest centre
  const cellAt = (x, z) => {
    let best = -1, bd = Infinity;
    nearIdx(x, z, R * 1.2).forEach((i) => { const d = (cells[i].x - x) ** 2 + (cells[i].z - z) ** 2; if (d < bd) { bd = d; best = i; } });
    return best;
  };
  // the cells a polyline passes through, sampled every 0.35 units
  const crossed = (pts) => {
    const seen = new Set();
    for (let k = 0; k < pts.length - 1; k++) {
      const [ax, az] = pts[k], [bx, bz] = pts[k + 1], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.35));
      for (let s = 0; s <= n; s++) { const i = cellAt(ax + (bx - ax) * s / n, az + (bz - az) * s / n); if (i >= 0) seen.add(i); }
    }
    return [...seen];
  };
  const len = (pts) => pts.reduce((t, p, i) => (i ? t + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);

  // what crossing a cell costs, per unit of distance, by its level (none,
  // yellow, amber, red): red far more than anything else, yellow barely (the app
  // never detours for yellow)
  const COST = [1, 1.25, 3.5, 31];
  let band = TS ? Math.max(0, TS.bands.indexOf(TS.bandAt(TS.saMinutes()))) : 2;
  const lv = (i) => cells[i].L[band];

  function search(a, b) {
    // A* over the cells from a's cell to b's cell
    const s = cellAt(...a), t = cellAt(...b);
    const g = new Map([[s, 0]]), from = new Map(), open = new Set([s]);
    const h = (i) => Math.hypot(cells[i].x - cells[t].x, cells[i].z - cells[t].z);
    const f = new Map([[s, h(s)]]);
    while (open.size) {
      let u = -1, fu = Infinity;
      open.forEach((i) => { if (f.get(i) < fu) { fu = f.get(i); u = i; } });
      if (u === t) break;
      open.delete(u);
      for (const v of cells[u].n) {
        const d = Math.hypot(cells[v].x - cells[u].x, cells[v].z - cells[u].z) * COST[lv(v)];
        const gv = g.get(u) + d;
        if (gv < (g.has(v) ? g.get(v) : Infinity)) { g.set(v, gv); from.set(v, u); f.set(v, gv + h(v)); open.add(v); }
      }
    }
    const path = [t];
    while (path[0] !== s && from.has(path[0])) path.unshift(from.get(path[0]));
    // the tap points at the ends, the cell centres between
    const pts = [a, ...path.slice(1, -1).map((i) => [cells[i].x, cells[i].z]), b];
    // pull the line straight wherever that crosses nothing worse than the path
    // it replaces did there
    const worst = (i, j) => { let m = 0; for (let k = i; k <= j; k++) m = Math.max(m, lv(cellAt(...pts[k]))); return m; };
    const pulled = [pts[0]];
    let i = 0;
    while (i < pts.length - 1) {
      let j = pts.length - 1;
      for (; j > i + 1; j--) { const cap = worst(i, j); if (crossed([pts[i], pts[j]]).every((c) => lv(c) <= cap)) break; }
      pulled.push(pts[j]); i = j;
    }
    return pulled;
  }

  // drawing
  const el = (name, attrs) => { const e = document.createElementNS(NS, name); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  const pathOf = (pts) => 'M' + pts.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join('L');
  const hexPts = (c) => [0, 1, 2, 3, 4, 5].map((k) => `${(c.x + R * 0.88 * Math.sin(k * Math.PI / 3)).toFixed(2)},${(c.z + R * 0.88 * Math.cos(k * Math.PI / 3)).toFixed(2)}`).join(' ');
  const drawIn = (e, delay) => {
    if (reduce) return;
    const L = e.getTotalLength();
    e.style.strokeDasharray = `${L} ${L}`; e.style.strokeDashoffset = L;
    e.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: Math.min(1100, 300 + L * 8), delay, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' });
  };
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  let A = null, B = null;

  function render() {
    marks.textContent = '';
    if (A) marks.appendChild(el('circle', { class: 'try-a', cx: A[0], cy: A[1], r: 1.6 }));
    if (!A || !B) return;
    marks.appendChild(el('circle', { class: 'try-z', cx: B[0], cy: B[1], r: 1.6 }));
    const straight = [A, B];
    const sCells = crossed(straight), sHigh = sCells.filter((c) => lv(c) === 3);
    const grey = marks.insertBefore(el('path', { class: 'try-s', d: pathOf(straight) }), marks.firstChild);
    if (!reduce) grey.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
    let msg;
    if (!sHigh.length) {
      msg = 'The straight line crosses no high-risk cell, so it stays: no detour.';
    } else {
      const bend = search(A, B), bCells = crossed(bend);
      const bHigh = bCells.filter((c) => lv(c) === 3).length, bMed = bCells.filter((c) => lv(c) === 2).length;
      const extra = len(bend) - len(straight);
      // the detour limit, as in the app: at most about 1.6 times the direct line plus a little
      if (len(bend) > len(straight) * 1.6 + 12 || bHigh >= sHigh.length) {
        sHigh.forEach((c) => marks.insertBefore(el('polygon', { class: 'try-hot', points: hexPts(cells[c]) }), grey));
        msg = `Every way round is too long, so the straight line stays, and its ${plural(sHigh.length, 'high-risk cell is', 'high-risk cells are')} marked.`;
      } else {
        const low = marks.insertBefore(el('path', { class: 'try-l', d: pathOf(bend) }), marks.querySelector('.try-a'));
        drawIn(low, reduce ? 0 : 450);
        grey.classList.add('dim');
        // a unit is about 100 m and the toy drives at about 36 km/h: 10 s a unit
        const min = Math.round(extra / 6);
        const cost = min >= 1 ? `about +${min} min` : 'under a minute longer';
        msg = `${plural(sHigh.length - bHigh, 'high-risk cell', 'high-risk cells')} avoided, ${cost}` +
          (bHigh ? `; ${plural(bHigh, 'high-risk cell', 'high-risk cells')} could not be avoided` : '') +
          (bMed ? `. It still passes ${plural(bMed, 'medium-risk cell', 'medium-risk cells')}.` : '.');
      }
    }
    out.textContent = msg;
  }

  // taps: the first sets the start, the second the destination, a third starts over
  const toCity = (e) => {
    const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    const q = p.matrixTransform(svg.getScreenCTM().inverse());
    const m = S - 2;
    return [Math.max(-m, Math.min(m, q.x)), Math.max(-m, Math.min(m, q.y))];
  };
  svg.addEventListener('click', (e) => {
    const pt = toCity(e);
    if (!A || B) { A = pt; B = null; out.textContent = 'Now tap a destination.'; } else B = pt;
    render();
  });
  document.querySelectorAll('.try-trip').forEach((btn) => btn.addEventListener('click', () => {
    A = btn.dataset.a.split(',').map(Number); B = btn.dataset.b.split(',').map(Number);
    render();
  }));
  const setBand = (b) => {
    band = b;
    if (use) use.setAttribute('href', '#pl-c' + b);
    bandBtns.forEach((x) => x.setAttribute('aria-pressed', String(+x.dataset.b === b)));
    if (A && B) render();
  };
  bandBtns.forEach((x) => x.addEventListener('click', () => setBand(+x.dataset.b)));
  setBand(band);
  // a hook for the tests
  window.__try = { cells, get band() { return band; }, lv: (i) => lv(i), crossed, cellAt, len, get A() { return A; }, get B() { return B; } };
}
