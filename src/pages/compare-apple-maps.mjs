import { readFileSync } from 'node:fs';
import { stats } from '../../site.config.mjs';
import { F } from '../faqs.mjs';
import { sec } from '../kit.mjs';
import { topicPage, prose, ul, table } from '../topic.mjs';

// Tsamaya and Apple Maps (added 2026-10-26, after the SEO audit asked for it).
// Same rule as compare-waze.mjs and compare-google-maps.mjs: say what Tsamaya
// does and what KIND of app Apple Maps is, never list its features. Checked
// against the app repo: Apple Maps links shared to Tsamaya open in it
// (src/services/locationLink.ts reads maps.apple.com links and short links);
// CarPlay is in every iPhone build; the handoff is to Google Maps only
// (src/lib/googleMapsHandoff.ts), so this page never offers one to Apple Maps.
// The worked example is the site's real route card, which records no place names.

const card = JSON.parse(readFileSync(new URL('../data/route-card.json', import.meta.url), 'utf8'));
const nMetros = stats.totals.metros;
const s = card.standard, l = card.lower;

const built = sec({
  id: 'built',
  kick: 'What each is for',
  title: 'The map on every iPhone, or risk as well',
  lead: 'Apple Maps is the general-purpose map and navigator built into the iPhone, built around time and distance. Tsamaya adds the risk of the road at the hour you drive.',
  inner: prose(
    `<p>Tsamaya is a full turn-by-turn navigator with voice, on the iPhone and on Apple CarPlay, and on Android and Android Auto as well. For each trip it fetches the quickest route, tests it against the rated areas in ${nMetros} South African metros for the hour you are driving, and, if the route passes high-risk areas, looks for a way round that does not cost too much. It shows the options side by side with A to E grades. This page describes Tsamaya and the kind of app Apple Maps is; for what Apple Maps offers today, Apple's own site is the source.</p>`,
  ),
});

const example = sec({
  id: 'example',
  kick: 'One real trip',
  title: 'What the comparison looks like',
  lead: `A route card from the app, captured ${card.captured} in daytime traffic. No place names are recorded here on purpose.`,
  inner: `${table({
    label: 'A real route card',
    head: ['', 'Standard route', 'Lower-risk route'],
    rows: [
      ['Grade', s.grade, l.grade],
      ['Time', `${s.minutes} min`, `${l.minutes} min`],
      ['Distance', `${s.km} km`, `${l.km} km`],
      ['Areas passed', `${s.highRisk} high-risk`, `${l.mediumRisk} medium-risk, for ${l.mediumRiskKm} km`],
    ],
  })}
    ${prose(`<p>That morning the lower-risk route was ${l.extraKm} km further and ${l.minutesQuicker} minutes quicker. It is one trip: another day, hour or trip will look different, and sometimes the lower-risk route is a few minutes slower. The card shows the times either way.</p>`)}`,
});

const together = sec({
  id: 'together',
  kick: 'On an iPhone',
  title: 'Tsamaya and Apple Maps on the same phone',
  inner: prose(
    ul([
      'Share a place from Apple Maps to Tsamaya and it opens there, ready to plan the trip.',
      'On Apple CarPlay, Tsamaya shows its own map with the route options and their grades, the coloured risk border, and its alerts.',
      'Outside the rated metros, Tsamaya is an ordinary map and navigator with no risk data, so for a trip with no rated ground either app will do.',
    ]),
    `<p>Lower risk is not no risk. Tsamaya cuts your exposure to areas with a history of vehicle crime; it cannot make a drive safe.</p>`,
  ),
});

export default topicPage({
  slug: 'compare-apple-maps.html',
  title: 'Tsamaya vs Apple Maps',
  description: 'Tsamaya compared with Apple Maps for South African iPhone drivers: routes graded by risk for the hour you drive, one real route card, and how the two share an iPhone and CarPlay.',
  meta: 'Comparison · Apple Maps',
  h1: 'Tsamaya and Apple Maps: time, distance and risk.',
  lead: 'The map built into the iPhone finds the way. Tsamaya adds whether that way passes high-risk areas at the hour you drive, and grades the options, on the iPhone and on CarPlay.',
  sections: [built, example, together],
  faqs: [F.apple, F.carplay, F.longer, F.cities, F.guarantee],
  links: [['Tsamaya vs Google Maps', 'compare-google-maps.html'], ['Tsamaya vs Waze', 'compare-waze.html'], ['CarPlay and Android Auto', 'carplay-android-auto.html'], ['How it works', 'how-it-works.html']],
});
