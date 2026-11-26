import { pageHead, sec, linkQ } from '../kit.mjs';
import { FLIGHT_APPS, appIcon, appNode } from '../flight.mjs';

// Logbook²'s landing page. Every claim here is in the app's store description
// (the app repo's docs/play-store/full-description.txt) or its support and legal
// pages, and was checked against the app's code on 26 November 2026. Change a
// feature here only after checking the app.
const app = FLIGHT_APPS.find((a) => a.key === 'logbook2');

const grid = (items) => `
    <dl class="feat-grid" data-reveal>
      ${items.map(([t, d]) => `<div><dt class="hud">${t}</dt><dd>${d}</dd></div>`).join('\n      ')}
    </dl>`;

const log = sec({
  id: 'log',
  kick: 'Logging',
  title: 'Every flight, in the right book',
  lead: 'Pick the aircraft type and Logbook² picks the logbook: Fixed Wing or Rotorcraft, each with its own entries, totals and printed pages.',
  inner: grid([
    ['Aerodromes', 'Search covers South Africa, Namibia, Botswana, Zimbabwe, Mozambique, Lesotho and Eswatini.'],
    ['Day and night', 'The app can work out a flight\'s day and night split from its times and departure aerodrome.'],
    ['Bring your history', 'Import from a PDF exported by another logbook app, Excel, CSV or a photo of a paper logbook page. You see a preview before anything is saved, and with a photo you check each row it read.'],
    ['Instructors', 'Send a flight to your student as a QR code or link. They check it and save it in their own logbook.'],
  ]),
});

const hours = sec({
  id: 'hours',
  kick: 'Hours and currency',
  title: 'Know where you stand',
  lead: 'Home shows your total hours, recency and the other widgets you choose. Hours breaks your time down by instrument, instructor and recency.',
  inner: grid([
    ['Expiry dates', 'Licences, ratings and medicals in one place, with reminders before they run out and when a print is due.'],
    ['Part 61 goals', 'Track the hours you need for your next licence or rating.'],
    ['Duty log', 'Keep your duty times alongside your flights.'],
    ['Photos and documents', 'Attach them to flights and licences.'],
  ]),
});

const keep = sec({
  id: 'keep',
  kick: 'Printing and backups',
  title: 'Never locked in',
  lead: 'Printing, CSV export and backing up stay free, with or without a subscription.',
  inner: grid([
    ['SA-CATS pages', 'Print your logbook as SA-CATS 61 pages in an A4 landscape PDF, or a summary of your totals for your career or a date range.'],
    ['Export', 'Every flight to CSV, or with Pro to Excel with every aircraft type and total.'],
    ['Backups', 'A backup file you keep where you like, with an optional password. It opens on iPhone and Android.'],
    ['Automatic backups', 'On iPhone, to a folder you choose such as one in iCloud Drive. On Android, to your Google account when Backup is on.'],
  ]),
});

const pro = sec({
  id: 'pro',
  kick: 'Logbook² Pro',
  title: '30 days free, then your choice',
  lead: 'Everything is unlocked for your first 30 days. After that, Logbook² Pro is R29.99 a month or R299.99 a year through the App Store or Google Play. One logbook, printing, backups and restoring stay free.',
  inner: `
    <dl class="feat-grid feat-3" data-reveal>
      <div><dt class="hud">Pro adds</dt><dd>Your second logbook, imports, Excel export, instructor tools and signatures, the duty log, photos and documents, goals, reminders and the revalidation pack.</dd></div>
      <div><dt class="hud">If you stop</dt><dd>You keep everything you made, and can still view, print, back up and export it as CSV. Pro features such as imports, reminders and Excel export stop until you subscribe again.</dd></div>
      <div><dt class="hud">Managing it</dt><dd>Cancel any time in your App Store or Google Play subscriptions. On iPhone, do it at least 24 hours before the period ends.</dd></div>
    </dl>`,
});

const data = sec({
  id: 'data',
  kick: 'Your data',
  title: 'Your logbook stays on your phone',
  lead: 'No account, no sign-in, no ads and no analytics in the app. Flights, licences and settings are stored on your phone, and your logbook only leaves it when you export, back up or share it yourself. The privacy policy lists the small technical exceptions, such as update checks.',
  inner: `<p class="more" data-reveal>${linkQ('Logbook² privacy policy', app.privacy)}</p>`,
});

const legal = sec({
  id: 'help',
  cls: 'tail',
  kick: 'Help and legal',
  title: 'Support, terms and privacy',
  lead: 'Logbook² is an independent app. It is not approved, endorsed or certified by the South African Civil Aviation Authority. You stay responsible for your logbook\'s accuracy and for printing and filing your pages.',
  inner: `<p class="more" data-reveal>${linkQ('Logbook² support', app.support)}${linkQ('Terms of use', app.terms)}${linkQ('Privacy policy', app.privacy)}${linkQ('All flight apps', 'flight.html')}</p>`,
});

const FEATURES = [
  'Fixed wing and rotorcraft logbooks',
  'SA-CATS 61 logbook pages as an A4 PDF',
  'Import from PDF, Excel, CSV or a photo of a paper logbook',
  'Licence, rating and medical expiry reminders',
  'Backups with an optional password',
  'Instructor tools',
];

export default {
  slug: 'logbook2.html',
  title: 'Logbook²',
  headTitle: 'Logbook²: the SA-CATS 61 pilot logbook that stays on your phone',
  description:
    'Logbook² is a pilot logbook app for South African pilots: fixed wing and rotorcraft, SA-CATS 61 pages, imports from other logbooks, expiry reminders and backups, with no account.',
  heroClass: 'sn page-flight',
  hud: false,
  jsonLd: [
    appNode(app, {
      description: 'A pilot logbook for South African pilots, with pages formatted to SA-CATS 61. Flights stay on the phone; there is no account.',
      category: 'UtilitiesApplication',
      features: FEATURES,
    }),
  ],
  body: [
    pageHead({
      crumb: { href: 'flight.html', label: 'All flight apps' },
      meta: `${app.kind} · ${app.status}`,
      title: 'Logbook²',
      lead: 'A pilot logbook for South African pilots. Pages are formatted to SA-CATS 61, and your flights stay on your phone. There is no account and no sign-in.',
      after: `<p class="fl-soon-line">Coming to the App Store and Google Play. ${linkQ('Get help', app.support)}</p>`,
      fig: appIcon(app, 192),
    }),
    log,
    hours,
    keep,
    pro,
    data,
    legal,
  ].join('\n'),
};
