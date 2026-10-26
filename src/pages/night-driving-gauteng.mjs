import { fmt } from '../../site.config.mjs';
import { F } from '../faqs.mjs';
import { sec } from '../kit.mjs';
import { topicPage, prose } from '../topic.mjs';
import { region, nightTable, BANDS_LEAD, doesSec, stepsSec, allMetrosNight, NIGHT_PAGES } from '../night.mjs';

// Driving at night in Gauteng (added 2026-10-01). A problem-first page for the
// searches people actually type ("is it safe to drive in Johannesburg at night").
// The shared sections and the all-metros table live in src/night.mjs, which the
// Cape Town and Durban pages read too. EDITORIAL RULE: roads and metros only,
// never a suburb; never the word "safe" as a promise; the page says plainly that
// Tsamaya cannot make a drive safe.

const g = region('Gauteng');

const why = sec({
  id: 'why',
  kick: 'Why night is different',
  title: 'The same roads carry different ratings after dark',
  lead: BANDS_LEAD,
  inner: `${nightTable('High-risk rated areas by time of day in the Gauteng metros', g, 'All four')}
    ${prose(`<p>Across the four Gauteng metros, ${fmt(g.night)} of ${fmt(g.total)} rated areas are high risk at night, against ${fmt(g.day)} in the day. These are counts of rated areas, not a forecast of what will happen on a given night.</p>`)}`,
});

const faqs = [F.night, F.times, F.longer, F.sos, F.share, F.guarantee];

export default topicPage({
  slug: 'night-driving-gauteng.html',
  title: 'Driving at night in Gauteng',
  description: `How Tsamaya handles night driving in Gauteng: three sets of ratings by hour, ${fmt(g.night)} high-risk rated areas at night against ${fmt(g.day)} by day, after-dark warnings and lower-risk routes.`,
  meta: 'Gauteng · after dark',
  h1: 'Driving at night in Gauteng.',
  lead: 'Johannesburg, Pretoria, Ekurhuleni and the West Rand are rated differently by hour. Here is what changes after dark, what Tsamaya does about it, and what it cannot do.',
  sections: [why, doesSec, stepsSec, allMetrosNight],
  faqs,
  links: [['Johannesburg', 'johannesburg.html'], ['Pretoria', 'pretoria.html'], ['Ekurhuleni', 'ekurhuleni.html'], ['West Rand', 'west-rand.html'], ...NIGHT_PAGES.slice(1), ['Live trip sharing', 'live-trip-sharing.html']],
  ctaTitle: 'Check the hour before you leave.',
});
