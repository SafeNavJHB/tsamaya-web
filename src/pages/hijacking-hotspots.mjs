import { readFileSync } from 'node:fs';
import { stats } from '../../site.config.mjs';
import { metros } from '../data/metros.mjs';
import { F } from '../faqs.mjs';
import { sec } from '../kit.mjs';
import { topicPage, prose, ul, table } from '../topic.mjs';

// Hijacking and smash-and-grab hotspots (added 2026-10-01). The data is the same
// list the metro pages draw (src/data/hotspots.json, copied from the app by
// scripts/sync-hotspots.mjs), so the counts here equal the metro pages' counts.
// EDITORIAL RULE as everywhere on this site: roads and regions only. This page
// shows a count per metro and never a place name, and it says hotspots are
// awareness, never a routing input.

const data = JSON.parse(readFileSync(new URL('../data/hotspots.json', import.meta.url), 'utf8'));
const counts = new Map();
for (const h of data.hotspots) counts.set(h.city, (counts.get(h.city) || 0) + 1);
const total = data.hotspots.length;
const rows = metros
  .filter((m) => counts.has(m.key))
  .sort((a, b) => counts.get(b.key) - counts.get(a.key))
  .map((m) => [`<a href="${m.slug}.html">${m.name}</a>`, String(counts.get(m.key))]);

const what = sec({
  id: 'what',
  kick: 'What a hotspot is',
  title: 'Reported spots, marked on the map',
  lead: 'Off-ramps, intersections and stretches of road where hijackings and smash-and-grabs have been reported.',
  inner: prose(
    `<p>${data.attribution} Each hotspot is labelled by its road: Tsamaya names roads, never the neighbourhoods around them.</p>`,
    `<p>There are ${total} on the map today, in ${rows.length} metros.</p>`,
  ),
});

const does = sec({
  id: 'does',
  kick: 'What Tsamaya does',
  title: 'A marker and a spoken heads-up',
  inner: prose(
    ul([
      'Hotspots show on the phone map, the car map and the CarPlay mini map. Settings has switches for them.',
      'As you approach one, Tsamaya says so. The same hotspot is not announced again after a reroute.',
      'It works without a route. In free drive, Tsamaya warns about hotspots coming up on the road you are driving.',
      'A hotspot is awareness only. It never changes your route and never feeds a risk rating or a grade. Routes are planned from the rated areas and checked roads, which is a different layer.',
    ]),
  ),
});

const where = sec({
  id: 'where',
  kick: 'By metro',
  title: 'How many reported hotspots each metro has',
  lead: 'These are counts of reported spots, not a measure of how risky a metro is. A metro with more ratings or more reporting will show more.',
  inner: table({ label: 'Reported hotspots by metro', head: ['Metro', 'Reported hotspots'], rows }),
});

const limits = sec({
  id: 'limits',
  kick: 'Limits',
  title: 'Not a complete list',
  inner: prose(
    `<p>The list is compiled from public reporting and is not complete, so a stretch with no marker is not a stretch without risk. A hotspot says something has been reported at a spot. It does not say it will happen to you, or that it will not happen elsewhere. Lower risk is not no risk.</p>`,
  ),
});

const faqs = [F.hotspots, F.cameras, {
  q: 'Does a hotspot change my route?',
  a: 'No. Hotspots are awareness only. Your route is planned from the rated areas and checked roads for the hour you drive. A hotspot gives you a marker and a heads-up as you approach, so you can pay attention at that spot.',
}, F.data, F.guarantee];

export default topicPage({
  slug: 'hijacking-hotspots.html',
  title: 'Hijacking hotspots',
  description: `How Tsamaya shows ${total} reported hijacking and smash-and-grab hotspots on the map with a spoken heads-up, what they are, what they are not, and where they come from.`,
  meta: 'Hijacking · smash-and-grab',
  h1: 'Hijacking and smash-and-grab hotspots.',
  lead: 'Tsamaya marks reported hijacking and smash-and-grab spots on the map and tells you as you approach one. It is awareness only and never changes your route.',
  sections: [what, does, where, limits],
  faqs,
  links: [['Features', 'features.html'], ['Speed cameras', 'speed-cameras.html'], ['Coverage', 'coverage.html'], ['How the ratings work', 'how-it-works.html']],
});
