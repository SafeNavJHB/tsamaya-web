import { fmt } from '../../site.config.mjs';
import { F, gauteng } from '../faqs.mjs';
import { sec } from '../kit.mjs';
import { topicPage, prose, ul, table } from '../topic.mjs';

// Driving at night in Gauteng (added 2026-10-01). A problem-first page for the
// searches people actually type ("is it safe to drive in Johannesburg at night").
// Every figure is read from stats.json at build time: the number of rated areas
// in the top band per time band, summed over the Gauteng metros (faqs.mjs).
// EDITORIAL RULE: roads and metros only, never a suburb; never the word "safe" as
// a promise; the page says plainly that Tsamaya cannot make a drive safe.

const num = (n) => fmt(n);

const why = sec({
  id: 'why',
  kick: 'Why night is different',
  title: 'The same roads carry different ratings after dark',
  lead: 'Tsamaya rates every area three times: daytime 05:00 to 17:30, evening 17:30 to 19:30 and night 19:30 to 05:00. It uses the rating for the hour you drive.',
  inner: `${table({
    label: 'High-risk rated areas by time of day in the Gauteng metros',
    head: ['Metro', 'Rated areas', 'High risk, day', 'High risk, evening', 'High risk, night'],
    rows: [
      ...gauteng.rows.map((m) => [`<a href="${m.slug}.html">${m.name}</a>`, num(m.zones), num(m.byTime.day.red), num(m.byTime.evening.red), num(m.byTime.night.red)]),
      ['All four', num(gauteng.total), num(gauteng.day), num(gauteng.evening), num(gauteng.night)],
    ],
  })}
    ${prose(`<p>Across the four Gauteng metros, ${num(gauteng.night)} of ${num(gauteng.total)} rated areas are high risk at night, against ${num(gauteng.day)} in the day. These are counts of rated areas, not a forecast of what will happen on a given night.</p>`)}`,
});

const does = sec({
  id: 'does',
  kick: 'What Tsamaya does about it',
  title: 'It checks the hour, then offers a way round',
  inner: prose(
    ul([
      'Every route option is scored against the ratings for the time you are driving, not an average. A road that carries no penalty at midday can sit in the top band after 19:30.',
      'The route card shows Fastest, Balanced and Lower-risk, each graded A to E, and says what the route passes. When there is no sensible way round, it says so.',
      'It warns when a trip will arrive after dark, and when time is tight, how soon to leave to arrive in daylight.',
      'On the drive, the screen edge takes the colour of the area you are in, and you hear a heads-up when you enter a higher-risk area, and as you approach a reported hijacking hotspot.',
    ]),
  ),
});

const steps = sec({
  id: 'steps',
  kick: 'Before you leave',
  title: 'A short routine for a late trip',
  inner: prose(
    ul([
      'Look at the route card for the hour you will actually be on the road, and compare the three options.',
      'Check the closures and notices for your metro: protests and blockades are picked up each morning.',
      'Add an emergency contact in Settings, so the SOS button can text them your location and a live link.',
      'Share the trip with someone who will watch it. They need no app.',
      'Download the offline map for the area if the signal is unreliable.',
    ]),
    `<p>Tsamaya cuts your exposure to areas with a history of vehicle crime. It cannot make a drive safe, and lower risk is not no risk. Use it as better information, and keep your own judgement about where and when to stop.</p>`,
  ),
});

const faqs = [F.night, F.longer, F.sos, F.share, F.guarantee];

export default topicPage({
  slug: 'night-driving-gauteng.html',
  title: 'Driving at night in Gauteng',
  description: `How Tsamaya handles night driving in Gauteng: three sets of ratings by hour, ${num(gauteng.night)} high-risk rated areas at night against ${num(gauteng.day)} by day, after-dark warnings and lower-risk routes.`,
  meta: 'Gauteng · after dark',
  h1: 'Driving at night in Gauteng.',
  lead: 'Johannesburg, Pretoria, Ekurhuleni and the West Rand are rated differently by hour. Here is what changes after dark, what Tsamaya does about it, and what it cannot do.',
  sections: [why, does, steps],
  faqs,
  links: [['Johannesburg', 'johannesburg.html'], ['Pretoria', 'pretoria.html'], ['Ekurhuleni', 'ekurhuleni.html'], ['West Rand', 'west-rand.html'], ['Live trip sharing', 'live-trip-sharing.html']],
  ctaTitle: 'Check the hour before you leave.',
});
