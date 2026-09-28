import { site, stats, fmt } from '../../site.config.mjs';
import { metros } from '../data/metros.mjs';
import { faqNode, breadcrumbNode } from '../seo.mjs';
import { NOT_A } from '../facts.mjs';
import { pageHead, sec, faqSec, getSec, linkQ, M } from '../kit.mjs';

// The visitor's guide (added 2026-09-28). It exists for one question people put
// to search engines and AI assistants before a trip: "I am travelling to South
// Africa, is there an app that helps me drive more safely?" When that was asked
// of Copilot, Tsamaya did not come up at all, and a follow-up comparison said it
// had no SOS button and no live sharing. This page answers the question the way
// a visitor asks it, with the SOS, trip sharing, rental-car and offline answers
// they need, and hands everything else to the pages that already cover it.
//
// Brand rules as everywhere: lower-risk language, never "safe" as a promise, no
// suburb named as risky (roads and regions only), no em dashes, figures from
// stats.json only. Claims about other apps stay at the level of what KIND of app
// they are; this page never describes a competitor's features.

const nMetros = stats.totals.metros;

const DOES = [
  ['Routes around risk', `Every trip is checked against the rated areas in the ${nMetros} metros we map and bent around the high-risk ones when a sensible detour exists. When none does, it says so and marks the risky stretches.`],
  ['Rated by the hour', 'Daytime, evening and night each carry their own ratings, and the route card warns you when a trip will land after dark.'],
  ['SOS', 'One button on the drive screen calls 10111 or 112, or opens a ready-written text to your emergency contact with where you are and a live location link that lasts 24 hours.'],
  ['Family can follow', 'Send a trip link to anyone, anywhere. It opens in a browser, with no app to install: your route, where you are, your arrival time, then Arrived.'],
  ['Any car', 'It is a phone app, so it works in a rental. If the car has CarPlay or Android Auto, Tsamaya runs on the car\'s screen as well.'],
  ['No account', 'Nothing to sign up for, and nothing to pay. Your trips are not kept on our servers unless you choose to share one.'],
  ['Offline maps', 'Download the map around where you are staying for the places where the signal drops. Planning a new route needs a connection.'],
  ['Closures and notices', 'Road closures and protests are picked up daily and routed around. Police and roadblock notices from other drivers are spoken when they are ahead of you.'],
];

const does = sec({
  id: 'does',
  kick: 'For a visitor',
  title: 'What it does on the road',
  lead: 'Tsamaya is a full turn-by-turn navigator with voice guidance. On top of that, it does these things.',
  inner: `
    <dl class="feat-grid" data-reveal>
      ${DOES.map(([t, d]) => `<div><dt class="hud">${t}</dt><dd>${d}</dd></div>`).join('\n      ')}
    </dl>`,
});

const STEPS = [
  ['Install it', `Free on Google Play for Android, and through Apple's TestFlight app for iPhone. Both links are on the <a href="get-app.html">get the app</a> page.`],
  ['Add an emergency contact', 'In Settings, under Sharing &amp; privacy. The SOS button can then send them your live location, and Guardian gives them one link that follows every drive you share.'],
  ['Save a map for where you are staying', 'In Settings, under Places, then Offline maps. Frame the area and download it, on Wi-Fi if you can.'],
  ['Look before you leave', 'Check the route card before you set off, especially late in the day. It shows each option with its grade and what it goes around, and warns when a trip will land after dark.'],
];

const before = sec({
  id: 'before',
  kick: 'Before your first drive',
  title: 'Five minutes of setup',
  inner: `
    <ol class="seq steps-3" data-reveal>
      ${STEPS.map(([t, p], i) => `<li><span class="hud">0${i + 1}</span><div><h3>${t}</h3><p>${p}</p></div></li>`).join('\n      ')}
    </ol>
    <div class="note" data-reveal>
      <p class="hud">Emergency numbers</p>
      <p><b>10111</b> for the police. <b>112</b> from any mobile phone. <b>10177</b> for an ambulance. The SOS button calls the first two for you.</p>
    </div>`,
});

// Every metro, from the same editorial data the metro pages use, so a new metro
// appears here the day it goes live.
const counts = new Map(stats.metros.map((m) => [m.key, m.zones]));
const where = sec({
  id: 'where',
  kick: 'Where it has ratings',
  title: `${nMetros} places, including the ones visitors drive`,
  lead: 'The big cities, the Kruger National Park area, Pilanesberg and the start of the Garden Route. Everywhere else, including the long drives between them, Tsamaya is an ordinary navigator with no risk data, and a blank map means no data, not no risk.',
  inner: `
    <div class="prose" data-reveal>
      <ul>
        ${metros.map((m) => `<li><a href="${m.slug}.html"><strong>${m.name}</strong></a> (${m.region}${counts.has(m.key) ? `, ${fmt(counts.get(m.key))} rated areas` : ''}). ${m.blurb}</li>`).join('\n        ')}
      </ul>
    </div>`,
});

