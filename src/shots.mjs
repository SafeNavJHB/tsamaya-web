// shots.mjs — real screenshots captured from the iOS Simulator for the demo page.
// Captured from the current Tsamaya build (com.tsamaya.app) running on an
// iPhone 16 Pro simulator, June 2026. Each entry:
//   { src, alt, title, caption }   (src is relative to dist/, served from public/)
// Leave the array empty to fall back to the interactive SVG mockups on the demo page.

export const shots = [
  {
    src: 'img/screens/home.jpg',
    alt: 'Tsamaya home screen over Johannesburg with the live risk overlay and safe corridors',
    title: 'The live risk map',
    caption: 'Johannesburg — risk zones and safe corridors, colour-coded',
  },
  {
    src: 'img/screens/risk-innercity.jpg',
    alt: 'Tsamaya over the Johannesburg inner city showing dense high-risk overlays across Hillbrow and Berea',
    title: 'See the risk',
    caption: 'Hillbrow, Berea & the CBD — high-risk areas at a glance',
  },
  {
    src: 'img/screens/capetown.jpg',
    alt: 'Tsamaya home screen over Cape Town with risk overlays around the city centre',
    title: 'Multi-metro',
    caption: 'Cape Town — the same engine, a second city',
  },
];

// No screen recording captured for this build (the route-flow screens require UI
// interaction; the annotated mockups below cover that flow).
// shots.video = { src: 'img/screens/demo.mp4', poster: 'img/screens/home.jpg' };
