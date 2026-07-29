// shots.mjs — the real app screenshots used across the site.
//
// Captured 28 July 2026 from a Release build of com.tsamaya.app on an iPhone 17
// Pro simulator (iOS 26.5), against the live database. Every one of these is the
// actual app: real Mapbox tiles, real zones and corridors from Supabase, real
// Google Places search, real routing.
//
// `name` refers to the optimised variants in public/img/screens/ produced by
// `npm run images` from the raw PNGs in public/img/screens/src/. Each name has
// AVIF, WebP and JPEG at 300/600/900 wide; the browser picks one.
//
// ---------------------------------------------------------------------------
// HOW TO REFRESH THESE
//
// 1. Build. Use xcodebuild DIRECTLY — `npx expo run:ios` hangs indefinitely on
//    this machine after the pods finish (reproduced twice on 28 July; the Expo
//    wrapper stalls, Xcode itself is fine):
//
//      cd ~/Desktop/SafeNav/ios
//      xcodebuild -workspace Tsamaya.xcworkspace -scheme Tsamaya \
//        -configuration Release \
//        -destination "platform=iOS Simulator,id=<UDID>" \
//        -derivedDataPath /tmp/tsamaya-dd ONLY_ACTIVE_ARCH=YES -quiet build
//
//    Only ever run ONE build against a given -derivedDataPath at a time; two
//    concurrent builds fail with "unable to attach DB: database is locked".
//    Release embeds the JS bundle, so no Metro is needed and there is no dev
//    overlay in the shot.
//
// 2. Install, place the device in a metro, and launch:
//      xcrun simctl install <UDID> /tmp/tsamaya-dd/Build/Products/Release-iphonesimulator/Tsamaya.app
//      xcrun simctl location <UDID> set -26.1076,28.0567    # Rosebank, Johannesburg
//      xcrun simctl launch <UDID> com.tsamaya.app
//
// 3. Drive the UI, then capture at device resolution:
//      xcrun simctl io <UDID> screenshot public/img/screens/src/<name>.png
//
// 4. npm run images   → writes the AVIF/WebP/JPEG variants. Commit both the raw
//    PNG and the variants.
//
// TIME BAND. The app follows the real clock, so the palette in a capture depends
// on when it was taken. The map shots are deliberately NIGHT: after dark the
// ratings climb and the overlays actually show the risk data, which is the whole
// point of those screens. Captured at 06:39 the same map is nearly empty, because
// Sandton genuinely rates low in the daytime band. The navigation shot is DAYTIME
// because the light map reads better and the route colouring shows regardless.

// Gallery entries for the demo page.
export const shots = [
  {
    name: 'jhb-map',
    alt: 'Tsamaya over Sandton, Johannesburg, showing risk zones, safe corridors and a flagged hijacking hotspot on the live map',
    title: 'The live risk map',
    caption: 'Sandton and Illovo, with zones, corridors and hotspots rated for the current time of day',
  },
  {
    name: 'capetown-map',
    alt: 'Tsamaya over the Cape Town city centre with risk overlays across District Six, Vredehoek and the Foreshore',
    title: 'Multi-metro',
    caption: 'Cape Town, the largest map we run',
  },
  {
    name: 'route-result',
    alt: 'Tsamaya comparing a lower-risk route against the standard one, showing the time and distance each costs',
    title: 'Compare before you drive',
    caption: 'Three routes, the real trade-off in minutes, and an honest warning when risk cannot be avoided',
  },
  {
    name: 'navigation',
    alt: 'Tsamaya mid-drive with the route overview open, showing the safety-coloured route and the full list of turns ahead',
    title: 'Turn-by-turn, in the app',
    caption: 'The route coloured by risk end to end, with every turn ahead listed by name',
  },
];

// Which capture backs each step of the annotated walkthrough. A step with no
// entry here falls back to the drawn SVG mockup in components.mjs.
export const walkthrough = {
  home: 'jhb-map',
  route: 'route-card',
  result: 'route-result',
  navigation: 'navigation',
};

// Alt text for every capture, including the ones that only appear in the
// walkthrough and so have no gallery entry to borrow a description from.
// A screen reader should get the same information a sighted reader does.
export const alts = {
  'jhb-map':
    'The Tsamaya app over Sandton, Johannesburg, with risk zones shaded on the live map, safe corridors in green, and a flagged hijacking hotspot',
  'capetown-map':
    'Tsamaya over the Cape Town city centre, with risk overlays across District Six, Vredehoek and the Foreshore',
  'route-card':
    'Tsamaya with the start set to the driver’s location and the destination set to Maboneng Precinct, ready to plan the route',
  'route-result':
    'Tsamaya comparing three routes to the same destination: lower-risk at 23 minutes, balanced at 21, standard at 20, with a warning that three high-risk areas could not be avoided',
  navigation:
    'Tsamaya navigating from Sandton to Maboneng with the route overview open. The route is drawn across Johannesburg and coloured by risk, hotspots are marked along it, and the turn list below reads: turn right, bear right onto Maude Street, turn left toward the M9, right onto Grayston Drive, then the M1 ramp and exit 10A onto the M2',
};

export const altFor = (name) => alts[name] || 'A screen from the Tsamaya app';

// Intrinsic pixel size of every capture (iPhone 17 Pro at 3x). Used for the
// width/height attributes that stop the page shifting as images load.
export const shotSize = { width: 1206, height: 2622 };
