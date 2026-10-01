import { stats } from '../../site.config.mjs';
import { FEATURES, NOT_A, PREMIUM_SOON, PREMIUM_NOTE } from '../facts.mjs';
import { F } from '../faqs.mjs';
import { sec, linkQ } from '../kit.mjs';
import { topicPage, grid, prose } from '../topic.mjs';

// The canonical features page (added 2026-10-01). It reads the same FEATURES list
// as the home grid, the app's JSON-LD featureList and /llms.txt (src/facts.mjs),
// grouped by what a driver is trying to do. Every feature must sit in exactly one
// group: the build throws if one is left out, so a feature added to facts.mjs can
// never be missing from this page.

const nMetros = stats.totals.metros;
const byTitle = new Map(FEATURES);

const GROUPS = [
  {
    id: 'routing',
    kick: 'Routing',
    title: 'Lower-risk routes, graded',
    lead: `Every trip is checked against the rated areas in ${nMetros} metros, for the hour you drive, and bent around the high-risk ones when a sensible detour exists.`,
    items: ['Three options', 'Stops', 'Before dark', 'Live overlay', 'Outside the metros'],
    links: [['How routing works', 'how-it-works.html'], ['Driving at night in Gauteng', 'night-driving-gauteng.html'], ['Coverage', 'coverage.html']],
  },
  {
    id: 'awareness',
    kick: 'On the road',
    title: 'Closures, cameras and what drivers report',
    lead: 'The things that change on the day: a protest, a roadblock, a camera van, a hijacking hotspot ahead.',
    items: ['Closures', 'Driver notices', 'Speed cameras', 'Hotspots', 'Report as you drive', 'Report a corner', 'Speed'],
    links: [['Protests and road closures', 'closures-and-protests.html'], ['Speed cameras', 'speed-cameras.html'], ['Hijacking hotspots', 'hijacking-hotspots.html']],
  },
  {
    id: 'map',
    kick: 'The map',
    title: 'Offline maps and discovering a city',
    items: ['Offline maps', 'Discover'],
    links: [['Visiting South Africa', 'driving-in-south-africa.html']],
  },
  {
    id: 'car',
    kick: 'In the car',
    title: 'CarPlay, and Android Auto in testing',
    items: ['CarPlay'],
    links: [['CarPlay and Android Auto', 'carplay-android-auto.html']],
  },
  {
    id: 'help',
    kick: 'Emergencies and sharing',
    title: 'SOS and live trip sharing',
    items: ['SOS', 'Share a trip'],
    links: [['Live trip sharing', 'live-trip-sharing.html']],
  },
];

const placed = new Set(GROUPS.flatMap((g) => g.items));
for (const [t] of FEATURES) if (!placed.has(t)) throw new Error(`features.mjs: the feature "${t}" (src/facts.mjs) is in no group`);
for (const t of placed) if (!byTitle.has(t)) throw new Error(`features.mjs: group item "${t}" is not in src/facts.mjs`);

const groups = GROUPS.map((g) => sec({
  id: g.id,
  kick: g.kick,
  title: g.title,
  lead: g.lead,
  inner: `${grid(g.items.map((t) => [t, byTitle.get(t)]))}
    <div class="more" data-reveal>${g.links.map(([t, h]) => linkQ(t, h)).join('')}</div>`,
}));

// Not available yet: shown apart from the features above, which all install today.
// When Premium goes live this becomes a Premium tab or comparison (facts.mjs).
const soon = sec({
  id: 'coming-soon',
  kick: 'Coming soon',
  title: 'Tsamaya Premium',
  lead: PREMIUM_NOTE,
  inner: grid(PREMIUM_SOON),
});

const limits = sec({
  id: 'limits',
  kick: 'What it is not',
  title: 'The limits',
  inner: prose(
    `<p>${NOT_A}</p>`,
    `<p>Tsamaya is in open beta. Android Auto is in testing and not yet in the public Google Play build. The risk ratings come from published crime statistics, an AI second opinion, a person's sense-check and drivers' reports, so they are good information and not a prediction. Lower risk is not no risk.</p>`,
  ),
});

const faqs = [F.stops, F.cameras, F.protests, F.carplay, F.aa, F.offline, F.free, F.guarantee];

export default topicPage({
  slug: 'features.html',
  title: 'Features',
  description: 'Everything Tsamaya does for South African drivers: graded lower-risk routes, stops, road closures and protests, speed cameras, hotspots, CarPlay, SOS and live trip sharing.',
  meta: 'Features',
  h1: 'What Tsamaya does.',
  lead: 'Tsamaya is a free navigation app for South African drivers. It plans routes around areas with a history of vehicle crime, then guides you turn by turn. This page lists everything it does today, with a link to the detail on each.',
  sections: [...groups, soon, limits],
  faqs,
  links: [['How it works', 'how-it-works.html'], ['See it in action', 'demo.html'], ['Every update', 'updates.html'], ['All the questions', 'faq.html']],
  ctaTitle: 'Put it on your phone.',
});
