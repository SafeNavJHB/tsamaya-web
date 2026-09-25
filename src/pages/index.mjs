// index.mjs: the home page, in the Sensor design (proposals/redesign-2026-09/
// BUILD_PLAN.md, Phase 1; ported from concept-4-sensor.html).
//
// The whole page is real HTML and reads top to bottom without JavaScript: the
// hero over a static poster of the illustrative city, three chapters that each
// carry an SVG figure and their end-state text, then the ordinary sections.
// public/js/home.js adds the band chips, the FAQ and the route spotlight in every
// tier, and at idle loads the 3D scene, which pins the chapters over one fixed
// canvas (public/js/scene/). See the notes at the top of those files.
//
// FIGURES. Nothing is typed by hand. Counts come from src/data/stats.json (via
// site.config.mjs and src/sitedata.mjs), the example trip from
// src/data/route-card.json. The scripts read the figures they animate from this
// HTML, never from their own literals.
import { readFileSync } from 'node:fs';
import { site, stats, fmt } from '../../site.config.mjs';
import { deviceShot } from '../components.mjs';
import { shotSize } from '../shots.mjs';
import { faqNode } from '../seo.mjs';
import { siteData } from '../sitedata.mjs';
import { posterDefs, planSvg, saSvg, tagAnchors, metrosBySize } from '../poster.mjs';
import { exploreSection } from '../explore.mjs';

const card = JSON.parse(readFileSync(new URL('../data/route-card.json', import.meta.url), 'utf8'));
const std = card.standard;
const low = card.lower;
const km = (n) => n.toFixed(1);
const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'];
const word = (n) => WORDS[n] || String(n);
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const data = siteData();
const bands = data.bands.map((b) => ({ ...b, red: data.redByBand[b.key] }));
const metros = metrosBySize();
const top6 = metros.slice(0, 6);
const nMetros = stats.totals.metros;
const zones = fmt(stats.totals.zones);
const M = ' · '; // the HUD's middle-dot separator

const arrow = '<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// The example trip, as the route card words it (src/data/route-card.json).
// No place names: the areas this trip avoids are in named suburbs.
const quicker = low.minutesQuicker;
const fewer = std.highRisk - low.highRisk;
const timeHead = quicker > 0 ? `${word(quicker)} minute${quicker === 1 ? '' : 's'} quicker.` : quicker === 0 ? 'Same time.' : `${word(-quicker)} minute${quicker === -1 ? '' : 's'} longer.`;
const timeLine = quicker > 0 ? `${quicker} minute${quicker === 1 ? '' : 's'} quicker` : quicker === 0 ? 'the same time' : `${-quicker} minute${quicker === -1 ? '' : 's'} longer`;
const stdLine = `grade ${std.grade}, ${std.minutes} min, ${km(std.km)} km`;
const lowLine = `grade ${low.grade}, ${low.minutes} min, ${km(low.km)} km`;
const lowPasses = low.highRisk ? plural(low.highRisk, 'high-risk area', 'high-risk areas') : plural(low.mediumRisk, 'medium-risk area', 'medium-risk areas');
const lowPassesFor = low.highRisk ? lowPasses : `${lowPasses}, for ${low.mediumRiskKm} km`;

/* ---------------------------------------------------------------------------
 * 1. The scene zone: the stage (poster, canvas, callouts), the HUD, the hero
 *    and the three chapters. The chapters pin over the canvas once the scene is
 *    live; before that, and in the static tier, they are ordinary sections.
 * ------------------------------------------------------------------------ */
const anchors = tagAnchors();
// Metro labels beside the six tallest pillars. Which side each sits on is a
// layout choice per metro, so it follows the metro if the order ever changes.
const SIDE = { johannesburg: ' l dn', durban: ' l', pretoria: ' l up' };
const LIFT = { johannesburg: '0.42' }; // anchor height, as a share of the pillar

