// night.mjs: the figures and sections the night-driving pages share.
//
// There are three night pages (Gauteng, Cape Town, Durban), the regions people
// search for most. They do not need one page per metro: every one of the 17
// metros is rated by hour in the same way, so each night page carries the same
// table of all of them (allMetrosNight) and says so. Every figure is read from
// stats.json at build time: the count of rated areas in the top band per time
// band. EDITORIAL RULE: roads and metros only, never a suburb; never the word
// "safe" as a promise.
import { stats, fmt } from '../site.config.mjs';
import { metros } from './data/metros.mjs';
import { sec } from './kit.mjs';
import { prose, ul, table } from './topic.mjs';

const regionOf = Object.fromEntries(metros.map((m) => [m.key, m.region]));

/** The metros of one province, with their summed day, evening and night counts. */
export function region(name) {
  const rows = stats.metros.filter((m) => regionOf[m.key] === name);
  const sum = (t) => rows.reduce((n, m) => n + m.byTime[t].red, 0);
  return { rows, day: sum('day'), evening: sum('evening'), night: sum('night'), total: rows.reduce((n, m) => n + m.zones, 0) };
}

export const metroByKey = Object.fromEntries(stats.metros.map((m) => [m.key, m]));

/** The by-hour table for a set of metros, with a total row when there is more than one. */
export function nightTable(label, r, totalLabel) {
  return table({
    label,
    head: ['Metro', 'Rated areas', 'High risk, day', 'High risk, evening', 'High risk, night'],
    rows: [
      ...r.rows.map((m) => [`<a href="${m.slug}.html">${m.name}</a>`, fmt(m.zones), fmt(m.byTime.day.red), fmt(m.byTime.evening.red), fmt(m.byTime.night.red)]),
      ...(r.rows.length > 1 ? [[totalLabel, fmt(r.total), fmt(r.day), fmt(r.evening), fmt(r.night)]] : []),
    ],
  });
}

export const BANDS_LEAD = 'Tsamaya rates every area three times: daytime 05:00 to 17:30, evening 17:30 to 19:30 and night 19:30 to 05:00. It uses the rating for the hour you drive.';

/** What Tsamaya does after dark: the same in every metro. */
export const doesSec = sec({
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

/** A short routine before a late trip: the same in every metro. */
export const stepsSec = sec({
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

const all = { rows: [...stats.metros].sort((a, b) => b.zones - a.zones) };
all.total = all.rows.reduce((n, m) => n + m.zones, 0);
for (const t of ['day', 'evening', 'night']) all[t] = all.rows.reduce((n, m) => n + m.byTime[t].red, 0);

/** Every metro, so a driver anywhere in the coverage sees that night ratings apply there too. */
export const allMetrosNight = sec({
  id: 'all-metros',
  kick: 'Every metro',
  title: `Night ratings in all ${stats.totals.metros} metros`,
  lead: `This is not only for Gauteng, Cape Town and Durban. Every area in every metro Tsamaya covers has its own daytime, evening and night rating, and the app uses the one for the hour you drive. Each metro's page has its full figures.`,
  inner: `${nightTable('High-risk rated areas by time of day in every metro', all, 'All metros')}
    ${prose(`<p>Across all ${stats.totals.metros} metros, ${fmt(all.night)} of ${fmt(all.total)} rated areas are high risk at night, against ${fmt(all.day)} in the day. These are counts of rated areas, not a forecast of what will happen on a given night.</p>`)}`,
});

/** The three night pages, for each page's related links. */
export const NIGHT_PAGES = [
  ['Driving at night in Gauteng', 'night-driving-gauteng.html'],
  ['Driving at night in Cape Town', 'night-driving-cape-town.html'],
  ['Driving at night in Durban', 'night-driving-durban.html'],
];
