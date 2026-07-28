// shots.mjs — real screenshots captured from the iOS Simulator for the demo page.
// Captured from the Tsamaya build (com.tsamaya.app) running on an iPhone 16 Pro
// simulator, June 2026. Each entry:
//   { src, alt, title, caption, width, height }
// (src is relative to dist/, served from public/; width/height are the image's
// intrinsic pixels and must be present or the page shifts as images load.)
// Leave the array empty to fall back to the interactive SVG mockups on the demo page.
//
// TO REFRESH THESE — and to finally replace the two *mocked* walkthrough screens
// (the From/To card and the route-comparison result are SVG drawings, not captures):
//
//   1. Boot a simulator and install a build:
//        npx expo run:ios --configuration Release
//      NOTE: as of 28 July 2026 that build stalls indefinitely on this machine
//      after the pods finish (SWBBuildService sleeps, no compiler activity, no
//      disk pressure). The previously-installed 24 July binary cannot be used
//      with current JS either — it predates the native `Voice` HybridObject that
//      @iternio/react-native-auto-play 0.5.11 requires, so the app dies at launch
//      with "Cannot create an instance of HybridObject Voice". A working native
//      build is a prerequisite for any new capture.
//   2. Put the simulator in a metro:  xcrun simctl location <UDID> set -26.1076,28.0567
//   3. Drive the flow and capture:    xcrun simctl io booted screenshot home.png
//   4. Drop the PNGs in public/img/screens/src/ and run `npm run images`, which
//      writes AVIF/WebP/JPEG at three widths.
//   5. Switch the page to the `deviceShot()` component (src/components.mjs), which
//      renders those variants through <picture> with srcset.

export const shots = [
  {
    src: 'img/screens/home.jpg',
    width: 640,
    height: 1391,
    alt: 'Tsamaya home screen over Johannesburg with the live risk overlay and safe corridors',
    title: 'The live risk map',
    caption: 'Johannesburg — risk zones and safe corridors, colour-coded',
  },
  {
    src: 'img/screens/risk-innercity.jpg',
    width: 640,
    height: 1391,
    alt: 'Tsamaya over the Johannesburg inner city showing dense high-risk overlays across Hillbrow and Berea',
    title: 'See the risk',
    caption: 'Hillbrow, Berea & the CBD — high-risk areas at a glance',
  },
  {
    src: 'img/screens/capetown.jpg',
    width: 640,
    height: 1391,
    alt: 'Tsamaya home screen over Cape Town with risk overlays around the city centre',
    title: 'Multi-metro',
    caption: 'Cape Town — the same engine, a second city',
  },
];

// No screen recording captured for this build (the route-flow screens require UI
// interaction; the annotated mockups below cover that flow).
// shots.video = { src: 'img/screens/demo.mp4', poster: 'img/screens/home.jpg' };