const stage = `
<div class="scene scene-stage" id="scene" aria-hidden="true">
  <div class="scene-poster poster">
    <div class="poster-plane">
      ${planSvg(0, { routes: true, cellsId: 'poster-cells', attrs: 'viewBox="-56 -56 112 112" preserveAspectRatio="xMidYMid meet"' })}
      <i class="pa" data-pa="hf" style="left:${anchors.hf.left}%;top:${anchors.hf.top}%"></i>
      <i class="pa" data-pa="hl" style="left:${anchors.hl.left}%;top:${anchors.hl.top}%"></i>
    </div>
  </div>
  <canvas id="gl"></canvas>
  <div class="callouts" id="callouts">
    <div class="co co-pt" data-co="a"><span class="co-tag hud">A</span></div>
    <div class="co co-pt" data-co="b"><span class="co-tag hud">B</span></div>
    <div class="co co-wide" data-co="f"><span class="co-tag hud">${std.label}${M}grade ${std.grade}${M}${std.minutes} min${M}${km(std.km)} km${M}${plural(std.highRisk, 'high-risk area', 'high-risk areas')}</span></div>
    <div class="co co-go" data-co="rr"><span class="co-tag hud">Re-routing</span></div>
    <div class="co co-go co-wide" data-co="l"><span class="co-tag hud">${low.label}${M}grade ${low.grade}${M}${low.minutes} min${M}${km(low.km)} km${M}${lowPasses}</span></div>
    ${top6.map((m, i) => `<div class="co co-m${SIDE[m.key] || ''}" data-co="m${i}" data-k="${m.key}"${LIFT[m.key] ? ` data-lift="${LIFT[m.key]}"` : ''}><span class="co-tag hud"><b>${m.name}</b><span class="co-n">${fmt(m.zones)} rated areas</span></span></div>`).join('\n    ')}
  </div>
</div>`;

const chips = bands.map((b, i) => `<button class="bchip" type="button" data-b="${i}" aria-pressed="false"><span>${b.name === 'Daytime' ? 'Day' : b.name}</span></button>`).join('');

const hud = `
<div class="hud-layer" id="hud">
  <span class="hud-frame" aria-hidden="true"></span>
  <p class="hud-c tl hud"><i aria-hidden="true"></i><span>Tsamaya${M}Route model</span></p>
  <div class="hud-c tr hud">
    <p class="hud-now"><span class="live-dot" aria-hidden="true"></span><span class="hud-clock"><span data-sa-time>--:--</span> SAST${M}<span data-sa-band>Live</span><span class="hud-long"> ratings</span></span><span class="hud-nojs">Rated by the hour</span><span class="hud-pv" hidden></span></p>
    <div class="bchips" role="group" aria-label="Preview the ratings for a time band">${chips}<button class="bchip lv" type="button" data-b="-1" hidden><span>Back to live</span></button></div>
  </div>
  <p class="hud-c bl hud">${nMetros} metros${M}${zones} rated areas${M}${stats.totals.riskBands} time bands</p>
  <div class="hud-c br hud"><span class="hud-txt" id="hud-place" data-alt="South Africa${M}${nMetros} metros">Illustrative city</span><button class="pause motion-toggle hud" type="button" aria-pressed="false" data-motion-toggle><span class="pi" aria-hidden="true"></span><span class="motion-label">Pause motion</span></button></div>
</div>`;

// The line breaks in the say line (phones only, styles.css) and the headline
// are where Archivo and Martian Mono wrap them anyway. Written in, the fallback
// fonts (narrower) wrap the same way, so nothing moves when the web fonts land:
// the hero is bottom-aligned, and a headline that grew from two lines to three
// lifted everything above it by up to 118 px.
const hero = `
<section class="home-hero" aria-labelledby="hero-h">
  <div class="home-hero-in">
    <p class="say hud">Tsamaya (say: ${site.pronunciation})${M}<br>Sesotho and Setswana for go</p>
    <h1 class="hero-h" id="hero-h">Go where <br>the trouble <br>isn't.</h1>
    <p class="hero-sub">Tsamaya checks your route against ${zones} rated areas in ${nMetros} South African metros, at the hour you drive, and bends it around the high-risk ones.</p>
    <div class="home-cta">
      <a class="btn btn-primary btn-lg btn-mag" href="#get">Get the app ${arrow}</a>
      <a class="link-q" href="#bend"><span>Watch it re-route</span></a>
    </div>
    <p class="hero-note hud">Lower risk is not no risk. Free, in open beta on Android and iPhone.</p>
  </div>
  <div class="spots" id="spots">
    <div class="co spot" data-co="hf"><button class="co-tag hud" type="button" aria-expanded="false" aria-controls="sp-f">${std.label}${M}${std.grade}<i aria-hidden="true"></i></button>
      <div class="sp-card" id="sp-f"><p class="hud">${std.label} route</p><p><b>Grade ${std.grade}</b>${M}${std.minutes} min${M}${km(std.km)} km</p><p>Passes ${plural(std.highRisk, 'high-risk area', 'high-risk areas')}.</p></div></div>
    <div class="co co-go spot" data-co="hl"><button class="co-tag hud" type="button" aria-expanded="false" aria-controls="sp-l">Lower-risk${M}${low.grade}<i aria-hidden="true"></i></button>
      <div class="sp-card" id="sp-l"><p class="hud">${low.label}</p><p><b>Grade ${low.grade}</b>${M}${low.minutes} min${M}${km(low.km)} km</p><p>Passes ${lowPassesFor}.</p><p class="go">${low.lessRiskPct}% less risk than the ${std.label.toLowerCase()} route.</p></div></div>
  </div>
</section>`;

