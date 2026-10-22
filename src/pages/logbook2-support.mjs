import { site } from '../../site.config.mjs';
import { pageHead, sec, faqSec, linkQ } from '../kit.mjs';

// Logbook² support: a short FAQ in the site's usual question-and-answer format
// (every answer is open in the HTML; site.js folds them). Facts match the app's
// legal pages: logbook2-privacy.md and logbook2-terms.md.
const mail = `<a href="mailto:${site.contactEmail}">${site.contactEmail}</a>`;

const start = faqSec({
  id: 'start',
  kick: 'Getting started',
  title: 'Bringing your flights in',
  faqs: [
    {
      q: 'How do I import my flights from TWS LOG?',
      a: 'In TWS LOG, export your logbook as a PDF. Save the PDF to the Files app on your iPhone, or open it directly in Logbook². Then, in Logbook², go to More › Import and pick the file. The flights are read on your phone and nothing is uploaded. Importing needs an active subscription or your 30-day free period.',
      open: true,
    },
    {
      q: 'Can I import from anything else?',
      a: 'Yes. Logbook² can also import an Excel file, a CSV file or a Logbook² backup. Pick the file in the same place: More › Import.',
    },
    {
      q: 'Is Logbook² approved by the SACAA?',
      a: 'No. Logbook² produces logbook pages and summaries formatted to the layout used under SA-CATS 61, but it is not approved, endorsed or certified by the South African Civil Aviation Authority, and no such approval scheme exists for electronic logbooks. You remain responsible for the accuracy and legal validity of your logbook, for entering flights in time, and for printing and filing your pages at least every 90 days. The full wording is in the ' + `<a href="logbook2-terms.html">terms of use</a>.`,
    },
  ],
});

const keep = faqSec({
  id: 'keep',
  kick: 'Printing and backups',
  title: 'Keeping your logbook safe',
  faqs: [
    {
      q: 'How do I print my logbook?',
      a: 'Go to More › Print Logbook. Share the result to AirPrint to print it, or save it as a PDF. Viewing, exporting and printing your existing data stay free, with or without a subscription.',
    },
    {
      q: 'How do I back up my logbook?',
      a: 'Go to More › Backup & Restore and create a backup. It is a file, and you decide where it goes. Keep it somewhere safe, for example in iCloud Drive. Logbook² has no cloud copy of your data and we cannot recover it for you, so a backup is your safety net. Backing up is always free.',
    },
    {
      q: 'How do I restore my logbook on a new phone?',
      a: 'Install Logbook² on the new phone. Make sure your backup file is on that phone, for example by opening iCloud Drive or the Files app. Then go to More › Backup & Restore and choose the backup file to restore.',
    },
  ],
});

const money = faqSec({
  id: 'money',
  kick: 'Subscription',
  title: 'Logbook² Pro',
  faqs: [
    {
      q: 'What does Logbook² Pro cost, and what do I get?',
      a: 'Logbook² Pro is R29.99 per month or R299.99 per year, renewing automatically through the App Store. Every new install gets 30 days free with all features. After that, adding, editing and importing flights needs an active subscription. Viewing, exporting, printing and backing up your existing data stay free forever.',
    },
    {
      q: 'How do I manage or cancel my subscription?',
      a: 'In your phone\'s App Store subscription settings (your Apple ID, then Subscriptions). Cancel at least 24 hours before the period ends to avoid being charged for the next one. Pro stays on until the end of the period you paid for.',
    },
    {
      q: 'I paid, but the app still asks me to subscribe.',
      a: 'Open the Subscription screen in the app and tap Restore Purchases. This works after a reinstall or on a new phone, as long as you are signed in with the Apple ID that bought it. If it still does not work, write to us.',
    },
    {
      q: 'Can I get a refund?',
      a: 'Refunds are handled by Apple (or Google, on Android) under their own refund policies, because they take the payment. We never see your payment details.',
    },
  ],
});

const contact = sec({
  id: 'contact',
  cls: 'tail',
  kick: 'Still stuck?',
  title: 'Write to us',
  lead: `Email ${mail}. We usually reply within two working days. Please tell us your iPhone model, iOS version and what you were doing when it went wrong. Do not send your whole logbook.`,
  inner: `<p class="more" data-reveal>${linkQ('Logbook² privacy policy', 'logbook2-privacy.html')}${linkQ('Logbook² terms of use', 'logbook2-terms.html')}</p>`,
});

export default {
  slug: 'logbook2-support.html',
  title: 'Logbook² support',
  description:
    'Help for the Logbook² pilot logbook app: importing from TWS LOG, printing, backing up and restoring your logbook, and managing your subscription.',
  heroClass: 'sn page-faq',
  hud: false,
  body: [
    pageHead({ meta: 'Support', title: 'Logbook² support', lead: 'Importing, printing, backups and your subscription. Version 1.0. Effective date: 22 October 2026.' }),
    start,
    keep,
    money,
    contact,
  ].join('\n'),
};
