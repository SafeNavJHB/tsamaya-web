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
import { stats, fmt } from '../site.config.mjs';

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
  // Both public builds are 1.8 or later since 2026-10 (TestFlight's public link
  // serves 1.10.0, Play open testing 1.8.0), so the pre-1.8 caveat is gone. The text opens ready to send; the driver sends it. The
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
  // src/carplay/*. Android Auto is in the public Google Play build from 1.8.0
  // (open testing, approved by Google 2026-10-09).
  ['CarPlay', 'The same routes, voice guidance and alerts on the car\'s own screen, with Apple CarPlay or Android Auto.'],
  // speedLimitHold.ts + overspeedCadence.ts
  ['Speed', 'A speed limit readout and a gentle over-speed chime.'],
  // ReportSheet.tsx
  ['Report a corner', 'Tell us where we got it wrong, from inside the app.'],
  ['Outside the rated places', 'An ordinary map and navigator. It just has no risk data there.'],
];

// WHAT SETS IT APART (Kyle, 2026-10-28: "it needs to stand out"). Read by the
// Why Tsamaya page, /llms.txt and the app node's keywords. RULE: never "first" or
// "only". Other South African apps already offer crime maps and risk-scored
// routes (checked 2026-10-28), so a "first" claim is false and a "only" claim is
// one competitor update away from false. Each line says what Tsamaya does, never
// what another app lacks. Same sourcing rule as FEATURES: true of the app that
// installs today.
const road = fmt(stats.totals.corridorsSafe + stats.totals.corridorsDanger);
export const POSITIONING = 'Risk-aware navigation, proudly South African.';
export const STANDOUT = [
  // segmentBands + scoreCandidateAcrossBands (src/services/routing.ts)
  ['Rated for the hour you drive', 'Every rated area has its own daytime, evening and night rating. A trip that starts at five and ends after dark is checked against the rating for the time you reach each part of it.'],
  // rated roads = checked + flagged (stats.totals); closed roads carry no rating; safeCorridorCertifies, dangerRowClaims (geometry.ts)
  ['Roads as well as areas', `${road} road stretches carry ratings of their own, checked or flagged. A main road can count as the better way through a rated area, and a flagged road you only cross is not held against the route.`],
  // getSafeRoute + withOrderedOptions; withinBudget (src/services/routing.ts)
  ['Three routes, graded', 'Fastest, Balanced and Lower-risk, each graded A to E, with what each one goes around. A detour that adds too much is left out of the three, and when there is no sensible way round, the app says so.'],
  // useNavSession drives the phone and the car (src/hooks/useNavSession.ts)
  ['A full navigator, in the car too', 'Turn-by-turn voice on the phone, Apple CarPlay and Android Auto, from the same routing. It guides the whole drive, not only the plan before you leave.'],
  // protest watch + blocked corridors
  ['Closures and protests, daily', 'Road closures and protest reports are picked up every day, and the Balanced and Lower-risk routes go around them while they last.'],
  // SosSheet, liveTrips, Guardian (src/carplay/sosFlow.ts)
  ['Help if it goes wrong', 'An SOS button that calls 10111 or 112 or texts your emergency contact, and live trip links anyone can follow in a browser.'],
  // the pipeline's review stage and the report review queue
  ['Checked by people', 'Ratings start from published SAPS crime statistics, get an AI second opinion and a person\'s sense-check. A person reads every driver report on a road or area before its rating changes.'],
  // no account, no ads (privacy policy)
  ['Free, nothing to sign up for', 'No account and no ads, and nothing about you is sold. Routing around risk, SOS and trip sharing stay free.'],
];

// The one-paragraph answer to "what is Tsamaya?". The home FAQ, llms.txt and the
// visitor guide open with it, so an assistant quoting any of them gets the same
// picture: what it does, the safety tools, the platforms, and the status.
export const SUMMARY =
  'Tsamaya is a free, risk-aware navigation app for South African drivers, proudly built in Johannesburg. It plans driving routes around the places where vehicle crime is known to happen, using ratings that change with the time of day, then guides you turn by turn on your phone, Apple CarPlay or Android Auto. It also has an SOS button and live trip sharing. It is in open beta on iPhone and Android.';

// WHERE IT INSTALLS TODAY: one statement, with the day it was last checked, read by
// the get-app and car pages and /llms.txt. `verified` is the day someone looked at
// the stores, not the day the wording was written, so move it only after looking:
// the Play listing, App Store Connect's public TestFlight group and the App Store.
// `npm run check:facts` compares these with the stores and fails when it has gone
// more than 45 days without a check. iPhone 1.10.0 is the public TestFlight group's
// newest build (45); Android 1.8.0 is Play open testing (version code 27).
export const AVAILABILITY = {
  verified: '2026-11-05',
  androidVersion: '1.8.0',
  iphoneVersion: '1.10.0',
  android: 'Android: Google Play open testing, which anyone can install. Version 1.8.0, which includes Android Auto.',
  iphone: 'iPhone: a public TestFlight beta, version 1.10.0, on iOS 16.4 or later. It is not on the App Store yet.',
};

// HOW RATINGS AND GRADES WORK: the numbers the method section of the technical page
// states, read from one place because the app owns them. `npm run check:facts`
// compares each with the app repo. Sources: routingTunables.ts (pricing, grades),
// timeBandClock.ts (hours), fetch_saps_crimes.py in the pipeline (the quarters).
export const METHOD = {
  costPerKm: { red: 1000, orange: 50, yellow: 20 },
  saturationKm: 5,
  redFloorMetres: 50,
  gradeUnder: { A: 50, B: 250, C: 1000, D: 8000 },
  bands: {
    daytime: ['05:00', '17:30'],
    evening: ['17:30', '19:30'],
    night: ['19:30', '05:00'],
  },
  sapsQuarters: 'July 2025 to June 2026',
};

// WHAT THE RATINGS CANNOT TELL YOU. Read by the technical page and /llms.txt, so a
// person and an assistant get the same limits. Plain text, no markup.
export const LIMITS = [
  ['Reported crime only', 'SAPS counts crime reported to the police. Under-reporting differs by place and by kind of crime, so a low figure is not proof of a quiet place.'],
  ['Precinct, not street', 'A police station\'s total cannot say which street a crime happened on. Spreading it by population is an estimate, and a busy precinct\'s figure can land on an airport, a mine or other land with few residents. We correct those as we find them.'],
  ['History, not a forecast', 'Ratings describe the past, about a year of figures at best. A new pattern shows up late. Only closures and driver reports move faster.'],
  ['After dark is an estimate', 'SAPS does not publish crime by the hour, so evening and night ratings are not measured. They are a review\'s estimate of how a place changes after dark.'],
  ['Not every rating is read by a person', 'A person sense-checks the results and looks closely at what stands out, not at each of the thousands of ratings one by one.'],
  ['Gaps in the map', 'Most side streets have no rating of their own. Outside the rated places there is no risk data at all, and a blank map means no data, not no risk.'],
  ['Not a safety promise', 'Lower risk does not mean safe. No route is guaranteed crime-free, and every driving decision stays yours.'],
];

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
  // tripHistory.ts freeTripsShown: the last two days stay free (since 2026-11-04)
  ['Trip history', 'Your whole history on the phone with 30-day totals. The last two days of drives stay free.'],
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
