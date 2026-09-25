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
//
// DAYTIME SET (25 September 2026): home-day, route-card-day, route-result-day and
// navigation-day. A Release build of app commit 111afbc on an iPhone 16 Pro
// simulator (iOS 27.0), captured between 08:09 and 08:31 SAST with the city chip
// reading Day. All four are in Rosebank or on the Rosebank to Melrose Arch trip,
// with the risk overlay switched off (the eye icon on home and route result):
// even in the daytime band orange suburbs sit close to every business district we
// tried, and the site never shows a residential area as risky. The navigation map
// draws no zone fills, only the risk-coloured route ribbon, so that frame is taken
// on Oxford Road (lower risk) before the route reaches the M1, with the simulator
// driving the route at 12 m/s. Xcode 27 builds only after every pod target below
// iOS 15 is raised to 15.1 in the generated ios/Podfile post_install.
//
// route-result-airport-day (08:51 SAST, same build and simulator) is a longer
// trip, O.R. Tambo International Airport to Cresta Shopping Centre, picked to
// show a detour: the Balanced and Lower-risk option leaves the airport to the
// north past Kempton Park instead of south to the N12, for 3 minutes and 186 m
// more and 26 per cent less risk. Every option is graded D because the one
// high-risk area on all of them is the airport's own zone ("OR Tambo
// International Airport", rated high in the daytime band), which no trip from
// the terminal can avoid. The card does not name it (the caution list below the
// fold does), so a caption must not suggest the risk lies along the freeways.
//
// simctl draws the Dynamic Island into a capture only some of the time. home-day
// got it naturally; the others had it drawn in afterwards from the simulator's
// own `simctl io screenshot --mask=black` capture of the same screen. Only the
// island's pixels were touched, so the set matches the older captures.

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
  'home-day':
    'The Tsamaya home screen in the daytime over Rosebank, Johannesburg. The city chip reads Johannesburg, Day, the Where to? search bar sits above a row of one-tap shortcuts, and the risk overlay is switched off, so the map shows only streets and places',
  'route-card-day':
    'Tsamaya ready to plan a daytime trip, with the start set to My location in Rosebank and the destination set to Melrose Arch, and an Add stop option and the Go button underneath',
  'route-result-day':
    'Tsamaya comparing two routes from Rosebank to Melrose Arch in the daytime. The first is the fastest, balanced and lower-risk option at once: graded A, 8 minutes and 3.9 km, with 1 km through low-risk areas. The alternative via the M30 is graded B, 2 minutes and 164 metres longer, and passes one medium-risk area for 0.3 km and 3 km of low-risk areas. A banner above them calls the first the lower-risk choice for this trip',
  'route-result-airport-day':
    'Tsamaya comparing three routes from O.R. Tambo International Airport to Cresta Shopping Centre in Randburg in the daytime. The balanced and lower-risk option, graded D, takes 58 minutes over 56.9 km, 3 minutes and 186 metres more than the fastest, and carries 26 per cent less risk: it passes one high-risk area for 3.2 km instead of 4.4 km. The fastest takes 55 minutes over 56.7 km and a third option via the N3 takes 57 minutes, both graded D. A banner warns that one high-risk area could not be avoided. On the map the lower-risk route leaves the airport to the north past Kempton Park, where the fastest leaves to the south, and both then follow the freeways around the north of Johannesburg',
  'navigation-day':
    'Tsamaya navigating on Oxford Road in Rosebank in the daytime, between 3D buildings. The next instruction is a left turn onto the M20 in 280 metres with lane guidance underneath, the speed reads 43 km/h against a 60 limit, the route is drawn green along Oxford Road and yellow for low risk on the M20 ahead, and the road the car is on is labelled Oxford Road, lower risk. The trip has 8 minutes and 3.8 km left',
};

export const altFor = (name) => alts[name] || 'A screen from the Tsamaya app';

// Intrinsic pixel size of every capture (iPhone 17 Pro at 3x; the daytime set is
// an iPhone 16 Pro, which has the same 1206 x 2622 screen). Used for the
// width/height attributes that stop the page shifting as images load.
export const shotSize = { width: 1206, height: 2622 };
