import { site } from '../../site.config.mjs';
import { geoData } from '../sitedata.mjs';
import { pageHead, sec, linkQ, M } from '../kit.mjs';

// The name and the founder's story, over a quiet dotted outline of South Africa
// (SVG only: a text page never loads the 3D library). The outline is the same
// projected land shape the home page's chapter 3 draws, filled with a dot
// pattern; no metro, no rating, nothing but the country.
const geo = geoData();
const pathD = (rings) => rings.map((r) => 'M' + r.map((p) => p.join(' ')).join('L') + 'Z').join('');
const country = `<svg viewBox="0 0 ${geo.width} ${Math.ceil(geo.height)}" focusable="false">
      <defs><pattern id="ab-dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="1.6"/></pattern></defs>
      <path class="ab-fill" fill-rule="evenodd" d="${pathD(geo.land)}"/>
      <path class="ab-line" fill-rule="evenodd" d="${pathD(geo.land)}"/>
    </svg>`;

const name = sec({
  id: 'name',
  kick: 'The name',
  title: `Tsamaya <span class="say">${site.pronunciation}</span>`,
  inner: `
    <div class="about-name" data-reveal>
      <p class="lead">It is Sesotho and Setswana for "go", from the everyday blessing <em>tsamaya sentle</em>, meaning "go well". That is the whole promise in two words: a wish for a good journey rather than a guarantee, the way people say goodbye here.</p>
      <p>There is a second meaning we love. In kasi football, a <em>tsamaya</em> is the move that sends the defender the wrong way: going exactly where the trouble is not. Which is the entire point.</p>
      <p class="lockup">${site.lockup}</p>
    </div>`,
});

const PRINCIPLES = [
  ['Honest about risk', 'We never say "safe". Routes are lower-risk, built from statistics and local knowledge. We tell you what we went around and trust you to make the call.'],
  ['Local knowledge counts', 'Data alone misses the corner everyone nearby already avoids. Roads that drivers have checked fold real human knowledge into the model.'],
  ['Built for South Africa', 'Made in Johannesburg, for the way people actually drive here. It is not a global template with our cities bolted onto the side.'],
  ['Nothing hidden', 'Open rules, visible ratings, a clear disclaimer. You can always see why a route bends the way it does.'],
];

const principles = sec({
  id: 'principles',
  kick: 'What we believe',
  title: 'Four principles',
  inner: `
    <dl class="feat-grid" data-reveal>
      ${PRINCIPLES.map(([t, d]) => `<div><dt class="hud">${t}</dt><dd>${d}</dd></div>`).join('\n      ')}
    </dl>`,
});

const founder = sec({
  id: 'founder',
  kick: 'Who is behind it',
  title: 'An independent, self-funded project',
  inner: `
    <div class="about-f">
      <div data-reveal>
        <p class="lead">Tsamaya is built and maintained by Kyle Kimble, a Johannesburg chartered accountant who taught himself to ship a mobile app because the problem would not leave him alone.</p>
        <p>It is not backed by a big company or a marketing budget. Every metro on the map came out of one person's nights and weekends, and it carries no ads and sells nothing about you.</p>
        <p class="more">${linkQ('Support the project', 'sponsor.html')}${linkQ('Say hello', 'contact.html')}</p>
      </div>
      <figure class="quote" data-reveal>
        <blockquote><p>"Most maps optimise for the fastest line. On South African roads, the fastest line isn't always the one you want to be on. Tsamaya is my attempt to give drivers that choice."</p></blockquote>
        <figcaption class="hud">Kyle Kimble${M}founder</figcaption>
      </figure>
    </div>`,
});

export default {
  slug: 'about.html',
  title: 'About us',
  description:
    'The story behind Tsamaya, an independent navigation app built in Johannesburg that routes South African drivers around known risk. The name means "go well".',
  heroClass: 'sn page-about',
  hud: false,
  body: [
    pageHead({
      meta: `About us${M}built in Johannesburg`,
      title: 'A small idea with a serious job: get people home well.',
      lead: 'Tsamaya started with one driver\'s question: <em>why does my map send me through the worst part of town to save two minutes?</em> It grew into a navigation app that puts risk on the map.',
      fig: country,
    }),
    name,
    principles,
    founder,
    sec({
      id: 'more',
      cls: 'tail',
      kick: 'Follow along',
      title: 'Want to follow along, or pitch in?',
      lead: 'Whether you drive with it, want to chip in, or are just curious, we would love to hear from you.',
      inner: `<p class="more" data-reveal>${linkQ('Contact us', 'contact.html')}${linkQ('See the app', 'demo.html')}</p>`,
    }),
  ].join('\n'),
};
