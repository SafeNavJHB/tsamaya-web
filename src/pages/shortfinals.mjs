import { pageHead, sec, linkQ } from '../kit.mjs';
import { FLIGHT_APPS, appIcon, appNode } from '../flight.mjs';

// Short Finals' landing page. Every claim here is in the app's store description
// (the app repo's docs/store/app-store-listing.md) or its support and legal pages,
// and was checked against the app on 26 November 2026. The two lines in "Study
// aid only" and the trademark line are the app's own wording (the app repo's
// docs/PLAN.md, Legal): keep them word for word, as shortfinals-support.html does.
const app = FLIGHT_APPS.find((a) => a.key === 'shortfinals');

const DISCLAIMER = "Study aid only. Use the POH for your aircraft's serial number and follow your instructor. Never use figures from this app for flight planning.";
const NOT_GOV = 'Not a government app. Short Finals is published by Tsamaya (Pty) Ltd and does not represent the South African Civil Aviation Authority (SACAA) or any other government body.';
// Pinned word for word to the app's About screen (mobile/src/features/more/legal.ts).
const NOT_AFFILIATED = 'Cessna is a trademark of Textron Aviation Inc. Piper, Robinson, R22, R44, Sling and Diamond are trademarks of their respective owners. This app is not affiliated with or endorsed by any manufacturer or by SACAA.';

const grid = (items) => `
    <dl class="feat-grid" data-reveal>
      ${items.map(([t, d]) => `<div><dt class="hud">${t}</dt><dd>${d}</dd></div>`).join('\n      ')}
    </dl>`;

const questions = sec({
  id: 'questions',
  kick: 'The questions',
  title: 'Every answer shows its source',
  lead: 'More than 7 000 questions in the format of the SACAA theory exams. We wrote every one ourselves from published sources, so they are not SACAA exam questions. Each shows its source, such as the CAR or SA-CATS paragraph, the AIP section, a handbook or textbook, or the POH page. A few cover points no free source does, and are marked as our own. Where two sources disagree, the question says so and tells you to ask your instructor.',
  inner: grid([
    ['PPL', 'Air Law, Human Performance, Meteorology, Navigation, Radiotelephony, and Principles of Flight, Aircraft General Knowledge and Flight Performance and Planning for aeroplanes and helicopters.'],
    ['CPL', 'Air Law, Human Performance and Limitations, Meteorology, Navigation, Instruments, Radio Aids and Communication, Aircraft Technical and General, and Flight Performance and Planning.'],
    ['Aircraft', 'Cessna 172N, Piper PA-28-140 and PA-28-160 Cherokee, Sling 2 (including the NGT), Sling LSA, Robinson R22 and Robinson R44, plus packs on the O-320 and Rotax 912 engines, constant-speed propellers and twins.'],
    ['Mistakes', 'Spot one? Tap Report a problem on the question and the app sends it to us. We read every report, and What changed shows what we fixed.'],
  ]),
});

const study = sec({
  id: 'study',
  kick: 'How you study',
  title: 'Practice like the exam',
  inner: grid([
    ['Exams', 'Timed practice exams for each paper, 75% to pass, with flags and the option to finish later.'],
    ['Questions', 'Multiple choice like the exam, or flashcards with spaced repetition, and a weak list of the questions you last got wrong.'],
    ['Planner', 'A countdown to your exam, readiness per subject and the 18-month window for your PPL papers.'],
    ['Hourly questions', 'A question as a notification at the hours and on the days you choose, and a widget that asks you one.'],
    ['Worked examples', 'Navigation, fuel, weight and balance and performance, on our own charts with invented figures, and a full flight to plan.'],
    ['Drills', 'Emergency procedure flows to drill for the Cessna 172N, PA-28, R22, Sling 2 and Sling LSA.'],
    ['Weather', 'METAR and TAF decoding, with practice and live reports for South African aerodromes.'],
    ['Radio', 'Radio practice at ten South African aerodromes, among them Brakpan, Wonderboom, Lanseria and Cape Town. Pick, type or say your reply.'],
  ]),
});

