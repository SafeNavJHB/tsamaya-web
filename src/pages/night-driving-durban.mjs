import { fmt } from '../../site.config.mjs';
import { F } from '../faqs.mjs';
import { sec } from '../kit.mjs';
import { topicPage, prose } from '../topic.mjs';
import { region, metroByKey, nightTable, BANDS_LEAD, doesSec, stepsSec, allMetrosNight, NIGHT_PAGES } from '../night.mjs';

// Driving at night in Durban (added 2026-10-26, after the SEO audit asked for
// night pages beyond Gauteng). Same shape and rules as night-driving-gauteng.mjs:
// figures from stats.json, roads and metros only, never a suburb, never "safe"
// as a promise. The table covers the KwaZulu-Natal metros; allMetrosNight shows that
// every other metro is rated by hour too, so no metro needs a page of its own.

const r = region('KwaZulu-Natal');
const m = metroByKey['durban'];

const why = sec({
  id: 'why',
  kick: 'Why night is different',
  title: 'The same roads carry different ratings after dark',
  lead: BANDS_LEAD,
  inner: `${nightTable('High-risk rated areas by time of day in the KwaZulu-Natal metros', r, 'Both')}
    ${prose(`<p>In Durban, ${fmt(m.byTime.night.red)} of ${fmt(m.zones)} rated areas are high risk at night, against ${fmt(m.byTime.day.red)} in the day. These are counts of rated areas, not a forecast of what will happen on a given night.</p>`)}`,
});

const nightFaq = {
  q: 'How does Tsamaya handle driving at night in Durban?',
  a: `Ratings rise after dark: in Durban ${fmt(m.byTime.day.red)} rated areas are high risk in the day and ${fmt(m.byTime.night.red)} at night. Tsamaya uses the rating for the hour you drive, warns you when a trip will arrive after dark, and offers a lower-risk route when one exists. It cannot make any route safe, and lower risk is not no risk.`,
};

const faqs = [nightFaq, F.times, F.longer, F.sos, F.share, F.guarantee];

export default topicPage({
  slug: 'night-driving-durban.html',
  title: 'Driving at night in Durban',
  description: `How Tsamaya handles night driving in Durban: three sets of ratings by hour, ${fmt(m.byTime.night.red)} high-risk rated areas at night against ${fmt(m.byTime.day.red)} by day, after-dark warnings and lower-risk routes.`,
  meta: 'KwaZulu-Natal · after dark',
  h1: 'Driving at night in Durban.',
  lead: 'Durban and Pietermaritzburg are rated differently by hour. Here is what changes after dark, what Tsamaya does about it, and what it cannot do.',
  sections: [why, doesSec, stepsSec, allMetrosNight],
  faqs,
  links: [['Durban', 'durban.html'], ['Pietermaritzburg', 'pietermaritzburg.html'], ...NIGHT_PAGES.filter(([, h]) => h !== 'night-driving-durban.html'), ['Live trip sharing', 'live-trip-sharing.html']],
  ctaTitle: 'Check the hour before you leave.',
});
