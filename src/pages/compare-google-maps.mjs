import { readFileSync } from 'node:fs';
import { stats } from '../../site.config.mjs';
import { F } from '../faqs.mjs';
import { sec } from '../kit.mjs';
import { topicPage, prose, ul, table } from '../topic.mjs';

// Tsamaya and Google Maps (added 2026-10-01). Same rule as compare-waze.mjs: say
// what Tsamaya does and what KIND of app Google Maps is, never list its features.
// The worked example is the site's real route card (src/data/route-card.json),
// which records no place names on purpose.

const card = JSON.parse(readFileSync(new URL('../data/route-card.json', import.meta.url), 'utf8'));
const nMetros = stats.totals.metros;
const s = card.standard, l = card.lower;

const built = sec({
  id: 'built',
  kick: 'What each is for',
  title: 'Time and distance, or risk as well',
  lead: 'Google Maps is a general-purpose map and navigator, built around time and distance. Tsamaya adds the risk of the road at the hour you drive.',
  inner: prose(
    `<p>Tsamaya is a full turn-by-turn navigator with voice, on the phone and on Apple CarPlay. For each trip it fetches the quickest route, tests it against the rated areas in ${nMetros} metros for the hour you are driving, and, if the route passes high-risk areas, looks for a way round that does not cost too much. It shows the options side by side with A to E grades. This page describes Tsamaya and the kind of app Google Maps is; for what Google Maps offers today, its own site is the source.</p>`,
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
    ${prose(`<p>That morning the lower-risk route was ${l.extraKm} km further and ${l.minutesQuicker} minutes quicker, and the card put it at ${l.lessRiskPct}% less risk. It is one trip: another day, hour or trip will look different, and sometimes the lower-risk route is a few minutes slower. The card shows the times either way.</p>`)}`,
});

const together = sec({
  id: 'together',
  kick: 'Working together',
  title: 'Tsamaya and Google Maps side by side',
  inner: prose(
    ul([
      'Tsamaya can hand a route to Google Maps with up to eight points along the lower-risk route, so the same road is followed there.',
      'Locations shared to Tsamaya from other apps open in it, including Google Maps links.',
      'Outside the rated metros, Tsamaya is an ordinary map and navigator with no risk data.',
    ]),
    `<p>The primary action in Tsamaya is its own turn-by-turn navigation. The handoff is a fallback. Lower risk is not no risk.</p>`,
  ),
});

const faqs = [F.google, F.waze, F.longer, F.cities, F.guarantee];

export default topicPage({
  slug: 'compare-google-maps.html',
  title: 'Tsamaya vs Google Maps',
  description: 'Tsamaya compared with Google Maps for South African drivers: routes graded by risk for the hour you drive, one real route card, and how the two work together.',
  meta: 'Comparison · Google Maps',
  h1: 'Tsamaya and Google Maps: time, distance and risk.',
  lead: 'A general-purpose map finds the way. Tsamaya adds whether that way passes high-risk areas at the hour you drive, grades the options, and can hand a route to Google Maps.',
  sections: [built, example, together],
  faqs,
  links: [['Tsamaya vs Waze', 'compare-waze.html'], ['Features', 'features.html'], ['See it in action', 'demo.html'], ['How it works', 'how-it-works.html']],
});
