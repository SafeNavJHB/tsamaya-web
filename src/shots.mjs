// shots.mjs — the real app screenshots used across the site.
//
// Captured from a Release build of com.tsamaya.app on an iPhone 17 Pro simulator
// (iOS 26.5), against the live database. Every one of these is the actual app:
// real Mapbox tiles, real zones and corridors from Supabase, real Google Places
// search, real routing.
//
// The site uses the four daytime captures below (home-day, route-card-day,
// route-result-detour-day, navigation-day). The older night set (jhb-map,
// capetown-map, route-card, route-result, navigation, from July and September)
// and two unused daytime captures were removed on 2026/09/26: the night map
// shots showed risk colours over named suburbs, which the site never does, and
// they were still published as files. They are in git history before then.
//
// `name` refers to the optimised variants in public/img/screens/ produced by
// `npm run images` from the raw PNGs in assets/screens-src/ (outside public/,
// so the raw captures are never deployed). Each name has AVIF, WebP and JPEG at
// 300/600/900 wide; the browser picks one.
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
//      xcrun simctl io <UDID> screenshot assets/screens-src/<name>.png
//
// 4. npm run images   → writes the AVIF/WebP/JPEG variants. Commit both the raw
//    PNG and the variants.
//
// TIME BAND. The app follows the real clock, so the palette in a capture depends
// on when it was taken. The site shows daytime captures with the risk overlay
// off: a night map with the overlay on shows risk colours over named suburbs,
// which the site never does (the reason the older night set was removed).
//
// DAYTIME SET (25 September 2026): home-day, route-card-day and navigation-day.
// A Release build of app commit 111afbc on an iPhone 16 Pro simulator (iOS
// 27.0), captured between 08:09 and 08:31 SAST with the city chip reading Day.
// All three are in Rosebank or on the Rosebank to Melrose Arch trip,
// with the risk overlay switched off (the eye icon on home and route result):
// even in the daytime band orange suburbs sit close to every business district we
// tried, and the site never shows a residential area as risky. The navigation map
// draws no zone fills, only the risk-coloured route ribbon, so that frame is taken
// on Oxford Road (lower risk) before the route reaches the M1, with the simulator
// driving the route at 12 m/s. Xcode 27 builds only after every pod target below
// iOS 15 is raised to 15.1 in the generated ios/Podfile post_install.
//
// route-result-detour-day (09:04 SAST) starts in central Kempton Park, about
// 4 km north of the terminal, and shows the detour far better: the Balanced and
// Lower-risk route (graded B) heads south past the airport to the freeway
// instead of straight west, 9.8 km further but 2 minutes quicker in that
// morning's traffic, with 99 per cent less risk than the standard route (graded
// E, 4 high-risk areas). Because the lower-risk route was also the quicker one,
// the app labels the other "Standard" rather than "Fastest". The high-risk areas
// it avoids are Kempton Park suburbs; neither the card nor the map names them,
// so a caption must not name them either.
//
// simctl draws the Dynamic Island into a capture only some of the time. home-day
// got it naturally; the others had it drawn in afterwards from the simulator's
// own `simctl io screenshot --mask=black` capture of the same screen. Only the
// island's pixels were touched, so the set matches the older captures.

// Alt text for every capture, including the ones that only appear in the
// walkthrough and so have no gallery entry to borrow a description from.
// A screen reader should get the same information a sighted reader does.
export const alts = {
  'home-day':
    'The Tsamaya home screen in the daytime over Rosebank, Johannesburg. The city chip reads Johannesburg, Day, the Where to? search bar sits above a row of one-tap shortcuts, and the risk overlay is switched off, so the map shows only streets and places',
  'route-card-day':
    'Tsamaya ready to plan a daytime trip, with the start set to My location in Rosebank and the destination set to Melrose Arch, and an Add stop option and the Go button underneath',
  'route-result-detour-day':
    'Tsamaya comparing three routes from Kempton Park to Cresta Shopping Centre in Randburg in the daytime. The balanced and lower-risk option, graded B, takes 47 minutes over 52.3 km: 9.8 km further than the standard route but 2 minutes quicker in live traffic, with 99 per cent less risk, passing one medium-risk area for 0.1 km. The standard route, graded E, takes 49 minutes over 42.4 km and passes 4 high-risk areas for 10 km, and a third option via the N1, also graded E, passes 3. On the map the lower-risk route heads south past O.R. Tambo International Airport to the freeway where the standard route heads straight west, and both then follow the freeways around the north of Johannesburg',
  'navigation-day':
    'Tsamaya navigating on Oxford Road in Rosebank in the daytime, between 3D buildings. The next instruction is a left turn onto the M20 in 280 metres with lane guidance underneath, the speed reads 43 km/h against a 60 limit, the route is drawn green along Oxford Road and yellow for low risk on the M20 ahead, and the road the car is on is labelled Oxford Road, lower risk. The trip has 8 minutes and 3.8 km left',
};

export const altFor = (name) => alts[name] || 'A screen from the Tsamaya app';

// Intrinsic pixel size of every capture (iPhone 17 Pro at 3x; the daytime set is
// an iPhone 16 Pro, which has the same 1206 x 2622 screen). Used for the
// width/height attributes that stop the page shifting as images load.
export const shotSize = { width: 1206, height: 2622 };