// Chapter 1: the example trip.
const ch1 = `
<section class="ch ch-1" id="bend" aria-labelledby="ch1-h">
  <div class="ch-in wrap">
    <div class="ch-panel">
      <p class="kick hud">01 / The bend</p>
      <h2 class="ch-h" id="ch1-h" data-split>${timeHead} ${word(fewer)} fewer <span class="nw">high-risk</span> areas.</h2>
      <ol class="ch-steps">
        <li><span class="hud">01</span><p><b>${std.label}:</b> ${stdLine}. It passes ${plural(std.highRisk, 'high-risk area', 'high-risk areas')}.</p></li>
        <li><span class="hud">02</span><p>Tsamaya tests it against every rated area, with this hour's ratings, and starts re-routing.</p></li>
        <li><span class="hud">03</span><p><b>${low.label}:</b> ${lowLine}. It takes the freeway instead and passes ${lowPassesFor}.</p></li>
        <li><span class="hud">04</span><p>You drive it, and the app tells you what it went around.</p></li>
      </ol>
      <div class="ch-stat" id="stat">
        <p class="stat-big"><span class="num" aria-hidden="true" id="stat-from">${std.highRisk}</span><span class="arr" aria-hidden="true">&rarr;</span><span class="to num flip" aria-hidden="true" id="stat-to"><span>${low.highRisk}</span></span><small aria-hidden="true">high-risk areas</small><span class="sr">From ${plural(std.highRisk, 'high-risk area', 'high-risk areas')} down to ${low.highRisk ? low.highRisk : 'none'}.</span></p>
        <p class="stat-p">${low.lessRiskPct}% less risk than the ${std.label.toLowerCase()} route. ${low.extraKm} km further, and ${timeLine} in that morning's traffic.</p>
        <p class="stat-f hud">Numbers from a real route card in the app, ${card.captured}.</p>
      </div>
      <div class="rail"><div class="rail-t" aria-hidden="true"><i class="rail-f"></i></div><div class="rail-l hud" role="group" aria-label="Jump to a step"><button type="button" data-step="0">${std.label}</button><button type="button" data-step="1">Re-route</button><button type="button" data-step="2">Bend</button><button type="button" data-step="3">Drive</button></div></div>
    </div>
    <figure class="fig plan-fig">
      ${planSvg(0, {
        routes: true,
        attrs: 'viewBox="-56 -52 112 104" role="img" aria-labelledby="f1t"',
        extra: `<title id="f1t">Illustrative city: the ${std.label.toLowerCase()} route runs straight through two clusters of high-risk cells; the lower-risk route bends around them.</title><g class="plan-lbl" fill="#C9D6E3"><text x="-46" y="46">A</text><text x="42" y="-42">B</text><text x="-53" y="-47">ILLUSTRATIVE CITY</text><text x="4" y="4" fill="#E6EDF5">${std.label.toUpperCase()}${M}${std.grade}</text><text x="-2" y="40" fill="#34D399">LOWER-RISK${M}${low.grade}</text></g>`,
      })}
    </figure>
  </div>
</section>`;

