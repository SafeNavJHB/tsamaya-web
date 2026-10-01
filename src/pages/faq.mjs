import { F } from '../faqs.mjs';
import { faqNode, breadcrumbNode } from '../seo.mjs';
import { pageHead, faqSec, getSec, M } from '../kit.mjs';
import { LATEST } from '../topic.mjs';

// The FAQ hub (added 2026-10-01): every question people ask about Tsamaya, in
// groups, on one page. The answers are the shared objects in src/faqs.mjs, the
// same ones the topic pages use, so a fact is changed in one place. The FAQPage
// markup is ONE node holding every question shown here (the visible text and the
// markup must match).

const GROUPS = [
  ['about', 'The app', 'About Tsamaya', [F.what, F.who, F.free, F.guarantee, F.privacy]],
  ['routes', 'Routes and data', 'Routes, ratings and coverage', [F.data, F.cities, F.longer, F.stops, F.night]],
  ['road', 'On the road', 'Closures, cameras and notices', [F.protests, F.notices, F.cameras, F.vans, F.hotspots, F.voice, F.discover]],
  ['car', 'In the car', 'CarPlay and Android Auto', [F.carplay, F.aa, F.offline]],
  ['help', 'Emergencies and sharing', 'SOS and live trips', [F.sos, F.share]],
  ['compare', 'Compared', 'Tsamaya and other navigators', [F.waze, F.google]],
];

const all = GROUPS.flatMap((g) => g[3]);

const page = {
  slug: 'faq.html',
  title: 'Questions and answers',
  description: 'Answers to what people ask about Tsamaya: coverage, risk data, closures and protests, speed cameras, hotspots, CarPlay, SOS, live trip sharing and how it compares with Waze and Google Maps.',
  heroClass: 'sn page-visit',
  hud: false,
  modified: LATEST.iso,
  jsonLd: [
    faqNode(all),
    breadcrumbNode([{ name: 'Home', slug: 'index.html' }, { name: 'Questions and answers', slug: 'faq.html' }]),
  ],
  body: [
    pageHead({
      meta: `Questions${M}as of ${LATEST.text}`,
      title: 'Questions, answered straight.',
      lead: 'Everything people ask about Tsamaya, in one place. Lower risk is not no risk, and nothing here is a guarantee.',
      after: '\n    <p class="ph-links qa-all"><button class="link-q" type="button" data-qa-all="open"><span>Open every answer</span></button><button class="link-q" type="button" data-qa-all="close"><span>Close every answer</span></button></p>',
    }),
    ...GROUPS.map(([id, kick, title, faqs]) => faqSec({ id: `faq-${id}`, kick, title, faqs })),
    getSec({ title: 'Try it on your next drive.', lead: 'Free, in open beta, on Android and iPhone.' }),
  ].join('\n'),
};

export default page;
