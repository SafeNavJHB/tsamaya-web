import { siteData } from '../sitedata.mjs';
import { posterDefs, planSvg } from '../poster.mjs';
import { pageHead, sec, getSec, linkQ, M } from '../kit.mjs';

// How it works: the six real steps from destination to lower-risk route, read
// beside the illustrative city. With the scene live (public/js/how.js), each
// step is a camera stop: the fastest route draws, a pulse runs along it testing
// the rated cells, the lower-risk route bends round them, and the car drives
// it. Everything moves with the scroll only. Without the scene (reduced motion,
// no WebGL 2, no JavaScript) the same city is drawn flat as the SVG plan.
//
// The city is procedural, like the home page's: no real place, no real ratings.

const STEPS = [
  ['Fetch the fastest route', 'We start with an ordinary Mapbox route, the same quick line any map app would hand you. That is the baseline everything else is tested against.'],
  ['Test it against the rated areas', 'The route is sampled along its length and tested against every rated area, using the ratings for this hour. Only high-risk (red) and elevated (orange) areas count. Yellow is shown on the map but never forces a detour.'],
  ['Already on a checked road?', 'Where the route already runs along a road we have checked through an area, that counts as passing through, and no detour is needed. Checked roads are the local knowledge that stops the app over-reacting.'],
  ['Find a way round', 'For the areas the route still runs through, Tsamaya picks a nearby checked road and adds a few waypoints, nudging the route around the area rather than through it.'],
  ['Re-route, then sanity-check', 'The route is fetched again through those points. A detour is only offered if it cuts your exposure, and one that adds too much distance is thrown out. When there is no good alternative, you get the normal route with the risky stretches marked. It will not invent a detour to look busy.'],
  ['Drive it', 'Follow it in the app, turn by turn with voice, on CarPlay or Android Auto. Or hand it to Google Maps with the detour points already in place, so it follows the same line.'],
];

const steps = `
<section class="sec hw" id="steps" aria-labelledby="steps-h">
  <div class="wrap hw-in">
    <header class="sec-h hw-h">
      <p class="kick hud" data-reveal>The six steps</p>
      <h2 class="h2" id="steps-h" data-split>From destination to lower-risk route</h2>
    </header>
    <div class="hw-stage scheme-dark" aria-hidden="true">
      <div class="hw-scene scene-stage">
        <div class="scene-poster hw-poster">${planSvg(2, { routes: true, cellsId: 'hw-cells' })}</div>
        <canvas class="hw-gl"></canvas>
      </div>
      <p class="hw-tag" data-t="a">Start</p>
      <p class="hw-tag" data-t="b">Destination</p>
      <p class="hud hw-cap">Illustrative city${M}not a real place</p>
    </div>
    <ol class="hw-steps">
      ${STEPS.map(([t, p], i) => `<li class="hw-step" data-step="${i}"><span class="hud">0${i + 1}</span><div><h3>${t}</h3><p>${p}</p></div></li>`).join('\n      ')}
    </ol>
  </div>
</section>`;

const bands = siteData().bands;
const WHY = {
  day: 'Most areas sit lower in the daytime. Plenty of roads that carry a penalty at night carry none at midday.',
  evening: 'The two hours when the day\'s ratings give way to the night\'s: rush hour, and the light going.',
  night: 'Ratings climb after dark. A dark intersection is a different proposition from a lit one.',
};
const hours = sec({
  id: 'hours',
  kick: 'Rated by the hour',
  title: 'Three ratings for every area',
  lead: 'Every rated area carries a rating for each part of the day, and the app reads the clock: there is no switch to get wrong.',
  inner: `
    <dl class="feat-grid feat-3" data-reveal>
      ${bands.map((b) => `<div><dt class="hud">${b.name}${M}${b.from} to ${b.to}</dt><dd>${WHY[b.key] || ''}</dd></div>`).join('\n      ')}
    </dl>
    <p class="fine" data-reveal>Yellow means caution: it is shown on the map but never forces a detour. The lowest band means an area was checked and carries no routing penalty, which is different from an area we have no data for.</p>`,
});

export default {
  slug: 'how-it-works.html',
  title: 'How it works',
  description:
    'How Tsamaya plans a lower-risk route: fetch the fastest route, test it against every rated area for this hour, prefer checked roads, find a way round, and throw out any detour that costs too much.',
  heroClass: 'sn page-how',
  hud: false,
  scripts: ['js/how.js'],
  body: [
    posterDefs(),
    pageHead({
      meta: 'How it works',
      title: 'Risk, weighed before you drive.',
      lead: 'Tsamaya puts a risk check on top of ordinary turn-by-turn routing. Here is the whole thing, from the moment you pick a destination to the route on your screen.',
    }),
    steps,
    hours,
    getSec({ title: 'See it on your own roads.' }),
    sec({
      id: 'more',
      cls: 'tail',
      kick: 'Go deeper',
      title: 'The screens, and the machinery',
      lead: 'Walk through the real app, or read the rules that decide a detour.',
      inner: `<p class="more" data-reveal>${linkQ('See it in action', 'demo.html')}${linkQ('Technical details', 'technical.html')}</p>`,
    }),
  ].join('\n'),
};
