import { F } from '../faqs.mjs';
import { sec } from '../kit.mjs';
import { topicPage, prose, ul, grid } from '../topic.mjs';

// Protests, closures, gated roads and the Police / Roadblock notices (added
// 2026-10-01). Facts: the protest watch and closed-road rules are in the app's
// CLAUDE.md and the changelog entries of 1, 6, 9, 14 and 16 August and 23
// September 2026; the Fastest option still drives a closure and marks it
// (facts.mjs, Closures). Never claims a closure list is complete.

const watch = sec({
  id: 'watch',
  kick: 'Protests and closures',
  title: 'Found each morning, routed around while they last',
  lead: 'Roads close for reasons a map does not know about until someone reports them. Tsamaya looks for them every day.',
  inner: prose(
    `<p>Each morning Tsamaya searches the news for planned protests, strikes and road blockades in the metros it covers. A closure it can pin to a real road becomes a temporary red-and-white striped line on the map, and the Balanced and Lower-risk routes go around it for as long as it lasts, where there is a way round.</p>`,
    ul([
      'It says why. A marathon or a parade reads as a planned closure, roadworks as roadworks, and only actual unrest gets the red warning. You are routed around all of them the same way.',
      'A closure announced days ahead stays dormant until its start time and clears itself when the road reopens.',
      'Closure alerts are opt-in and go only to the metro they affect, within about 50 km of where you are. Settings, Alerts, Road closures lists every current and upcoming one.',
      'A road the search cannot pin down is held for a person to review. Tsamaya does not guess where a street is when the same name exists elsewhere in the city.',
    ]),
  ),
});

const closed = sec({
  id: 'closed',
  kick: 'Closed roads',
  title: 'Gated, barricaded or washed away',
  lead: 'Some roads cannot be driven at all, and map data is often years behind.',
  inner: prose(
    `<p>Tsamaya keeps its own record of closed roads and plans around them instead of treating them as a danger area. They are drawn greyed out with a hatch, so they read as "not a road you can use" and never as a risk colour. A closed road is not counted as a safety warning.</p>`,
    `<p>If a closure sits between you and your destination, you still get a route, with the road named so the barrier is not a surprise. The Fastest option may still drive a closure and mark it; the Balanced and Lower-risk options go around it where a way round exists.</p>`,
  ),
});

const notices = sec({
  id: 'notices',
  kick: 'Driver notices',
  title: 'Police and roadblocks, from drivers nearby',
  inner: prose(
    `<p>While driving, tap <strong>Police</strong> or <strong>Roadblock</strong> and every driver nearby sees it on the map for the next hour. On a drive, Tsamaya says "Police reported ahead" as you approach one on your route, on the phone and in the car. You can also say it: tap Report, then Speak.</p>`,
    `<p>These are notices only. They never change your route or the risk ratings. A roadblock report is also sent to the review team, because a roadblock can be a protest blockade.</p>`,
  ),
});

const limits = sec({
  id: 'limits',
  kick: 'Limits',
  title: 'What Tsamaya cannot know',
  inner: prose(
    `<p>Tsamaya only knows what has been reported. A blockade that nobody has written about, or one that starts after the morning search, can be missed until a driver reports it. If you can see a problem on the road, trust your eyes over the app, and check local news and traffic services for the hour you are driving.</p>`,
    `<p>Lower risk is not no risk, and no route is safe.</p>`,
  ),
});

const faqs = [F.protests, F.notices, F.voice, {
  q: 'Does the Fastest option avoid a closure?',
  a: 'Not always. The Fastest option may still drive a closed road and mark it. The Balanced and Lower-risk options go around a closure where a way round exists, and if none exists you still get a route with the closed road named.',
}, F.guarantee];

export default topicPage({
  slug: 'closures-and-protests.html',
  title: 'Protests and road closures',
  description: 'How Tsamaya finds protests, strikes, blockades and road closures each morning and routes around them, plus closed roads and Police and Roadblock notices from drivers.',
  meta: `Closures${' · '}protests${' · '}roadblocks`,
  h1: 'Protests, closures and roadblocks, routed around.',
  lead: 'Tsamaya searches the news every morning for protests, strikes and blockades in the metros it maps, keeps its own record of closed roads, and shows police and roadblock notices from drivers nearby.',
  sections: [watch, closed, notices, limits],
  faqs,
  links: [['Features', 'features.html'], ['Speed cameras', 'speed-cameras.html'], ['How routing works', 'how-it-works.html'], ['Every update', 'updates.html']],
});
