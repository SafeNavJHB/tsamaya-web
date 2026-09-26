// theme.js: whether the 3D scenes draw for a light page or a dark one.
//
// The page's theme is html[data-theme] (set before first paint in layout.mjs,
// switched by the header button in site.js, which then fires 'ts-theme'). The
// scenes follow it unless html[data-scenes="dark"] keeps them as night panels in
// a light page (the other way to do light mode; see the scenes switch in
// layout.mjs).
//
// Every scene shader reads one shared uniform, uLight (0 dark, 1 light). The
// glows add light in the dark (additive blending), which washes out to white on
// a pale ground, so in the light they are blended normally: glow() registers
// those materials and follow() switches them.
const doc = document.documentElement;
export const isLight = () => doc.getAttribute('data-theme') === 'light' && doc.getAttribute('data-scenes') !== 'dark';
export const uLight = { value: isLight() ? 1 : 0 };

const glows = new Set();
export function glow(T, material) { glows.add(material); setBlend(T, material); return material; }
function setBlend(T, m) { const b = uLight.value ? T.NormalBlending : T.AdditiveBlending; if (m.blending !== b) { m.blending = b; m.needsUpdate = true; } }

// follow(engine, fn): fn(light) now and on every theme change (through the
// engine, which stops listening when it is disposed), after the uniform and
// the glows have switched; fn sets the rest (plain colours). The engine redraws.
export function follow(engine, fn) {
  const T = engine.THREE;
  const run = () => { uLight.value = isLight() ? 1 : 0; glows.forEach((m) => setBlend(T, m)); fn(!!uLight.value); };
  engine.onTheme(run);
  run();
}