const instructors = sec({
  id: 'instructors',
  kick: 'For instructors',
  title: 'Brief with the sources open',
  lead: 'Briefing mode with answers and sources, a list of every question where sources differ, quizzes shared by link or QR code, and your students\' "Ask my instructor" lists. Instructors at South African schools can apply in the app for a free code that unlocks it on two of their devices.',
});

const price = sec({
  id: 'price',
  kick: 'Price',
  title: 'Free to try, once-off to unlock',
  lead: 'The first 15 questions of every pack, the first item of each kind of practice, one sample flight to plan, live weather reports and a 10-question sample exam per paper are free. No subscription, no account and no ads.',
  inner: `
    <dl class="feat-grid feat-3" data-reveal>
      <div><dt class="hud">PPL unlock</dt><dd>R499.99 once-off. Every PPL paper, every aircraft and all the practice.</dd></div>
      <div><dt class="hud">CPL unlock</dt><dd>R999.99 once-off. Every CPL paper and the PPL papers its exams cover, every aircraft and all the practice.</dd></div>
      <div><dt class="hud">PPL to CPL</dt><dd>R499.99 if you already have the PPL unlock, so both licences cost R999.99 either way.</dd></div>
    </dl>`,
});

const data = sec({
  id: 'data',
  kick: 'Your data',
  title: 'Your progress stays on your phone',
  lead: 'No account and no sign-in. Your progress and notes stay on your phone. On iPhone and iPad you can back up to a folder you choose, such as iCloud Drive. On Android your phone\'s own backup carries your progress, and on either you can save a backup file yourself. The privacy policy lists the few things that do leave your phone, such as the problem reports you send.',
  inner: `<p class="more" data-reveal>${linkQ('Short Finals privacy policy', app.privacy)}</p>`,
});

const legal = sec({
  id: 'help',
  cls: 'tail',
  kick: 'Help and legal',
  title: 'Study aid only',
  lead: `${DISCLAIMER} ${NOT_GOV}`,
  inner: `<p class="fine" data-reveal>${NOT_AFFILIATED}</p>
    <p class="more" data-reveal>${linkQ('Short Finals support', app.support)}${linkQ('Terms of use', app.terms)}${linkQ('Privacy policy', app.privacy)}${linkQ('All flight apps', 'flight.html')}</p>`,
});

const FEATURES = [
  'Questions in the format of the SACAA PPL and CPL theory exams, each with its source',
  'Aeroplane and helicopter papers',
  'Timed practice exams',
  'Spaced repetition flashcards',
  'METAR and TAF decoding',
  'Radio practice',
  'Hourly questions',
];

export default {
  slug: 'shortfinals.html',
  title: 'Short Finals',
  headTitle: 'Short Finals: PPL and CPL ground school study for South African student pilots',
  description:
    'Short Finals is a ground school study app for the SACAA PPL and CPL theory exams, aeroplane and helicopter: sourced questions, timed exams, METAR and TAF, radio practice. Free to try.',
  heroClass: 'sn page-flight',
  hud: false,
  jsonLd: [
    appNode(app, {
      description: 'A ground school study app for South African student pilots, covering the SACAA PPL and CPL theory papers, aeroplane and helicopter, and the aircraft they fly.',
      category: 'EducationalApplication',
      features: FEATURES,
    }),
  ],
  body: [
    pageHead({
      crumb: { href: 'flight.html', label: 'All flight apps' },
      meta: `${app.kind} · ${app.status}`,
      title: 'Short Finals',
      lead: 'A ground school study app for South African student pilots. It covers the theory papers for the PPL and the CPL, aeroplane and helicopter, and the aircraft you fly.',
      after: `<p class="fl-soon-line">Coming to the App Store and Google Play. ${linkQ('Get help', app.support)}</p>`,
      fig: appIcon(app, 192),
    }),
    questions,
    study,
    instructors,
    price,
    data,
    legal,
  ].join('\n'),
};
