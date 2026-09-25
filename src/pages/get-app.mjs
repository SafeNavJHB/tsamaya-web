import { site } from '../../site.config.mjs';
import { pageHead, sec, storePanels, linkQ, M } from '../kit.mjs';

// The dedicated "Get the app" page; the header's button and every "Get the app"
// link land here. Two panels, Google Play first and TestFlight second, with the
// privacy line beside them. site.js lights the panel for the visitor's phone
// (data-platform); nothing moves.

const STEPS = [
  ['Open Tsamaya and look around', 'The map opens on your metro with the ratings already drawn: rated areas and roads, coloured by risk and the time of day. A short tour points out the important parts on first run.'],
  ['Allow location while driving', 'Tsamaya needs your location to show where you are and to plan a route from where you are standing. Choose "While Using the App" when it first asks. On iPhone it asks once more when you start your first drive, so guidance keeps going when your screen locks. It does not collect your location when the app is closed.'],
  ['Drive a route you already know', 'The best first test is a trip you make often. You will see straight away whether the route it suggests makes sense to you, and that is exactly the feedback worth having.'],
];

const started = sec({
  id: 'start',
  kick: 'Once it is installed',
  title: 'Getting started takes about five minutes',
  inner: `
    <ol class="seq steps-3" data-reveal>
      ${STEPS.map(([t, p], i) => `<li><span class="hud">0${i + 1}</span><div><h3>${t}</h3><p>${p}</p></div></li>`).join('\n      ')}
    </ol>
    <div class="note" data-reveal>
      <p class="hud">Something looks wrong?</p>
      <p>If an area looks mis-rated, tap the flag on the map and say so. It goes straight into our review queue. For anything else, email <a href="mailto:${site.contactEmail}">${site.contactEmail}</a>. Reports about roads you actually drive are the most useful thing you can send us.</p>
    </div>`,
});

const more = sec({
  id: 'more',
  cls: 'tail',
  kick: 'Before you install',
  title: 'Want the full picture first?',
  lead: 'See how the routing thinks, or watch the app on a real route.',
  inner: `<p class="more" data-reveal>${linkQ('How it works', 'how-it-works.html')}${linkQ('See it in action', 'demo.html')}</p>`,
});

export default {
  slug: 'get-app.html',
  title: 'Get the app',
  description:
    'Install Tsamaya on Android (Google Play) or iPhone (TestFlight), free during the beta, and get set up in about five minutes.',
  heroClass: 'sn page-get',
  hud: false,
  body: [
    pageHead({
      meta: `Open beta${M}Android and iPhone${M}free`,
      title: 'Put Tsamaya on your phone.',
      lead: 'Free while in beta, on both platforms: Google Play on Android, TestFlight on iPhone. A few minutes to set up, and you can leave whenever you like.',
      after: storePanels({ steps: true, h: 'h2' }),
    }),
    started,
    more,
  ].join('\n'),
};
