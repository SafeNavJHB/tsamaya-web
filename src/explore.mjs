// explore.mjs: the "Explore the metros" section (BUILD_PLAN section 5.1),
// shared by the home page (its chapter 4, drawn by the story's scene) and the
// coverage page (with a scene of its own, inside the section).
//
// Without JavaScript it is a list of the metros, each a link to its page. With
// it (public/js/explore.js) the rows become buttons that light, pick and fly to
// a metro on the map: the 3D scene when it is live (public/js/scene/
// explore.js), an SVG map in the static tier, both drawn from data/geo.json.
// The card's figures come from the rows' data attributes, written here from the
// live data. Nothing finer than a whole metro is on this map: pillar height is
// rated areas (coverage), the rings are whole-metro high-risk totals.
import { stats, fmt } from '../site.config.mjs';
import { siteData } from './sitedata.mjs';
import { metrosBySize } from './poster.mjs';

// The metros too close together to pick apart on the national map: pointing at
// the area names them together, and a click flies to a regional view where
// each is easy to pick. A layout fact, not data.
export const GAUTENG = ['johannesburg', 'pretoria', 'ekurhuleni', 'west_rand', 'rustenburg', 'pilanesberg', 'secunda'];

// kick: the small label over the heading. canvas: the section brings its own
// scene (the coverage page); the home page draws it in the story's scene.
// h: the heading's level ('h1' where the section opens its page). lede: a line
// ahead of the instructions.
//
// The card is written filled with the first metro's figures, the ones the
// script shows first, so its height never changes when the script takes over.
export function exploreSection({ kick, canvas = false, h = 'h2', lede = '' }) {
  const bands = siteData().bands, metros = metrosBySize(), n = stats.totals.metros, m0 = metros[0];
  const rows = metros.map((m) => `<li data-k="${m.key}" data-p="${m.province}" data-z="${m.zones}" data-r="${bands.map((b) => m.red[b.key]).join(' ')}"${GAUTENG.includes(m.key) ? ' data-gt' : ''}><a href="${m.slug}.html"><span>${m.name}</span><span class="num">${fmt(m.zones)}<span class="sr"> rated areas</span></span></a></li>`).join('\n          ');
  return `
<section class="ex${canvas ? ' ex-page' : ''}" id="explore" aria-labelledby="ex-h">${canvas ? '\n  <div class="ex-scene scene-stage" aria-hidden="true"><canvas class="ex-gl"></canvas></div>' : ''}
  <div class="ex-in wrap">
    <div class="ex-head">
      <p class="kick hud">${kick}</p>
      <${h} class="ch-h" id="ex-h" data-split>Explore the ${n} metros</${h}>
      <p class="ch-p">${lede ? lede + ' ' : ''}<span class="ex-js">Point at a metro to light it up, or pick one to fly in.</span><span class="ex-nojs">Each metro has its own page, with its figures for every time band.</span></p>
      <div class="ex-bands ex-js" role="group" aria-label="Time band the rings show">${bands.map((b, i) => `<button class="exb hud" type="button" data-b="${i}" aria-pressed="false">${b.name}</button>`).join('')}</div>
      <p class="ex-cap hud ex-js">Pillar height shows how many rated areas a metro has. The ring shows how many are rated high risk in the band you pick. Nothing here is finer than a whole metro.</p>
    </div>
    <div class="ex-stage" id="ex-stage">
      <figure class="ex-map" aria-hidden="true"></figure>
      <button class="ex-back hud" type="button" id="ex-back" hidden><span aria-hidden="true">&larr;</span> Back to all ${n}</button>
      <p class="ex-hint hud" id="ex-hint" aria-hidden="true">Gauteng and surrounds: ${metros.filter((m) => GAUTENG.includes(m.key)).length} metros</p>${canvas ? `
      <button class="ex-pause motion-toggle hud" type="button" aria-pressed="false" data-motion-toggle><span class="pi" aria-hidden="true"></span><span class="motion-label">Pause motion</span></button>` : ''}
    </div>
    <div class="ex-body">
      <ul class="ex-list" id="ex-list" aria-label="The ${n} metros" style="--rows:${Math.ceil(metros.length / 2)}">
          ${rows}
      </ul>
      <p class="sr" id="ex-live" aria-live="polite"></p>
    </div>
    <div class="ex-card" id="ex-card" role="group" aria-labelledby="exc-n">
      <p class="exc-h"><b id="exc-n">${m0.name}</b><span class="hud" id="exc-p">${m0.province}</span></p>
      <p class="exc-z"><b class="num" id="exc-z">${fmt(m0.zones)}</b> rated areas</p>
      <p class="exc-k hud">Rated high risk, by time band</p>
      <ul class="exc-rows" id="exc-rows">
        ${bands.map((b) => `<li><span class="hud">${b.name}<em></em></span><i><s style="transform:scaleX(${(m0.red[b.key] / m0.zones).toFixed(3)})"></s></i><b class="num">${fmt(m0.red[b.key])}</b></li>`).join('\n        ')}
      </ul>
      <p class="exc-sc hud">Bar scale: all <span id="exc-s">${fmt(m0.zones)}</span> rated areas</p>
      <p class="exc-l"><a id="exc-a" href="${m0.slug}.html">Open the ${m0.name} page</a></p>
    </div>
  </div>
</section>`;
}
