// citygen.js: the illustrative city, as numbers. Street grid, buildings, the two
// routes and the hex risk cells for each time band.
//
// Pure: no DOM, no Three.js. The build (src/poster.mjs, in Node) draws the
// static SVG poster from it, and the browser (city.js) builds the 3D scene from
// it, so the poster and the scene show the same city. Both call it with the same
// seeds (city 7, cells 11) and get the same output byte for byte.
//
// Nothing here is a real place. The city is procedural and is labelled
// "Illustrative city" wherever it appears; the risk cells are placed around the
// two routes to tell the story of the route card, not taken from any data.

// SAME OUTPUT EVERYWHERE. Only exactly rounded arithmetic decides the output
// (+, -, *, /, Math.sqrt and the integer maths of mulberry32; squares use
// sq(), not the power operator, which goes through Math.pow). Math.sin and
// Math.cos are not exactly rounded, and Node 22 and Chrome 141 already differ in
// the last bit for some angles, so the one place that uses them (the ring road)
// rounds its points to 1e-6. Math.exp only feeds values that are rounded or
// compared against wide thresholds. Check: scratchpad p1/citygen-parity.mjs.
const r6 = (v) => Math.round(v * 1e6) / 1e6;
const sq = (v) => v * v;

// A small, fast seeded random generator (mulberry32).
export function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// n + 1 points along a uniform Catmull-Rom spline through pts (ends extrapolated).
export function crSample(pts, n) {
  const out = [], m = pts.length - 1;
  for (let i = 0; i <= n; i++) {
    const t = i / n * m, k = Math.min(Math.floor(t), m - 1), u = t - k;
    const p1 = pts[k], p2 = pts[k + 1];
    const p0 = k > 0 ? pts[k - 1] : [2 * p1[0] - p2[0], 2 * p1[1] - p2[1]];
    const p3 = k + 2 <= m ? pts[k + 2] : [2 * p2[0] - p1[0], 2 * p2[1] - p1[1]];
    const f = (a, b, c, d) => { const t0 = 0.5 * (c - a), t1 = 0.5 * (d - b), u2 = u * u, u3 = u2 * u; return (2 * b - 2 * c + t0 + t1) * u3 + (-3 * b + 3 * c - 2 * t0 - t1) * u2 + t0 * u + b; };
    out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
  }
  return out;
}

// The city is a square from -S to S (x east, z south). A is the start, B the end.
export const CITY = {
  S: 56,
  A: [-40, 40], B: [40, -40],
  FAST: [[-40, 40], [-29, 29.6], [-18, 18.4], [-6.5, 6.8], [4.5, -3.6], [16, -15], [28, -27.4], [40, -40]],
  LOW: [[-40, 40], [-33, 36.8], [-22, 34.6], [-11, 30.2], [-3.2, 20], [0.4, 6.5], [2.2, -8], [4.4, -21.5], [11.5, -32.4], [25, -38.2], [40, -40]],
  // clusters: x, z, strength per band [day, evening, night], sigma per band
  CL: [
    [-18, 18.4, [1.25, 1.3, 1.42], [4.6, 4.8, 5.2]],
    [16, -15, [1.2, 1.26, 1.4], [4.4, 4.7, 5.1]],
    [31, 24, [0.55, 0.68, 1.02], [4.4, 4.6, 5.0]],
    [-32, -22, [0.34, 0.6, 0.8], [4.8, 5.0, 5.4]],
    [-8, -44, [0, 0.3, 0.66], [4, 4.4, 4.8]],
    [44, -4, [0, 0.2, 0.62], [4, 4, 4.6]]
  ],
  // a single cell beside the lower-risk route: x, z, height, level. It is the
  // one medium-risk area the route card's lower-risk route passes (for 0.1 km);
  // the route touches no high cell in any band (scratchpad check lowpath-check.mjs)
  LONE: [[11.6, -28.6, 2.1, 2]]
};