// Chapter 2: the three time bands. The day line starts at 05:00, so the whole
// day fits and night runs to 05:00 on the right-hand end.
const pct = (mins) => ((mins / 1440) * 100).toFixed(3);
const ch2 = `
<section class="ch ch-2 ch-r" id="clocks" aria-labelledby="ch2-h">
  <div class="ch-in wrap">
    <figure class="fig">
      <div class="tri">
        ${bands.map((b, i) => `<figure>${planSvg(i)}<figcaption class="hud">${b.name}${M}${b.from} to ${b.to}<b>${fmt(b.red)}</b></figcaption></figure>`).join('\n        ')}
      </div>
      <figcaption class="fig-cap hud">Illustrative city, same cells at three times of day. Counts are national areas rated high risk.</figcaption>
    </figure>
    <div class="ch-panel">
      <p class="kick hud">02 / Three clocks</p>
      <h2 class="ch-h" id="ch2-h" data-split>Same city. Three sets of ratings.</h2>
      <p class="ch-p">Tsamaya reads the clock and routes against the one that applies right now. There is no switch to forget.</p>
      <div class="clock" aria-hidden="true"><span class="clock-t" id="clock-t">05:00</span><span class="hud" id="clock-b">${bands[0].name} ratings</span></div>
      <div class="dayline" id="dayline" aria-hidden="true">
        <div class="dl-track"><i class="dl-d" style="width:${pct(750)}%"></i><i class="dl-e" style="width:${pct(120)}%"></i><i class="dl-n" style="width:${pct(570)}%"></i><span class="dl-cur" id="dl-cur"></span></div>
        <div class="dl-ticks hud"><span style="left:0">05:00</span><span class="tk-r" style="left:${pct(750)}%">17:30</span><span class="tk-l" style="left:${pct(870)}%">19:30</span><span style="left:${pct(1140)}%">00:00</span><span style="left:100%">05:00</span></div>
      </div>
      <p class="cnt" aria-hidden="true"><span class="cnt-n flip" id="cnt-n"><span>${fmt(bands[0].red)}</span></span><span class="cnt-l">areas rated high risk, nationally<span class="hud" id="cnt-b">${bands[0].name}${M}${bands[0].from} to ${bands[0].to}</span></span></p>
      <ul class="bands">
        ${bands.map((b, i) => `<li data-b="${i}"><span><span class="hud">${b.name}</span> <span class="muted">${b.from} to ${b.to}</span></span><b>${fmt(b.red)}</b></li>`).join('\n        ')}
      </ul>
    </div>
  </div>
</section>`;

// Chapter 3: the metros, as coverage.
const ch3 = `
<section class="ch ch-3" id="metros" aria-labelledby="ch3-h">
  <div class="ch-in wrap">
    <div class="ch-panel">
      <p class="kick hud">03 / ${word(nMetros)} metros</p>
      <h2 class="ch-h" id="ch3-h" data-split>${nMetros} metros. <span class="nw">${zones}</span> rated areas.</h2>
      <p class="ch-p">Everywhere else it is a normal navigator.</p>
      <ol class="m-list hud">
        ${top6.map((m) => `<li data-k="${m.key}"><span>${m.name}</span><span>${fmt(m.zones)}<span class="sr"> rated areas</span></span></li>`).join('')}
      </ol>
      <p class="ch-note hud">Pillar height and dot size show how many rated areas each metro has. That is coverage, not risk.</p>
      <div class="rail"><div class="rail-t" aria-hidden="true"><i class="rail-f"></i></div></div>
    </div>
    <figure class="fig sa-fig">
      ${saSvg({ title: `Map of South Africa with the ${nMetros} metros Tsamaya rates marked.` })}
      <figcaption class="fig-cap hud">The ${nMetros} metros with ratings. Six largest: ${top6.map((m) => `${m.name} ${fmt(m.zones)}`).join(', ')}.</figcaption>
    </figure>
  </div>
</section>`;

// Chapter 4: explore the metros (src/explore.mjs, shared with the coverage
// page): over the story's scene here, the camera handing over to it.
const explore = exploreSection({ kick: '04 / Explore' });

const zone = `
<div class="zone" id="zone">
${stage}
${hud}
${hero}
${ch1}
${ch2}
${ch3}
${explore}
</div>`;

/* ---------------------------------------------------------------------------
 * 2. The flow sections: inside the app, coverage, questions, get the app, help.
 * ------------------------------------------------------------------------ */
