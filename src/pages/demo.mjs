import { readFileSync } from 'node:fs';
import { picture } from '../components.mjs';
import { altFor, shotSize } from '../shots.mjs';
import { pageHead, sec, getSec, linkQ, M } from '../kit.mjs';

// "See it": the real app, four screens from the daytime set (src/shots.mjs),
// each in a flat phone frame with numbered markers on the parts that matter and
// the same numbers in a list beside it. Pointing at a list item lights its part
// of the screen (CSS :has, no script); the numbers carry the same information
// for touch and the keyboard, so nothing is hover-only.
//
// The daytime set replaces the older night captures here: those showed risk
// colours over named suburbs, which the site never does. On the home screen and
// the route result the risk overlay is switched off, and no caption names a
// suburb near a risk figure. The route figures come from src/data/route-card.json,
// the same card the home page's first chapter tells.
const card = JSON.parse(readFileSync(new URL('../data/route-card.json', import.meta.url), 'utf8'));
const std = card.standard, low = card.lower;
const km = (n) => n.toFixed(1);

// hot: [x, y, w, h] as fractions of the screen, measured on the captures
const STEPS = [
  {
    shot: 'home-day',
    kick: 'The home screen',
    title: 'Open it, and the time of day is already set',
    text: 'The map opens on your metro. The chip at the top says which one and which part of the day the ratings are for: the app reads the clock, and there is no switch to get wrong.',
    notes: [
      ['The time band', 'Johannesburg, Day. After 17:30 it reads Evening, after 19:30 Night, and the ratings change with it.', [0.03, 0.083, 0.47, 0.045]],
      ['The overlay', 'The eye shows or hides every rated area and road, coloured by risk. It is off here: a daytime drive through Rosebank.', [0.62, 0.083, 0.34, 0.045]],
      ['Where to?', 'Search for a place, tap one of your shortcuts, or press and hold the map to drop a pin.', [0.03, 0.142, 0.94, 0.058]],
      ['Shortcuts', 'Home, work and the places you save, one tap away.', [0.03, 0.207, 0.94, 0.056]],
    ],
  },
  {
    shot: 'route-card-day',
    kick: 'Setting the trip',
    title: 'From, to, and Go',
    text: 'Your start defaults to where you are. The destination is whatever you searched, tapped or pinned.',
    notes: [
      ['From', 'My location, unless you choose somewhere else to start.', [0.06, 0.148, 0.88, 0.054]],
      ['Swap', 'Turns the trip round in one tap.', [0.83, 0.203, 0.13, 0.045]],
      ['To', 'Melrose Arch here. The cross clears it.', [0.05, 0.25, 0.91, 0.05]],
      ['Add a stop', 'A trip through a few places is planned leg by leg, so every leg gets the same risk check.', [0.05, 0.3, 0.26, 0.034]],
      ['Go', 'Plans the routes and compares them.', [0.06, 0.335, 0.88, 0.058]],
    ],
  },
  {
    shot: 'route-result-detour-day',
    kick: 'Comparing the routes',
    title: `${low.extraKm} km further, ${low.minutesQuicker} minutes quicker`,
    text: `A morning trip across the north of Johannesburg. The standard route (grade ${std.grade}, ${std.minutes} min, ${km(std.km)} km) passes ${std.highRisk} high-risk areas. The lower-risk one goes the long way round on the freeway: grade ${low.grade}, ${low.minutes} min, ${km(low.km)} km, and in that morning's traffic it was also the quicker one.`,
    notes: [
      ['The routes', 'Blue is the option picked, grey the others. The overlay is off, so the map names no area as risky.', [0.0, 0.06, 1, 0.43]],
      ['What it still passes', `The chosen route passes ${low.mediumRisk} medium-risk area for ${low.mediumRiskKm} km. When risk cannot be avoided, the card says so.`, [0.03, 0.535, 0.94, 0.056]],
      ['The grade and the trade', `${low.label}: grade ${low.grade}, ${low.lessRiskPct}% less risk than the standard route, ${low.minutesQuicker} minutes quicker and ${low.extraKm} km further.`, [0.03, 0.603, 0.94, 0.112]],
      ['The alternatives', `Standard, grade ${std.grade}: ${std.highRisk} high-risk areas for ${std.highRiskKm} km. Every option is graded A to E, and any high-risk area floors a route at D.`, [0.03, 0.718, 0.94, 0.17]],
      ['Start', 'Drive it in the app, with voice and CarPlay or Android Auto.', [0.03, 0.9, 0.94, 0.062]],
    ],
  },
  {
    shot: 'navigation-day',
    kick: 'Driving it',
    title: 'Turn by turn, rated as you go',
    text: 'The next turn and its lanes at the top, your speed against the limit, and the road you are on, named and rated for the time of day.',
    notes: [
      ['The next turn', 'Left onto the M20 in 280 m, with the lanes to be in underneath.', [0.02, 0.078, 0.96, 0.142]],
      ['Speed and limit', '43 in a 60. A gentle chime if you go over.', [0.02, 0.225, 0.24, 0.092]],
      ['The road you are on', 'Oxford Road, lower risk. The route line is coloured the same way, road by road.', [0.31, 0.742, 0.38, 0.09]],
      ['Voice, reports and SOS', 'Voice on or off, a flag to report a corner we got wrong, and the SOS button.', [0.84, 0.228, 0.15, 0.32]],
      ['Time left', '8 minutes and 3.8 km to go.', [0.0, 0.838, 1, 0.162]],
    ],
  },
];

