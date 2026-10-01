import { stats } from '../../site.config.mjs';
import { F } from '../faqs.mjs';
import { sec } from '../kit.mjs';
import { topicPage, prose, ul, table } from '../topic.mjs';

// Tsamaya and Waze (added 2026-10-01). RULE (Kyle, 2026-09-28, repeated from the
// visitor guide): this page describes what Tsamaya does and what KIND of app
// another one is. It never lists another app's features, which change and which
// we cannot verify from here, and it never names another safety or emergency app.
// Waze and Google Maps are navigators, so naming them as a kind is fine.

const nMetros = stats.totals.metros;

const built = sec({
  id: 'built',
  kick: 'What each is for',
  title: 'Two different questions',
  lead: 'Waze is a general-purpose navigator, built to get you there quickly. Tsamaya is a navigator built around risk on South African roads.',
  inner: prose(
    `<p>A general-purpose navigator asks which way is quickest. Tsamaya asks that too, and then a second question: which of the ways there passes through the fewest areas with a history of vehicle crime, at the hour you are driving? It plans the answer in ${nMetros} South African metros, grades the options A to E, and guides you turn by turn with voice, on the phone and on Apple CarPlay.</p>`,
    `<p>This page describes Tsamaya and the kind of app Waze is. For what Waze offers today, its own site is the source: we do not list another app's features, because they change.</p>`,
  ),
});

const jobs = sec({
  id: 'jobs',
  kick: 'Which job is which',
  title: 'What Tsamaya adds',
  inner: table({
    label: 'Tsamaya and general-purpose navigators',
    head: ['You want to', 'Tsamaya', 'A general-purpose navigator such as Waze'],
    rows: [
      ['Get there quickly', 'A Fastest option with traffic-aware arrival times, alongside the others.', 'This is the job it is built for.'],
      ['Avoid areas with a history of vehicle crime', `Routes around rated areas, with separate ratings for day, evening and night, in ${nMetros} metros.`, 'Check the app itself.'],
      ['Go around protests and closures', 'Searched for each morning and routed around while they last. Gated and closed roads are kept in a record of their own.', 'Check the app itself.'],
      ['Know about police, roadblocks and cameras', 'Police and roadblock notices from nearby drivers for an hour, known fixed speed cameras, camera vans for about three hours, and hijacking hotspots.', 'Check the app itself.'],
      ['See that a trip will end after dark', 'The route card warns, and says how soon to leave to arrive in daylight.', 'Check the app itself.'],
      ['Call for help or let someone follow you', 'An SOS button that calls 10111 or 112 or texts your emergency contact, and live trip links that open in any browser.', 'Check the app itself.'],
    ],
  }),
});

const both = sec({
  id: 'both',
  kick: 'Using both',
  title: 'You can keep both',
  inner: prose(
    ul([
      'Use Tsamaya for trips to somewhere unfamiliar, late in the day, or through a metro with ratings. Keep whatever else you use for the rest.',
      'Tsamaya can hand a route to Google Maps with the detour points already in place, and it opens locations shared to it from other apps.',
      'Outside the rated metros Tsamaya is an ordinary map and navigator with no risk data.',
    ]),
    `<p>Tsamaya is in open beta, it is free, and lower risk is not no risk.</p>`,
  ),
});

const faqs = [F.waze, F.google, F.cities, F.free, F.guarantee];

export default topicPage({
  slug: 'compare-waze.html',
  title: 'Tsamaya vs Waze',
  description: 'Tsamaya and Waze do different jobs. See what Tsamaya adds for South African drivers who want routes that account for risk, closures and protests, and why many keep both.',
  meta: 'Comparison · Waze',
  h1: 'Tsamaya and Waze: two different jobs.',
  lead: 'Looking for a Waze alternative in South Africa? Tsamaya is a navigator that plans around risk, closures and protests. Here is what it adds, and where you may still want both.',
  sections: [built, jobs, both],
  faqs,
  links: [['Tsamaya vs Google Maps', 'compare-google-maps.html'], ['Features', 'features.html'], ['How it works', 'how-it-works.html'], ['Coverage', 'coverage.html']],
});
