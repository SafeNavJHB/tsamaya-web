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
      q: 'How do I import my flights from another logbook app?',
      a: 'Export your logbook from your current app as a PDF or Excel file. Save it to your phone\'s files, or open it directly in Logbook². Then, in Logbook², go to More › Import and pick the file. The flights are read on your phone and nothing is uploaded. Importing needs an active subscription or your 30-day free period.',
      open: true,
    },
    {
      q: 'Can I import from anything else?',
      a: 'Yes. Logbook² can also import an Excel file, a CSV file or a Logbook² backup, and it can read a photo of your paper logbook. Go to More › Import, choose Camera, lay the page flat in good light and take the photo. Text recognition runs on your phone. The app shows you every row it read and highlights anything it is not sure about, so you confirm or correct each of those before the flights are saved.',
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
      a: 'Go to More › Print Logbook. Print the result from the share sheet, or save it as a PDF. Viewing, exporting and printing your existing data stay free, with or without a subscription.',
    },
    {
      q: 'How do I back up my logbook?',
      a: 'Go to More › Backup & Restore and create a backup. It is a file, and you decide where it goes. Keep it somewhere safe, for example in iCloud Drive or Google Drive. We hold no copy of your data and cannot recover it for you. Backing up is always free.',
    },
    {
      q: 'Can Logbook² back up by itself?',
      a: 'Yes. On iPhone, go to More › Backup & Restore, choose a folder under Automatic backup, for example one in iCloud Drive. Logbook² saves your flights and records there on days you open it after a change, and keeps the last 14. On Android, your flights and records go to your Google account when Backup is on in your phone\'s settings. Both leave out photos and documents, so make a backup with them now and then. Automatic backups have no password.',
    },
    {
      q: 'Can I put a password on a backup?',
      a: 'Yes. Turn on Protect with a password before you create the backup. You need the password to restore it, and a backup made on iPhone opens on Android and the other way round. If you forget the password nobody can open that backup, and we cannot help you recover it.',
    },
    {
      q: 'How do I lock the app?',
      a: 'Go to More › App lock. Logbook² then asks for Face ID, your fingerprint or your phone\'s passcode when you open it and after a minute away. It uses your phone\'s own lock, so there is no separate PIN to forget.',
    },
    {
      q: 'How do I restore my logbook on a new phone?',
      a: 'Install Logbook² on the new phone. Make sure your backup file can be reached from that phone, for example in iCloud Drive or Google Drive. Then go to More › Backup & Restore and choose the backup file to restore.',
    },
  ],
});

const teach = faqSec({
  id: 'teach',
  kick: 'Instructors',
  title: 'Working with students',
  faqs: [
    {
      q: 'How do I send a flight to a student?',
      a: 'Open a saved flight that has a student on it and tap Send to student. Your student scans the QR code with their phone camera, or you can share it as a link. They need Logbook² installed. They check the flight and tap Save, and nothing is added to their logbook before that. Your remarks and your student\'s details are not sent.',
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
      a: 'Logbook² Pro is R29.99 per month or R299.99 per year, renewing automatically through the App Store or Google Play. Every new install gets 30 days free with all features. After that one logbook, printing, backups and restoring stay free. Pro adds your second logbook, imports, Excel export, instructor tools, the duty log, photos and documents, goals, reminders and the revalidation pack.',
    },
    {
      q: 'How do I manage or cancel my subscription?',
      a: 'In your phone\'s subscription settings: on iPhone, your Apple ID, then Subscriptions; on Android, Google Play, then Payments and subscriptions. Cancel at least 24 hours before the period ends to avoid being charged for the next one. Pro stays on until the end of the period you paid for.',
    },
    {
      q: 'I paid, but the app still asks me to subscribe.',
      a: 'Open the Subscription screen in the app and tap Restore Purchases. This works after a reinstall or on a new phone, as long as you are signed in with the Apple ID or Google account that bought it. If it still does not work, write to us.',
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
  lead: `Email ${mail}. We usually reply within two working days. Please tell us your phone model, its system version and what you were doing when it went wrong. In the app, More › About › Send feedback fills in the versions for you. Do not send your whole logbook.`,
  inner: `<p class="more" data-reveal>${linkQ('Logbook² privacy policy', 'logbook2-privacy.html')}${linkQ('Logbook² terms of use', 'logbook2-terms.html')}</p>`,
});

export default {
  slug: 'logbook2-support.html',
  title: 'Logbook² support',
  headTitle: 'Logbook² support and contact · Tsamaya',
  description:
    'Help for the Logbook² pilot logbook app: importing from PDF, Excel or a photo of your paper logbook, printing, backing up and restoring your logbook, and managing your subscription.',
  heroClass: 'sn page-faq',
  hud: false,
  body: [
    pageHead({ meta: 'Support', title: 'Logbook² support', lead: 'Importing, printing, backups, students and your subscription. Version 1.1. Effective date: 8 November 2026.' }),
    start,
    keep,
    teach,
    money,
    contact,
  ].join('\n'),
};