// Streets, long roads and buildings: { segs, polys, boxes, xs, zs }.
export function genCity(seed) {
  const R = mulberry32(seed), S = CITY.S;
  const segs = [];            // street segments [x1, z1, x2, z2, class]
  const polys = [];           // long roads as polylines { pts, cls }
  // jittered grid of nodes
  const xs = [], zs = [];
  for (let x = -S; x <= S + 0.1;) { xs.push(x); x += 8.5 + R() * 4.5; }
  xs[xs.length - 1] = S;
  for (let z = -S; z <= S + 0.1;) { zs.push(z); z += 8 + R() * 5; }
  zs[zs.length - 1] = S;
  const node = [];
  for (let i = 0; i < xs.length; i++) {
    node[i] = [];
    for (let j = 0; j < zs.length; j++) {
      const edgeX = i === 0 || i === xs.length - 1, edgeZ = j === 0 || j === zs.length - 1;
      node[i][j] = [xs[i] + (edgeX ? 0 : (R() - 0.5) * 1.8), zs[j] + (edgeZ ? 0 : (R() - 0.5) * 1.8)];
    }
  }
  for (let i = 0; i < xs.length; i++) for (let j = 0; j < zs.length; j++) {
    const a = node[i][j];
    if (j + 1 < zs.length && (i > 0 && i < xs.length - 1) && R() > 0.1) { const b = node[i][j + 1]; segs.push([a[0], a[1], b[0], b[1], 0]); }
    if (i + 1 < xs.length && (j > 0 && j < zs.length - 1) && R() > 0.1) { const b = node[i + 1][j]; segs.push([a[0], a[1], b[0], b[1], 0]); }
  }
  // arterials: the fastest line runs corner to corner; a second crosses east-west
  polys.push({ pts: crSample([[-S, S], ...CITY.FAST, [S, -S]], 90), cls: 1 });
  polys.push({ pts: crSample([[-S, -6], [-30, -2], [-8, 3.5], [14, 8], [34, 12], [S, 20]], 70), cls: 1 });
  // ring road
  const ring = [];
  for (let k = 0; k <= 120; k++) { const t = k / 120 * Math.PI * 2; const rr = 31 + Math.sin(t * 3 + 1) * 1.6; ring.push([r6(2 + Math.cos(t) * rr * 1.08), r6(-1 + Math.sin(t) * rr)]); }
  polys.push({ pts: ring, cls: 2 });
  // the lower-risk route rides roads we have checked
  polys.push({ pts: crSample(CITY.LOW, 110), cls: 3 });

  // is a point within rad of any long road?
  function nearRoad(x, z, rad) {
    for (const p of polys) {
      const P = p.pts;
      for (let k = 0; k < P.length - 1; k++) {
        const ax = P[k][0], az = P[k][1], bx = P[k + 1][0], bz = P[k + 1][1];
        const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz;
        let t = L ? ((x - ax) * dx + (z - az) * dz) / L : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
        const ex = ax + dx * t - x, ez = az + dz * t - z;
        if (ex * ex + ez * ez < rad * rad) return true;
      }
    }
    return false;
  }
  // buildings: lots inside each block, heights from a density field
  const boxes = [];
  const towers = [[9, 5, 15], [-27, -18, 7], [26, -8, 6]];
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < zs.length - 1; j++) {
    const n00 = node[i][j], n11 = node[i + 1][j + 1], n10 = node[i + 1][j], n01 = node[i][j + 1];
    const x0 = Math.max(n00[0], n01[0]) + 1.3, x1 = Math.min(n10[0], n11[0]) - 1.3;
    const z0 = Math.max(n00[1], n10[1]) + 1.3, z1 = Math.min(n01[1], n11[1]) - 1.3;
    if (x1 - x0 < 2 || z1 - z0 < 2) continue;
    if (R() < 0.07) continue; // parks and open ground
    const nx = Math.max(1, Math.round((x1 - x0) / (3 + R() * 2.6))), nz = Math.max(1, Math.round((z1 - z0) / (3 + R() * 2.6)));
    const lw = (x1 - x0) / nx, ld = (z1 - z0) / nz;
    for (let a = 0; a < nx; a++) for (let b = 0; b < nz; b++) {
      if (R() < 0.12) continue;
      const inset = 0.25 + R() * 0.5;
      const bx0 = x0 + a * lw + inset, bx1 = x0 + (a + 1) * lw - inset;
      const bz0 = z0 + b * ld + inset, bz1 = z0 + (b + 1) * ld - inset;
      if (bx1 - bx0 < 0.8 || bz1 - bz0 < 0.8) continue;
      const cx = (bx0 + bx1) / 2, cz = (bz0 + bz1) / 2;
      const half = Math.sqrt(sq(bx1 - bx0) + sq(bz1 - bz0)) / 2;
      if (nearRoad(cx, cz, half + 1.1)) continue;
      let h = 0.9 + R() * 2.6;
      for (const t of towers) { const d2 = sq(cx - t[0]) + sq(cz - t[1]); h += t[2] * Math.exp(-d2 / 120) * (0.35 + R() * 0.9); }
      boxes.push([bx0, bz0, bx1, bz1, Math.round(h * 10) / 10]);
    }
  }
  return { segs, polys, boxes, xs, zs };
}