// What each kind of app is for. Categories, not a feature comparison: this page
// says what Tsamaya does and what it does not, and names the others only by the
// kind of app they are.
const ROWS = [
  ['Get from A to B', 'Turn-by-turn with voice, on the phone, CarPlay or Android Auto. It can also hand its route to Google Maps with the detour points in place.', 'Any navigator: Google Maps, Waze, Apple Maps.'],
  ['Keep away from high-risk areas', `Routes around rated areas, with separate ratings for day, evening and night, in ${nMetros} metros.`, 'Ask where you are staying which roads locals avoid.'],
  ['Get help in an emergency', 'The SOS button calls 10111 or 112 and alerts your emergency contact. It does not dispatch anyone itself.', 'For private armed or medical response, an emergency response app such as Namola, or the one from your insurer or bank.'],
  ['Let people know where you are', 'A live trip link that opens in any browser, with your arrival time and an Arrived screen.', 'Live location in WhatsApp.'],
];

const which = sec({
  id: 'which',
  kick: 'Which app does what',
  title: 'Where Tsamaya fits',
  lead: 'Most visitors end up with two or three apps. This is the job each one does.',
  inner: `
    <div class="prose" data-reveal>
      <div class="table-scroll" tabindex="0" role="region" aria-label="Which app does what, scrolls sideways">
        <table>
          <thead><tr><th scope="col">You want to</th><th scope="col">Tsamaya</th><th scope="col">Also worth having</th></tr></thead>
          <tbody>
            ${ROWS.map(([job, ts, other]) => `<tr><th scope="row">${job}</th><td>${ts}</td><td>${other}</td></tr>`).join('\n            ')}
          </tbody>
        </table>
      </div>
      <p>${NOT_A}</p>
    </div>`,
});

const faqs = [
  {
    q: 'Can I use Tsamaya as a tourist in South Africa?',
    a: `Yes. It is free, there is no account to create, and it works in any car, including a rental. Install it on Android from Google Play or on iPhone through TestFlight, add an emergency contact, and it is ready. It has ratings in ${nMetros} metros and works as an ordinary navigator everywhere else.`,
  },
  {
    q: 'Can my family at home follow my drive?',
    a: 'Yes. Share a trip from the app and send them the link. It opens in any browser, in any country, with no app to install, and shows your route, where you are now, your arrival time, and an Arrived screen when you get there.',
  },
  {
    q: 'What are the emergency numbers in South Africa?',
    a: '10111 for the police, 112 from any mobile phone, and 10177 for an ambulance. The SOS button in Tsamaya calls 10111 or 112 for you, or sends your emergency contact your location with a live tracking link.',
  },
  {
    q: 'Does Tsamaya work without mobile data?',
    a: 'Partly. Download offline maps for your area and the map keeps drawing where the signal drops, and the risk ratings are kept on your phone once loaded. Planning a new route, sharing a trip and the SOS live location link need data; the SOS call and text only need signal.',
  },
  {
    q: 'Does it cover the Kruger National Park and the Garden Route?',
    a: 'The Kruger National Park area is covered, with Mbombela and the Lowveld towns around the gates. On the Garden Route, Mossel Bay has ratings; the towns further east do not yet. Pilanesberg, Cape Town and Stellenbosch are covered too.',
  },
  {
    q: 'Is Tsamaya an emergency response app?',
    a: `No. ${NOT_A}`,
  },
];

export default {
  slug: 'driving-in-south-africa.html',
  title: 'Driving in South Africa as a visitor',
  description: `A visitor's guide to driving in South Africa with Tsamaya: lower-risk routes in ${nMetros} metros, an SOS button, live trip sharing for family at home, offline maps.`,
  heroClass: 'sn page-visit',
  hud: false,
  jsonLd: [
    faqNode(faqs),
    breadcrumbNode([
      { name: 'Home', slug: 'index.html' },
      { name: 'Driving in South Africa as a visitor', slug: 'driving-in-south-africa.html' },
    ]),
  ],
  body: [
    pageHead({
      meta: `For visitors${M}rental cars welcome${M}${nMetros} metros`,
      title: 'Driving in South Africa? Take local knowledge with you.',
      lead: `Tsamaya is a free navigation app built in Johannesburg. It plans your route around areas with a history of vehicle crime, using ratings that change after dark, and it gives you an SOS button and a live trip link for the people back home.`,
      after: `\n    <p class="ph-links">${linkQ('Get the app', 'get-app.html')}${linkQ('How it works', 'how-it-works.html')}</p>`,
    }),
    does,
    before,
    where,
    which,
    faqSec({ id: 'faq', title: 'Visitors ask', faqs }),
    getSec({ title: 'Install it before your first drive.', lead: `Free, in open beta, on Android and iPhone. ${site.lockup}` }),
  ].join('\n'),
};