const STEPS = [
  ["Pick where you're going", 'Search, tap the map, or press and hold to drop a pin.'],
  ['Test the quickest route', 'Tsamaya takes the quickest route and tests it against every rated area, using the ratings for this hour.'],
  ['Move it onto checked roads', 'If the route runs through a high-risk area, it moves it onto roads we have checked, and tells you what it went around.'],
  ['Throw out bad detours', 'A detour only gets offered if it cuts your exposure. One that adds too much distance is thrown out, even when it carries less risk.'],
  ["Say so when there's no better way", 'When there is no good alternative, Tsamaya says so and gives you the normal route with the risky stretches marked. It will not invent a detour to look busy.'],
  ['Drive it', 'Turn-by-turn with voice, CarPlay and Android Auto in the app. Or hand it to Google Maps with the detour points already in place.'],
];
const FEATURES = [
  ['Three options', 'Fastest, Balanced and Lower-risk, each with an A to E grade.'],
  ['Live overlay', 'Turn it on to see every rated area and road, colour-coded.'],
  ['Driver notices', 'Police and roadblock notices from other drivers, shown for an hour and spoken when they are ahead. They never change your route.'],
  ['Closures', 'Road closures and protest reports are picked up daily and routed around.'],
  ['Speed', 'A speed limit readout and a gentle over-speed chime.'],
  ['Share a trip', 'Someone at home can follow your live trip on the website.'],
  ['Report a corner', 'Tell us where we got it wrong, from inside the app.'],
  ['Outside the metros', 'An ordinary map and navigator. It just has no risk data there.'],
];
// Two daytime captures (src/shots.mjs, 2026/09/25). Their alt text is written
// here, not taken from altFor(): the shared alts name the suburbs the trips ran
// through, and the home page names no suburbs, least of all beside a risk figure.
const PHONES = [
  {
    name: 'route-result-detour-day',
    label: 'The route options for the trip in chapter 1',
    alt: `Tsamaya comparing route options in the daytime. The balanced and lower-risk option, graded ${low.grade}, takes ${low.minutes} minutes over ${km(low.km)} km: ${low.extraKm} km further than the ${std.label.toLowerCase()} route but ${timeLine} in live traffic, with ${low.lessRiskPct} per cent less risk, passing ${lowPassesFor}. The ${std.label.toLowerCase()} route, graded ${std.grade}, takes ${std.minutes} minutes over ${km(std.km)} km and passes ${plural(std.highRisk, 'high-risk area', 'high-risk areas')} for ${std.highRiskKm} km.`,
  },
  {
    name: 'navigation-day',
    label: 'Turn-by-turn in the app',
    alt: 'Tsamaya turn-by-turn in the daytime, between 3D buildings. The next instruction is a left turn onto the M20 in 280 metres, with lane guidance underneath. The speed reads 43 km/h against a 60 limit, and the road the car is on is labelled lower risk.',
  },
];

const how = `
<section class="sec how" id="how" aria-labelledby="how-h">
  <div class="wrap how-in">
    <header class="sec-h how-h">
      <p class="kick hud" data-reveal>Inside the app</p>
      <h2 class="h2" id="how-h" data-split>What happens after you tap Go</h2>
    </header>
    <div>
      <div class="seq-wrap"><span class="seq-rail" aria-hidden="true"><i></i></span>
        <ol class="seq">
          ${STEPS.map(([t, p], i) => `<li data-reveal><span class="hud">0${i + 1}</span><div><h3>${t}</h3><p>${p}</p></div></li>`).join('\n          ')}
        </ol>
      </div>
      <p class="more" data-reveal><a class="link-q" href="how-it-works.html"><span>The full breakdown</span>${arrow}</a></p>
    </div>
    <div class="phone" data-reveal>
      <div class="phones">
        ${PHONES.map((ph) => deviceShot({ name: ph.name, alt: ph.alt, width: shotSize.width, height: shotSize.height, label: ph.label })).join('\n        ')}
      </div>
      <a class="link-q" href="demo.html"><span>See it in action</span>${arrow}</a>
    </div>
  </div>
  <div class="wrap feats">
    <h3 class="kick hud" data-reveal>Also in the app</h3>
    <dl class="feat-grid">
      ${FEATURES.map(([t, d]) => `<div data-reveal><dt class="hud">${t}</dt><dd>${d}</dd></div>`).join('\n      ')}
    </dl>
  </div>
</section>`;