// Hex cells over the city, radius r. Each cell is [x, z, heights, levels], with
// one height and one level per band [day, evening, night]; a level runs 0 to 3
// (none, yellow, amber, red).
export function genCells(r, seed) {
  const R = mulberry32(seed), S = CITY.S, W = Math.sqrt(3) * r, cells = [];
  const rows = Math.floor(2 * S / (1.5 * r)) + 1, cols = Math.floor(2 * S / W) + 1;
  const sprinkle = [];
  for (let k = 0; k < 16; k++) sprinkle.push([(R() - 0.5) * 2 * S * 0.92, (R() - 0.5) * 2 * S * 0.92, R()]);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = -S + i * W + (j % 2 ? W / 2 : 0) + (S * 2 - (cols - 1) * W - W / 2) / 2, z = -S + j * 1.5 * r + (S * 2 - (rows - 1) * 1.5 * r) / 2;
    const L = [0, 0, 0], H = [0, 0, 0], jit = R();
    for (let b = 0; b < 3; b++) {
      let f = 0;
      for (const c of CITY.CL) { const d2 = sq(x - c[0]) + sq(z - c[1]); f = Math.max(f, c[2][b] * Math.exp(-d2 / (2 * c[3][b] * c[3][b]))); }
      f += (jit - 0.5) * 0.08;
      let lv = f > 0.72 ? 3 : f > 0.42 ? 2 : f > 0.2 ? 1 : 0;
      for (const s of sprinkle) if (sq(x - s[0]) + sq(z - s[1]) < r * r * 0.8) { const sl = b === 0 ? 1 : b === 1 ? (s[2] > 0.5 ? 1 : 0) : (s[2] > 0.7 ? 2 : 0); lv = Math.max(lv, sl); }
      for (const q of CITY.LONE) if (sq(x - q[0]) + sq(z - q[1]) < r * r * 0.8) { lv = q[3]; H[b] = q[2] * (b === 2 ? 1.3 : 1); }
      L[b] = lv;
      if (!H[b]) H[b] = lv === 3 ? Math.min(11, 3.4 + (f - 0.72) * 9 + jit * 1.2) * (b === 2 ? 1.15 : 1) : lv === 2 ? 1.7 + (f - 0.42) * 4 + jit * 0.5 : lv === 1 ? 0.6 + jit * 0.35 : 0;
      H[b] = Math.round(H[b] * 100) / 100;
    }
    cells.push([Math.round(x * 100) / 100, Math.round(z * 100) / 100, H, L]);
  }
  // active cells first, so a lower tier can drop the faint tessellation by count alone
  cells.sort((a, b) => (b[3][0] + b[3][1] + b[3][2] > 0) - (a[3][0] + a[3][1] + a[3][2] > 0));
  return cells;
}
