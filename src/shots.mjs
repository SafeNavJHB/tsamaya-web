// shots.mjs — the real app screenshots used across the site.
//
// Captured from a Release build of com.tsamaya.app on an iPhone 17 Pro simulator
// (iOS 26.5), against the live database. Every one of these is the actual app:
// real Mapbox tiles, real zones and corridors from Supabase, real Google Places
// search, real routing.
//
// jhb-map, capetown-map and route-card: 28 July 2026.
// route-result and navigation: re-captured 10 September 2026, on a Kempton Park
// to Mall of Africa drive. The navigation shot is taken with the simulator
// DRIVING the route (see the location note below), which is what puts the car
// marker, a real speed and a rated road on screen at once.
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
//      cd ~/Projects/SafeNav/ios
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
//    A STATIC fix is not enough for the navigation shot. It leaves the speed
//    reading "--", the road readout stuck on "Loading risk data...", and no car
//    marker at all, which is exactly how the July capture shipped. Drive the
//    route instead, feeding waypoints on stdin because a negative latitude on
//    the command line is parsed as a flag:
//
//      tr ' ' '\n' < waypoints.txt | \
//        xcrun simctl location <UDID> start --speed=15 --interval=1 -
//
//    Waypoints come from the app's own planRoute (scripts/route-probe.ts in the
//    app repo prints a route's geometry), thinned to about one every 100 m.
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
// Sandton genuinely rates low in the daytime band. The navigation shot is night
// too as of September 2026: the dark map is what a driver sees on the trips this
// app is for, and the orange risk ribbon reads better against it than it did on
// the old light capture.

// Gallery entries for the demo page.
export const shots = [
  {
    name: 'jhb-map',
    alt: 'Tsamaya over Sandton, Johannesburg, showing risk zones, checked corridors and a flagged hijacking hotspot on the live map',
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
    alt: 'Tsamaya comparing a lower-risk route against the fastest one on a Kempton Park to Mall of Africa drive, each option graded and showing how many high-risk areas it passes',
    title: 'Compare before you drive',
    caption: 'Kempton Park to Mall of Africa: the same 25 minutes, half a kilometre shorter, and half the high-risk areas, with an honest warning about the ones it could not avoid',
  },
  {
    name: 'navigation',
    alt: 'Tsamaya mid-drive on Monument Road in Kempton Park, the route ribbon coloured orange for risk, showing the next turn with lane guidance, the current speed against the limit, and the road rated Use caution',
    title: 'Turn-by-turn, in the app',
    caption: 'The route coloured by risk as you drive, the next turn with its lanes, and the road you are on named and rated',
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
    'The Tsamaya app over Sandton, Johannesburg, with risk zones shaded on the live map, checked corridors in green, and a flagged hijacking hotspot',
  'capetown-map':
    'Tsamaya over the Cape Town city centre, with risk overlays across District Six, Vredehoek and the Foreshore',
  'route-card':
    'Tsamaya with the start set to the driver’s location and the destination set to Maboneng Precinct, ready to plan the route',
  'route-result':
    'Tsamaya comparing two routes from Kempton Park to Mall of Africa: a combined balanced and lower-risk option at 25 minutes and 17.4 km, graded D, passing two high-risk areas and carrying 68 per cent less risk, against the fastest at 25 minutes and 18.0 km, graded E, passing four. Above them a warning says two high-risk areas could not be avoided',
  navigation:
    'Tsamaya navigating on Monument Road in Kempton Park at night. The road ahead is drawn in orange where the route carries risk, the next instruction is a left turn onto Highveld Road in 140 metres with lane guidance underneath, the speed reads 54 km/h against a 60 limit, and the road the car is on is labelled Monument Road, use caution. The trip has 38 minutes and 37.8 km left',
};

export const altFor = (name) => alts[name] || 'A screen from the Tsamaya app';

// Intrinsic pixel size of every capture (iPhone 17 Pro at 3x). Used for the
// width/height attributes that stop the page shifting as images load.
export const shotSize = { width: 1206, height: 2622 };
