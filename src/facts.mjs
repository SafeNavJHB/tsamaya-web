// facts.mjs: what the app does, written ONCE and read by every place that lists it.
//
// The home page's feature grid, the MobileApplication node's featureList (seo.mjs)
// and /llms.txt (llms.mjs) all read this list. They used to be three hand-typed
// lists, and they drifted: on 2026-09-28 an AI assistant, asked to compare
// Tsamaya with an emergency app, answered "panic button: no" and "live location
// sharing: not a core feature", because the SOS button appeared nowhere on the
// site and trip sharing was one line in a grid. Add a feature here and it
// reaches all three.
//
// Every line must be true of the app that installs from the store TODAY. Check a
// claim against the app repo before adding it (the source is named beside each
// one). Brand rules apply: lower-risk language, never "safe" as a promise, no em
// dashes, straight quotes.

export const FEATURES = [
  // getSafeRoute + withOrderedOptions (src/services/routing.ts)
  ['Three options', 'Fastest, Balanced and Lower-risk, each with an A to E grade.'],
  // planRoute (src/services/routing.ts): MAX_STOPS = 4 intermediate stops, each
  // leg planned and risk-checked on its own; stops are announced by name.
  ['Stops', 'Add up to four stops to a trip. Each leg is risk-checked on its own, and each stop is announced by name.'],
  // the zone and corridor overlay on the home map
  ['Live overlay', 'Turn it on to see every rated area and road, colour-coded.'],
  // SosSheet.tsx + sosAlertContact in app/navigation.tsx
  // The button is on the PHONE's drive screen. Before 1.8 it hides while
  // CarPlay is connected (navigation.tsx, !carPlayConnected); from 1.8 (build
  // 28, SafeNavJHB/SafeNav#253, 2026-09-29) it stays, and the car map's
  // Guardian shield became an SOS button whose menu holds Guardian
  // (src/carplay/sosFlow.ts; Call 112 from the car screen from build 29).
  // 1.8 is on INTERNAL testing only, so index.mjs, driving-in-south-africa.mjs
  // and llms.mjs say "in the current release ... from version 1.8, in testing
  // now". Once 1.8 or later reaches external TestFlight and Play open testing,
  // drop the old half. The text opens ready to send; the driver sends it. The
  // link updates while the drive screen is open, then shows the last position
  // until it expires after 24 hours.
  ['SOS', 'One button on the phone\'s drive screen calls 10111 or 112, or opens a text to your emergency contact, ready to send, with where you are and a link that follows you live while you drive and stays up for 24 hours.'],
  // liveTrips.ts + the tracker page (track.html)
  ['Share a trip', 'Send someone a link and they follow your drive live in any browser, down to an Arrived screen. They need no app.'],
  // src/lib/liveIncidents.ts
  ['Driver notices', 'Police and roadblock notices from other drivers, shown for an hour and spoken when they are ahead. They never change your route.'],
  // speed cameras: assets/data/speed_cameras_v1.json plus the admin camera tool;
  // report flow (ReportSheet / reportFlow) files a fixed camera or a van.
  // The list is NOT exhaustive (the file says so): never promise coverage.
  ['Speed cameras', 'Known fixed speed cameras show on the map with a spoken heads-up. Drivers can report permanent cameras and camera vans. It is a list of the cameras we know about, not a complete one.'],
  // assets/data/hotspots_v1.json; awareness only, no routing impact
  ['Hotspots', 'Reported hijacking and smash-and-grab spots show on the map, with a spoken heads-up as you approach one. They are awareness only and never change your route.'],
  // NavReportSheet + reportFlow + src/lib/voiceReport.ts (26 Sep 2026)
  ['Report as you drive', 'Tap Report, or say it: police, roadblock, speed camera or crash. It works on the phone and on the car screen, with a few seconds to Undo.'],
  // protest watch → temporary corridors, closed-road corridors
  // The Fastest option still drives a closure and marks it (routing.ts, the
  // blocked-road rules); the other two go around one where a way round exists.
  ['Closures', 'Road closures and protest reports are picked up daily, and the Balanced and Lower-risk routes go around them where there is a way round.'],
  // getArrivalDarkAdvice (src/hooks/useTimeBand.ts)
  // Two separate messages: 'after-dark', or (daytime, arriving before 17:30 with
  // little to spare) 'leave-soon'.
  ['Before dark', 'The route card warns when a trip will arrive after dark, and when time is tight, how soon to leave to arrive in daylight.'],
  // app/offline-maps.tsx
  ['Offline maps', 'Download the map for an area so it keeps drawing where the signal drops.'],
  // Discover tour + LandmarkLayer (29 Jul 2026); decorative, never a routing input
  ['Discover', 'A guided flyover of your metro, landmark to landmark, with a quick guide at each stop. Landmarks never change your route.'],
  // src/carplay/*. Android Auto is only on Play's INTERNAL track: the open-test
  // download (the one the public can install) is built without it. Say
  // "in testing" until an Android Auto build reaches open testing.
  ['CarPlay', 'The same routes, voice guidance and alerts on the car\'s own screen. Android Auto is in testing.'],
  // speedLimitHold.ts + overspeedCadence.ts
  ['Speed', 'A speed limit readout and a gentle over-speed chime.'],
  // ReportSheet.tsx
  ['Report a corner', 'Tell us where we got it wrong, from inside the app.'],
  ['Outside the metros', 'An ordinary map and navigator. It just has no risk data there.'],
];