const half = Math.ceil(metros.length / 2);
const maxZones = metros[0].zones;
const covTable = (rows, part) => `
    <table class="cov-t">
      <caption class="sr">Rated areas per metro, part ${part} of 2</caption>
      <thead><tr><th scope="col">Metro</th><th scope="col" class="n">Areas</th><th scope="col" class="b"><span class="sr">Relative size</span></th></tr></thead>
      <tbody>
        ${rows.map((m) => `<tr><th scope="row"><a href="${m.slug}.html">${m.name}</a></th><td class="n">${fmt(m.zones)}</td><td class="b" aria-hidden="true"><i style="--w:${(m.zones / maxZones).toFixed(3)}"></i></td></tr>`).join('\n        ')}
      </tbody>
    </table>`;

const coverage = `
<section class="sec cov" id="coverage" aria-labelledby="cov-h">
  <div class="wrap">
    <header class="sec-h">
      <p class="kick hud" data-reveal>Coverage</p>
      <h2 class="h2" id="cov-h" data-split>${nMetros} metros, rated area by area</h2>
      <p class="lead" data-reveal>These are the places with ratings. Everywhere else Tsamaya still works as a normal map and navigator, without risk data.</p>
    </header>
    <div class="cov-stats">
      <div data-reveal><b class="num">${zones}</b><span class="hud">Rated risk areas</span></div>
      <div data-reveal><b class="num">${fmt(stats.totals.corridorsSafe)}</b><span class="hud">Checked road stretches</span></div>
      <div data-reveal><b class="num">${fmt(stats.totals.corridorsDanger)}</b><span class="hud">Flagged road stretches</span></div>
      <div data-reveal><b class="num">${stats.totals.riskBands}</b><span class="hud">Time bands</span></div>
    </div>
    <div class="cov-tables" data-reveal>${covTable(metros.slice(0, half), 1)}${covTable(metros.slice(half), 2)}
    </div>
    <div class="cov-src">
      <p data-reveal><span class="hud">Where the ratings come from</span><br>Published South African crime statistics, scored against OpenStreetMap road data to find where vehicle crime concentrates. Every metro gets a review pass before anything goes live, and drivers correct it from there.</p>
      <p data-reveal><span class="hud">Rated by the hour</span><br>Every area carries three ratings: ${bands.map((b) => `${b.name.toLowerCase()} ${b.from} to ${b.to}`).join(', ').replace(/, ([^,]*)$/, ' and $1')}. Yellow means caution: it is shown on the map but never forces a detour.</p>
    </div>
    <p class="more" data-reveal><a class="link-q" href="coverage.html"><span>Coverage by metro</span>${arrow}</a></p>
  </div>
</section>`;

// Today's six questions, word for word. The same list feeds the FAQ JSON-LD, so
// the structured data always matches what is on the page.
const faqs = [
  {
    q: 'What is Tsamaya?',
    a: 'A free navigation app for South African drivers. It plans routes around the places where vehicle crime is known to happen, instead of only working out the quickest way there. It is in open beta on iPhone and Android at the moment.',
  },
  {
    q: 'Where does the risk data come from?',
    a: 'Published South African crime statistics, scored against map data to work out where vehicle crime concentrates. Everything then gets reviewed and corrected against local knowledge before it goes anywhere near the app.',
  },
  {
    q: 'Which cities does it cover?',
    a: `Tsamaya currently maps ${nMetros} metros: ${stats.metros.map((m) => m.name).join(', ')}. Outside those areas it still works as an ordinary map and turn-by-turn navigator; it just has no risk data to apply.`,
  },
  {
    q: 'Does a lower-risk route take much longer?',
    a: 'Usually a few minutes. A detour is only offered when it cuts your exposure, and anything dramatically longer than the direct route is rejected outright.',
  },
  {
    q: 'Is Tsamaya free?',
    a: 'Yes. It is paid for out of pocket, with help from anyone who chips in. There are no ads, and we do not sell anything about you.',
  },
  {
    q: 'Does it guarantee I will be safe?',
    a: 'No, and we will never tell you otherwise. Tsamaya cuts your exposure to areas with a history of vehicle crime. Crime is not predictable, and no route is safe. Treat it as better information for the choice you were going to make anyway, and stay alert.',
    open: true,
  },
];

