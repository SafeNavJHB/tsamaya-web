// tier.js: decides how much of the 3D scene a visitor gets, BEFORE anything
// heavy loads. Deliberately tiny and dependency-free, so a budget phone or a
// data-saver visitor never downloads the 3D library at all.
//
//   'full'    about 70 000 points, about 700 cells, idle drift
//   'light'   about 20 000 points, about 300 cells, lower resolution, no drift
//   'static'  no WebGL: the page keeps its SVG poster
//
// Rules (BUILD_PLAN.md section 3.3):
//   static  reduced motion, no WebGL, or the visitor has paused motion
//   light   data saver, fewer than 4 CPU cores, or less than 4 GB of memory.
//           A browser that does not report cores or memory is treated as
//           unknown, not as weak.
//   full    everything else
// WebGL 2 only: the vendored Three.js (r186) has no WebGL 1 renderer, so a
// WebGL 1 browser would load it only to fail and fall back every visit.
export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('webgl2');
  } catch {
    return false;
  }
}

export function detectTier() {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !webglAvailable()) return 'static';
  const conn = navigator.connection || {};
  const cores = navigator.hardwareConcurrency;
  const memory = navigator.deviceMemory;
  if (conn.saveData === true || (cores && cores < 4) || (memory && memory < 4)) return 'light';
  return 'full';
}

// A window under 500 px tall and wider than it is tall (a phone on its side):
// the home page's pinned chapters cannot fit it, so the home page tells its
// story as the still version there (home.js). Not a tier of its own, and never
// stored: turned upright on the next visit, the phone gets its usual tier.
export const tooShortToPin = () => window.innerHeight < 500 && window.innerWidth > window.innerHeight;

// Phones get a lower pixel-ratio ceiling: a 3x screen renders nine times the
// pixels of a 1x one, and fill rate is what budget GPUs run out of first.
export function pixelRatioFor(tier) {
  const dpr = window.devicePixelRatio || 1;
  const phone = window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
  const cap = tier === 'light' ? 1.25 : phone ? 1.5 : 2;
  return Math.min(dpr, cap);
}