// The one-paragraph answer to "what is Tsamaya?". The home FAQ, llms.txt and the
// visitor guide open with it, so an assistant quoting any of them gets the same
// picture: what it does, the safety tools, the platforms, and the status.
export const SUMMARY =
  'Tsamaya is a free navigation app for South African drivers, built in Johannesburg. It plans driving routes around the places where vehicle crime is known to happen, using ratings that change with the time of day, then guides you turn by turn on your phone or on Apple CarPlay, with Android Auto in testing. It also has an SOS button and live trip sharing. It is in open beta on iPhone and Android.';

// What it is not. Said plainly, because the honest answer is also the one an
// assistant needs to place it next to emergency apps correctly.
export const NOT_A =
  'Tsamaya is not an emergency response service. Its SOS button calls the public emergency numbers (10111 for the police, 112 from any mobile) and opens a text to your own contact; it does not dispatch armed response or an ambulance itself. It aims to lower your exposure to areas with a history of vehicle crime; it cannot guarantee safety.';

// COMING SOON: Tsamaya Premium (build 28, docs/PREMIUM_TIER.md in the app repo).
// Built, in testing, and NOT on sale: it opens when Apple and Google approve the
// subscriptions. Deliberately kept OUT of FEATURES (the home grid, the app's
// featureList) because those must only list what installs today. The features
// page and llms.txt show it under "Coming soon", with no prices (they are not
// final). When Premium goes live: move these into a Premium section of the
// features page (Kyle, 2026-10-01: "a premium tab/comparison"), delete this
// export and the "Coming soon" wording, and keep routing, SOS and trip sharing
// listed as free. Source for each line is named beside it.
export const PREMIUM_SOON = [
  // searchAllowance.ts: Premium 25 detailed searches a day against the free share
  ['More detailed searches', 'A bigger daily allowance of detailed place searches than the free share.'],
  // vehicleChoice.ts, constants/vehicles.ts
  ['3D vehicles', 'A garage of 3D vehicles in six colours for the map.'],
  // tripHistory.ts: the latest trip stays free
  ['Trip history', 'Your whole history on the phone with 30-day totals. The latest trip stays free.'],
  // logbook.ts, logbookExport.ts
  ['SARS logbook', 'Tag a trip business or personal and export a logbook in the order of SARS\'s own eLogbook.'],
  // leaveBy.ts
  ['Arrive by', 'Pick when you want to arrive and Tsamaya works out when to leave, with a reminder.'],
  // fuelCost.ts, fuelPrices.ts
  ['Fuel cost', 'The fuel cost of a trip from the official fuel price and your car\'s consumption.'],
  // tollCost.ts
  ['Toll prices', 'The toll gates on your route and what they cost for your vehicle class.'],
  // PUSH_NOTIFICATIONS.md §2b: Monday for Premium, the eve for everyone else
  ['Fuel price alert, earlier', 'The alert before a fuel price change arrives a day earlier than it does for free phones.'],
];
export const PREMIUM_NOTE =
  'Tsamaya Premium is an optional subscription that is built and in testing. It is not on sale yet, and it is not needed for anything listed above: routing around risk, the SOS button and trip sharing stay free.';