// Every answer is open in the HTML, so the page reads without JavaScript;
// home.js folds them into an accordion, leaving the data-open one showing.
const questions = `
<section class="sec qs" id="faq" aria-labelledby="faq-h">
  <div class="wrap faq-in">
    <header class="sec-h">
      <p class="kick hud" data-reveal>Questions</p>
      <h2 class="h2" id="faq-h" data-split>Straight answers</h2>
    </header>
    <div class="faq-list">
      ${faqs.map((f, i) => `<div class="qa"${f.open ? ' data-open' : ''}><h3><button type="button" aria-expanded="true" aria-controls="qa${i + 1}" id="qb${i + 1}">${f.q}<span class="pm" aria-hidden="true"></span></button></h3><div class="qa-a" id="qa${i + 1}" role="region" aria-labelledby="qb${i + 1}"><p>${f.a}</p></div></div>`).join('\n      ')}
    </div>
  </div>
</section>`;

const get = `
<section class="sec get" id="get" aria-labelledby="get-h">
  <div class="wrap">
    <header class="sec-h">
      <p class="kick hud" data-reveal>Get the app</p>
      <h2 class="h2" id="get-h" data-split>Free, and in open beta now.</h2>
    </header>
    <div class="get-grid">
      <article class="gp" data-reveal>
        <p class="hud">Google Play${M}open test</p>
        <h3>Android</h3>
        <p>Join the open test on Google Play, then install it like any other app.</p>
        <a class="btn btn-primary btn-lg btn-mag" href="${site.androidPlayLink}">Get it on Google Play ${arrow}</a>
      </article>
      <article class="gp" data-reveal>
        <p class="hud">TestFlight${M}beta</p>
        <h3>iPhone</h3>
        <p>Apple's TestFlight app installs beta apps. Get it first, then open our invite.</p>
        <a class="btn btn-primary btn-lg btn-mag" href="${site.testflightPublicLink}">Join on TestFlight ${arrow}</a>
      </article>
      <aside class="priv" data-reveal aria-label="Privacy">
        <p class="hud">Privacy</p>
        <p class="priv-b">No account. No trip history kept. No ads.</p>
        <p>Your location is used on your phone to show the map and plan routes. Route requests send bare coordinates to the map provider, never your name. There is no account, and we keep no trip history on our servers unless you choose to share a live trip.</p>
        <p><a class="link-q" href="${site.legal.privacy}"><span>Privacy policy</span></a></p>
      </aside>
    </div>
  </div>
</section>`;

const AMOUNTS = [
  [100, 'Goes into running costs: map tiles, geocoding, the database.'],
  [1000, 'And we will ask which metro you want next.'],
  [2500, 'Sponsors a whole new city.'],
];
const help = `
<section class="sec help" id="help" aria-labelledby="help-h">
  <div class="wrap">
    <header class="sec-h">
      <p class="kick hud" data-reveal>Help</p>
      <h2 class="h2" id="help-h" data-split>Help it get better</h2>
      <p class="lead" data-reveal>Tsamaya is independent and self-funded. The most useful help costs nothing.</p>
    </header>
    <div class="help-in">
      <div data-reveal>
        <h3 class="hud">Free</h3>
        <ol class="free">
          <li><span class="hud">01</span>Drive with it.</li>
          <li><span class="hud">02</span>Tell one other driver.</li>
          <li><span class="hud">03</span>Report a corner we got wrong.</li>
          <li><span class="hud">04</span>Tell us when it annoys you.</li>
        </ol>
      </div>
      <div class="money" data-reveal>
        <h3 class="hud">Money, if you want to</h3>
        <p>Optional and once-off, by EFT. There are no tiers; this is what an amount does.</p>
        <dl class="amounts">
          ${AMOUNTS.map(([r, t]) => `<div><dt>R ${fmt(r)}</dt><dd>${t}</dd></div>`).join('\n          ')}
        </dl>
        <p class="help-links"><a class="link-q" href="sponsor.html#donate"><span>Bank details and the reference to use</span>${arrow}</a><a class="link-q" href="sponsor.html"><span>All the ways to help</span>${arrow}</a></p>
      </div>
    </div>
  </div>
</section>`;

const flow = `
<div class="home-flow">
${how}
${coverage}
${questions}
${get}
${help}
</div>`;

export default {
  slug: 'index.html',
  title: 'Home',
  description: site.description,
  heroClass: 'sn page-home',
  hud: false, // the scene carries its own HUD corners
  scripts: ['js/home.js'],
  jsonLd: [faqNode(faqs)],
  body: [posterDefs(), zone, flow].join('\n'),
};