const pct = (v) => `${(v * 100).toFixed(1)}%`;
function step(s, i) {
  const id = `s${i + 1}`;
  return `
<section class="sec see" id="${id}" aria-labelledby="${id}-h">
  <div class="wrap see-in${i % 2 ? ' flip' : ''}">
    <figure class="see-f" data-reveal>
      <div class="see-phone">
        ${picture({ name: s.shot, alt: altFor(s.shot), width: shotSize.width, height: shotSize.height, sizes: '(max-width: 760px) 80vw, 360px', loading: i === 0 ? 'eager' : 'lazy' })}
        <div class="see-hots" aria-hidden="true">
          ${s.notes.map((n, k) => `<span class="hot" data-k="${k + 1}" style="left:${pct(n[2][0])};top:${pct(n[2][1])};width:${pct(n[2][2])};height:${pct(n[2][3])}"><b>${k + 1}</b></span>`).join('\n          ')}
        </div>
      </div>
    </figure>
    <div class="see-t">
      <p class="kick hud" data-reveal>0${i + 1}${M}${s.kick}</p>
      <h2 class="h2" id="${id}-h" data-split>${s.title}</h2>
      <p class="lead" data-reveal>${s.text}</p>
      <ol class="see-n" data-reveal>
        ${s.notes.map((n, k) => `<li data-k="${k + 1}"><span class="hud">${k + 1}</span><div><h3>${n[0]}</h3><p>${n[1]}</p></div></li>`).join('\n        ')}
      </ol>
    </div>
  </div>
</section>`;
}

const honest = sec({
  id: 'honest',
  cls: 'tail',
  kick: 'An honest note',
  title: 'Every screen here is the real app.',
  lead: `Captured on ${card.captured} from a release build on an iPhone simulator, against the live database: real map tiles, real ratings, real search and real routing. They are daytime captures, with the risk overlay switched off where it would have coloured the streets where people live. Routes weigh known risk. They are not a guarantee of safety, so stay aware on the road regardless.`,
  inner: `<p class="more" data-reveal>${linkQ('How the routing decides', 'how-it-works.html')}${linkQ('Coverage by metro', 'coverage.html')}</p>`,
});

export default {
  slug: 'demo.html',
  title: 'See it in action',
  description:
    'A walkthrough of the Tsamaya app on real screens: the home screen, setting a trip, comparing a lower-risk route against the standard one, and driving it.',
  heroClass: 'sn page-see',
  hud: false,
  body: [
    pageHead({
      meta: `See it in action${M}the real app`,
      title: 'Two taps from "Where to?" to a lower-risk route.',
      lead: 'A walk through the real app: set a destination, compare the routes, and drive the one that keeps you out of the high-risk areas.',
    }),
    STEPS.map(step).join('\n'),
    getSec({ title: 'Try it yourself.' }),
    honest,
  ].join('\n'),
};
