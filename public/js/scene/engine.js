// engine.js: the one WebGL canvas a page gets, and everything that keeps it
// cheap. Scene code (city, chapters, the explore map) builds on top of this and
// never creates a renderer of its own.
//
// Import it dynamically, and only after detectTier() (tier.js) has said the
// visitor gets a scene:
//
//   const { detectTier } = await import('./scene/tier.js');
//   const tier = detectTier();
//   if (tier !== 'static') {
//     const { createEngine } = await import('./scene/engine.js');
//     const engine = createEngine({ canvas, stage, tier, onFrame });
//   }
//
// WHAT IT HANDLES
//  - Pixel ratio capped per tier (tier.js).
//  - Size follows the canvas's box (ResizeObserver), never the window.
//  - The loop stops when the canvas is off screen, when the tab is hidden, and
//    when the visitor presses "Pause motion" (the 'tsamaya:motion' event from
//    site.js). While paused, invalidate() still draws one frame, so the
//    visitor's own interactions keep working.
//  - Adaptive quality: if the first 60 frames average over 20 ms, the pixel
//    ratio drops and onDegrade() tells the scene to halve its points.
//  - A lost WebGL context hands the page back to its poster.
//  - The canvas fades in over the poster only once a real frame is drawn
//    (stage gets .is-live).
import * as THREE from '../../vendor/three.scene.min.js';
import { pixelRatioFor } from './tier.js';

export { THREE };

export function createEngine({ canvas, stage = canvas.parentElement, tier = 'full', fov = 40, onFrame, onResize, onDegrade, onLost } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: tier === 'full', alpha: true, powerPreference: 'high-performance' });
  let ratio = pixelRatioFor(tier);
  renderer.setPixelRatio(ratio);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 5000);

  let width = 0;
  let height = 0;
  let running = false;
  let visible = true;
  let paused = document.documentElement.classList.contains('motion-paused');
  let dirty = true;
  let lost = false;
  let rafId = 0;
  let last = 0;
  let live = false;
  const perf = { frames: 0, total: 0, checked: false, degraded: false };

  function resize() {
    const box = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(box.width));
    const h = Math.max(1, Math.round(box.height));
    if (w === width && h === height) return;
    width = w;
    height = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (onResize) onResize({ width: w, height: h });
    // Resizing a canvas clears it. Draw again now, before the browser paints
    // (a ResizeObserver runs after layout and before paint), or the page shows
    // the bare background for a frame; the next frame then catches up as usual.
    if (live && !lost) renderer.render(scene, camera);
    dirty = true;
    kick();
  }

  // Adaptive quality: judge the first 60 frames once.
  function measure(dt) {
    if (perf.checked || dt <= 0 || dt > 250) return;
    perf.frames += 1;
    perf.total += dt;
    if (perf.frames < 60) return;
    perf.checked = true;
    if (perf.total / perf.frames > 20 && !perf.degraded) {
      perf.degraded = true;
      ratio = Math.max(1, ratio * 0.75);
      renderer.setPixelRatio(ratio);
      width = 0; // force the size to be re-applied at the new ratio
      resize();
      if (onDegrade) onDegrade();
    }
  }

  function frame(now) {
    rafId = 0;
    if (lost) return;
    const dt = last ? now - last : 16;
    last = now;
    const animate = running && visible && !paused && !document.hidden;
    // onFrame returns true while something is still moving (a camera flight,
    // an easing value); the loop then keeps going even when "idle".
    const busy = onFrame ? onFrame({ now, dt, animate, THREE, scene, camera, renderer }) === true : false;
    if (animate || busy || dirty) {
      renderer.render(scene, camera);
      dirty = false;
      if (!live) {
        live = true;
        stage.classList.add('is-live');
      }
      if (animate) measure(dt);
    }
    if ((animate || busy) && !lost) rafId = requestAnimationFrame(frame);
    else last = 0;
  }

  function kick() {
    if (!rafId && !lost) rafId = requestAnimationFrame(frame);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) kick();
  }, { rootMargin: '120px 0px' });
  io.observe(stage);
  const onVisibility = () => { if (!document.hidden) kick(); };
  document.addEventListener('visibilitychange', onVisibility);
  const onMotion = (e) => { paused = !!(e.detail && e.detail.paused); kick(); };
  document.addEventListener('tsamaya:motion', onMotion);
  // light and dark (site.js fires 'ts-theme'): the scene recolours, then redraws
  const themeFns = [];
  const onTheme = () => { themeFns.forEach((f) => f()); dirty = true; kick(); };
  window.addEventListener('ts-theme', onTheme);

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    lost = true;
    stage.classList.remove('is-live');
    stage.classList.add('is-lost');
    if (onLost) onLost();
  });

  resize();

  return {
    THREE,
    renderer,
    scene,
    camera,
    tier,
    get size() { return { width, height }; },
    get degraded() { return perf.degraded; },
    start() { running = true; kick(); },
    stop() { running = false; },
    // Draw at least one more frame (after a change made while paused or idle).
    invalidate() { dirty = true; kick(); },
    // fn() runs on every theme change, before the redraw
    onTheme(fn) { themeFns.push(fn); },
    dispose() {
      window.removeEventListener('ts-theme', onTheme);
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('tsamaya:motion', onMotion);
      renderer.dispose();
    },
  };
}
