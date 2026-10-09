// faqs.mjs: the answers the topic pages and the FAQ hub share, written once.
//
// A question that appears on the FAQ hub AND on its topic page reads the same
// object here, so the two cannot drift. The home, visitor and metro pages keep
// their own lists; where a question is the same as theirs, the answer below says
// the same thing in the same words.
//
// Every answer must be true of the app people can install today (facts.mjs says
// where each claim is checked). Lower-risk language, no suburb as risky, no em
// dashes, other apps named only by the kind of app they are.
import { stats, fmt } from '../site.config.mjs';
import { SUMMARY } from './facts.mjs';
import { metros } from './data/metros.mjs';

const nMetros = stats.totals.metros;

// High-risk (top band) counts for the Gauteng metros, from the live figures.
export const gauteng = (() => {
  const keys = new Set(metros.filter((m) => m.region === 'Gauteng').map((m) => m.key));
  const rows = stats.metros.filter((m) => keys.has(m.key));
  const sum = (t) => rows.reduce((n, m) => n + m.byTime[t].red, 0);
  return { rows, day: sum('day'), evening: sum('evening'), night: sum('night'), total: rows.reduce((n, m) => n + m.zones, 0) };
})();
const joburg = stats.metros.find((m) => m.key === 'johannesburg');

export const F = {
  what: { q: 'What is Tsamaya?', a: SUMMARY },
  // The two below (2026-10-09) answer the question the way people put it to an
  // assistant, so the answer can be lifted whole. Brand rule: the question says
  // "avoids high-crime areas", never "safest". getSafeRoute in the app repo's
  // src/services/routing.ts is the source for "how": natural routes first, a
  // detour only when none is clean, the detour budget, three graded options.
  how: {
    q: 'How does Tsamaya work?',
    a: 'Pick a destination and Tsamaya checks the usual routes against its rated areas and roads, using the ratings for the time you will drive each part of the trip. It offers three options, Fastest, Balanced and Lower-risk, each graded A to E. When none of the usual routes gets around the high-risk areas, it looks for a detour, and drops one that adds too much distance. Then it guides you turn by turn, with voice, on your phone or on Apple CarPlay.',
  },
  avoid: {
    q: 'Is there a navigation app that avoids high-crime areas in South Africa?',
    a: `Yes. Tsamaya is a free navigation app that plans driving routes around areas and roads with a history of vehicle crime in ${nMetros} South African metros, using ratings for the hour you drive. It is a full turn-by-turn navigator with voice and Apple CarPlay, not only a risk map, and it adds an SOS button and live trip sharing. Lower risk is not no risk, so stay alert.`,
  },
  who: {
    q: 'Who makes Tsamaya?',
    a: 'Tsamaya (Pty) Ltd, in Johannesburg. It is built and maintained by Kyle Kimble, a Johannesburg chartered accountant, and it is self-funded.',
  },
  free: {
    q: 'Is Tsamaya free?',
    a: 'Yes. Everything that routes you around risk, the SOS button and trip sharing included, is free and stays free. There is no account and there are no ads, and we do not sell anything about you.',
  },
  guarantee: {
    q: 'Does it guarantee I will be safe?',
    a: 'No, and we will never tell you otherwise. Tsamaya cuts your exposure to areas with a history of vehicle crime. Crime is not predictable, and no route is safe. Lower risk is not no risk: treat it as better information for the choice you were going to make anyway.',
  },
  data: {
    q: 'Where does the risk data come from?',
    a: 'Published South African crime statistics, scored against map data to work out where vehicle crime concentrates. An AI review gives a second opinion on the ratings, and a person sense-checks the results, looking closely at any that stand out. After that, drivers\' reports refine the map: a person reads each one before anything changes.',
  },
  cities: {
    q: 'Which cities does it cover?',
    a: `${nMetros} metros: ${stats.metros.map((m) => m.name).join(', ')}. Outside them Tsamaya is an ordinary map and turn-by-turn navigator with no risk data, and a blank map means no data, not no risk.`,
  },
  longer: {
    q: 'Does a lower-risk route take much longer?',
    a: 'Usually a few minutes. A detour is only offered when it cuts your exposure, and one that adds too much distance is thrown out, even when it carries less risk. When there is no sensible way round, Tsamaya says so and marks the risky stretches.',
  },
  stops: {
    q: 'Can I add stops to a trip?',
    a: 'Yes, up to four. Tap Add stop on the route card. Each leg is planned and risk-checked on its own, the voice announces each stop by name, and only the last stop ends the trip.',
  },
  cameras: {
    q: 'Does Tsamaya show speed cameras?',
    a: 'Yes. Known fixed speed cameras show on the map and you hear a heads-up as one comes up. It is a list of the cameras we know about, not a complete one, and coverage is better in some metros than others. The pins and the spoken alerts each have a switch in Settings.',
  },
  vans: {
    q: 'Can I report speed traps and camera vans?',
    a: 'Yes. When you report a speed camera you say whether it is a permanent camera or a camera van. A van shows in amber for about three hours, and other drivers can confirm it is still there or not there. Tsamaya cannot see a van nobody has reported.',
  },
  protests: {
    q: 'Does Tsamaya avoid protests and road closures?',
    a: 'Each morning Tsamaya searches the news for planned protests, strikes and road blockades in the metros it covers. The Balanced and Lower-risk routes go around them for as long as they last, where there is a way round. A road the search cannot pin down is held for a person to review rather than guessed at. Tsamaya only knows what has been reported, so it can miss a blockade that has not been.',
  },
  notices: {
    q: 'What do the Police and Roadblock buttons do?',
    a: 'Tap either while driving and every driver nearby sees it on the map for the next hour. On a drive, Tsamaya says "Police reported ahead" as you approach one on your route. These are notices only: they never change your route or the risk ratings.',
  },
  hotspots: {
    q: 'Does Tsamaya warn about hijacking hotspots?',
    a: 'Yes. Reported hijacking and smash-and-grab spots show on the map and you hear a heads-up as you approach one. They are awareness only: a hotspot never changes your route, and the list is not complete. Each is labelled by its road, never by the neighbourhood around it.',
  },
  voice: {
    q: 'Can I report something by voice?',
    a: 'Yes. Tap Report, then Speak, and say "police", "roadblock", "speed camera" or "crash". It works on the phone and on the car screen, goes through the same Undo as a tap, and uses the microphone only while you speak. No audio is kept. On iPhone you can also say "Hey Siri, report police in Tsamaya".',
  },
  carplay: {
    q: 'Does Tsamaya work with Apple CarPlay?',
    a: 'Yes. The same routes, voice guidance and alerts appear on the car screen: route options with their grades, the coloured risk border, speed camera and hotspot pins, closure notices and a Report button. The app runs on your phone and the car shows it, so keep the phone with you.',
  },
  aa: {
    q: 'Does Tsamaya work with Android Auto?',
    a: 'Android Auto is in testing. It is built and testers use it, but it is not in the public Google Play build yet. This answer changes when that does.',
  },
  offline: {
    q: 'Does Tsamaya work without mobile data?',
    a: 'Partly. Download offline maps for an area and the map keeps drawing where the signal drops, and the risk ratings are kept on your phone once loaded. Planning a new route, sharing a trip and the live link in an SOS text need data.',
  },
  share: {
    q: 'Can someone at home follow my drive?',
    a: 'Yes. Share a trip from the drive screen and send them the link. It opens in any browser, with no app to install, and shows your route, where you are now, your arrival time, and an Arrived screen when you get there. The link stops updating when you arrive.',
  },
  sos: {
    q: 'Does Tsamaya have an SOS or panic button?',
    a: 'Yes. The SOS button on the phone\'s drive screen calls 10111 (the police) or 112 (any mobile), or opens a text to your emergency contact, ready to send, with your location and a link that follows you live. Tsamaya does not send armed response or an ambulance itself, so keep a dedicated emergency app as well.',
  },
  discover: {
    q: 'What is Discover?',
    a: 'A guided flyover of your metro. Tap the Discover button on the map and Tsamaya flies from landmark to landmark with a quick guide at each, and "Take me there" routes to any of them. Landmarks are for exploring: they never change your route.',
  },
  privacy: {
    q: 'Does Tsamaya track me?',
    a: 'Your location is used on your phone to show the map and plan routes. Route requests send bare coordinates to the map provider, never your name. There is no account, and we keep no trip history on our servers unless you choose to share a live trip.',
  },
  waze: {
    q: 'Is Tsamaya a Waze alternative?',
    a: 'It does a different job. Waze is a general-purpose navigator; Tsamaya is a navigator built around risk in South African metros. If you want routes that account for areas with a history of vehicle crime, closures and protests, Tsamaya is built for that, and you can keep both.',
  },
  google: {
    q: 'Does Tsamaya replace Google Maps?',
    a: 'It can: it is a full turn-by-turn navigator with voice. It can also hand a route to Google Maps with the detour points already in place. Whether to keep Google Maps as well is your call.',
  },
  night: {
    q: 'How does Tsamaya handle driving at night in Johannesburg?',
    a: `Ratings rise after dark: in Johannesburg ${fmt(joburg.byTime.day.red)} rated areas are high risk in the day and ${fmt(joburg.byTime.night.red)} at night. Tsamaya uses the rating for the hour you drive, warns you when a trip will arrive after dark, and offers a lower-risk route when one exists. It cannot make any route safe, and lower risk is not no risk.`,
  },
};
