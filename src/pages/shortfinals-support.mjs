import { site } from '../../site.config.mjs';
import { pageHead, sec, faqSec, linkQ } from '../kit.mjs';

// Short Finals support: the site's usual question-and-answer format (every
// answer is open in the HTML; site.js folds them), plus the seller details
// section 43 of the ECTA asks for. Facts match the app's legal pages
// (shortfinals-privacy.md and shortfinals-terms.md) and the app repo's draft,
// docs/store/support-page.md, which cites the code behind each answer.
// The two lines in "Study aid only" are the app's own wording (the app repo's
// docs/PLAN.md, Legal): keep them word for word.
const mail = `<a href="mailto:${site.contactEmail}">${site.contactEmail}</a>`;

const DISCLAIMER = "Study aid only. Use the POH for your aircraft's serial number and follow your instructor. Never use figures from this app for flight planning.";
const NOT_GOV = 'Not a government app. Short Finals is published by Tsamaya (Pty) Ltd and does not represent the South African Civil Aviation Authority (SACAA) or any other government body.';
const NOT_AFFILIATED = 'Cessna is a trademark of Textron Aviation Inc. Piper, Robinson, R22, R44, Sling and Diamond are trademarks of their respective owners. This app is not affiliated with or endorsed by any manufacturer or by SACAA.';

const aid = sec({
  id: 'aid',
  kick: 'Before you start',
  title: 'Study aid only',
  lead: DISCLAIMER,
  inner: `<p class="fine" data-reveal>${NOT_GOV}</p>
    <p class="fine" data-reveal>${NOT_AFFILIATED}</p>`,
});

const start = faqSec({
  id: 'start',
  kick: 'Getting started',
  title: 'The basics',
  faqs: [
    {
      q: 'Do I need an account?',
      a: 'No. There is no sign-in, and your progress stays on your phone.',
      open: true,
    },
    {
      q: 'What is free?',
      a: 'The first 15 questions of every pack, the first item of each kind of practice (worked examples, drills, weather reports and radio practice), one sample flight to plan, live weather reports, a 10-question sample exam for every paper, and every card you write yourself. The unlock screen shows how many questions are free in each pack before you pay.',
    },
    {
      q: 'Is this the real SACAA exam?',
      a: 'No. Our questions follow the format of the SACAA theory exams, but we wrote them ourselves from published sources. They are not SACAA exam questions, and Short Finals is not affiliated with or endorsed by SACAA.',
    },
  ],
});

const report = faqSec({
  id: 'report',
  kick: 'Mistakes',
  title: 'A question looks wrong',
  faqs: [
    {
      q: 'How do I report a problem with a question?',
      a: `Every question in Short Finals cites its source, and we check questions against those sources before they go in the app. Mistakes still slip through, so please tell us. Open the question and tap Report a problem. Choose what is wrong (the answer, the wording, the source or something else), add a note if you like, and tap Save the report. The app sends it to us. If your phone is offline, the report waits on your phone and goes by itself the next time you open the app with a connection. Until then you can also tap Share the report and email it to ${mail}. You'll see what we did about it in You › What changed.`,
    },
    {
      q: 'What should I put in the report?',
      a: 'If you think the answer is wrong, say which source you checked. Please leave out personal details. Where the regulations (CAR) and the AIP disagree, the exam follows the regulations, and the question tells you to ask your instructor.',
    },
    {
      q: 'Where do I see what has changed?',
      a: 'Changes to the question bank, rule changes and answers to your reports are listed in You › What changed.',
    },
  ],
});

const unlock = faqSec({
  id: 'unlock',
  kick: 'The unlock',
  title: 'Paying once',
  faqs: [
    {
      q: 'What does the unlock cost?',
      a: 'There is one unlock per licence, each a once-off payment. In South Africa the PPL unlock is R499.99 and the CPL unlock R999.99. The PPL unlock opens every PPL paper; the CPL unlock opens every CPL paper and the PPL papers its exams cover. Either one opens every aircraft and all the practice. If you already have the PPL unlock, CPL is a R499.99 upgrade, so both licences cost R999.99 either way. There is no subscription, and nothing renews.',
    },
    {
      q: 'I bought the unlock and it has gone.',
      a: 'Open You › Unlock Short Finals, or You › Settings, and tap Restore purchase. Use the same Apple ID or Google account you bought it with.',
    },
    {
      q: 'Can I use the unlock on more than one device?',
      a: 'Yes. It works on every iPhone and iPad signed in to the Apple ID that bought it, or every Android device with the Google account that bought it. Tap Restore purchase on each one. It does not carry over between Apple and Android devices, and Family Sharing doesn\'t apply to it.',
    },
    {
      q: 'I\'m an instructor. Can I use Short Finals free?',
      a: 'Yes, if you teach at a South African school. Open You › Instructor › Apply for a code. The app writes an email to admin@tsamayaapp.co.za in your email app. Attach a photo of your licence page that shows your instructor rating and send it. We check it and email you a code, which works on up to two of your devices. Enter it in You › Instructor › Enter your instructor code. The privacy policy says what we keep from your application and for how long.',
    },
    {
      q: 'Can I get a refund?',
      a: `The App Store or Google Play handles refunds, because they take the payment. On the App Store, ask at <a href="https://reportaproblem.apple.com" rel="noopener">reportaproblem.apple.com</a>, signed in with the Apple ID that bought the unlock. On Google Play, ask from the order history in your Google Play account, signed in with the Google account that bought it. If the store won't help, email us and we'll do what we can. This doesn't limit any right you have under the Consumer Protection Act or the Electronic Communications and Transactions Act.`,
    },
  ],
});

const phone = faqSec({
  id: 'phone',
  kick: 'Your phone',
  title: 'Backups, speech and notifications',
  faqs: [
    {
      q: 'How do I move to a new phone?',
      a: 'On iPhone or iPad, open You › Settings › Backup and tap Choose a backup folder (for example in iCloud Drive). On the new phone, tap Restore from a backup on the first setup screen, or later in You › Settings › Backup. On Android, Android\'s own backup to your Google account carries your study progress to the new phone. On either, you can also tap Back up now in You › Settings › Backup to save a backup file and restore it the same way. Then restore the purchase.',
    },
    {
      q: 'Radio practice can\'t hear me.',
      a: 'Speak needs the microphone and speech recognition permissions, and a phone that can recognise speech offline. Tap Allow the microphone when the app asks. If you said no before, allow both for Short Finals in your phone\'s Settings app (on Android, in the app\'s permissions in your phone\'s settings). If the app says speaking isn\'t available on this phone, it switches to Type: type your reply, or choose Pick.',
    },
    {
      q: 'Hourly questions don\'t arrive.',
      a: 'Check that notifications are allowed for Short Finals in your phone\'s settings, and that the hours (or set times) and days in You › Settings › Hourly questions include now. Tap Send a test question, then lock your phone: it arrives a few seconds later.',
    },
  ],
});

// The seller details section 43 of the Electronic Communications and
// Transactions Act 25 of 2002 asks for. The company details are the ones
// already on terms.html and logbook2-terms.html; nothing here is new.
const SELLER = [
  ['Full name and legal status', 'Tsamaya (Pty) Ltd, a private company registered in South Africa'],
  ['Registration number', '2023/990736/07'],
  ['Place of registration', 'South Africa (Companies and Intellectual Property Commission)'],
  ['Director', 'Kyle Kimble'],
  ['Physical address, also for service of legal documents', '10 Audocia Place, Hurlingham Manor, Sandton, 2196, South Africa'],
  ['Telephone', '073 285 5752'],
  ['Email', mail],
  ['Website', '<a href="index.html">tsamayaapp.co.za</a>'],
  ['Self-regulatory or accreditation bodies, codes of conduct', 'We are not a member of a self-regulatory or accreditation body, and have not signed up to a voluntary code of conduct.'],
  ['Alternative dispute resolution', 'We have not signed up to an alternative dispute resolution code. If we can\'t resolve a complaint with you, you may contact the National Consumer Commission or the Consumer Goods and Services Ombud.'],
  ['What we sell', 'Short Finals, a study app for the SACAA PPL and CPL theory exams and for training aircraft. The app is free; optional once-off in-app purchases unlock a licence: the PPL unlock opens every PPL paper, the CPL unlock every CPL paper and the PPL papers its exams cover, and either opens every aircraft and practice item.'],
  ['Price', 'In South Africa, R499.99 for the PPL unlock and R999.99 for the CPL unlock, or R499.99 to upgrade to CPL if you have the PPL unlock, each once-off and including VAT where the store charges it. No delivery costs. The store shows the final price before you confirm.'],
  ['How you pay', 'Through the App Store or Google Play, by the methods they accept. We never see your card or payment details, and the store\'s own security protects the payment.'],
  ['When you get it', 'An unlock opens as soon as the store confirms the payment.'],
  ['How long the agreement lasts', 'A once-off purchase with no subscription and no renewal.'],
  ['Your record of the purchase', 'The store emails a receipt and keeps the purchase in your account\'s purchase history.'],
  ['Refunds and returns', 'Through the store, as set out under "Can I get a refund?" above.'],
  ['Cooling-off', 'Our terms do not exclude the cooling-off period in section 44 of the Electronic Communications and Transactions Act. Where it applies, ask the store for a refund as set out above, or email us.'],
  ['Terms of use', '<a href="shortfinals-terms.html">Short Finals terms of use</a>'],
  ['Privacy policy', '<a href="shortfinals-privacy.html">Short Finals privacy policy</a>'],
];

const seller = sec({
  id: 'seller',
  kick: 'Seller details',
  title: 'Who sells Short Finals',
  lead: 'Given in terms of section 43 of the Electronic Communications and Transactions Act 25 of 2002.',
  inner: `
    <dl class="spec spec-wide" data-reveal>
      ${SELLER.map(([k, v]) => `<div><dt class="hud">${k}</dt><dd>${v}</dd></div>`).join('\n      ')}
    </dl>`,
});

const privacy = sec({
  id: 'privacy',
  kick: 'Privacy',
  title: 'Your study data stays on your phone',
  lead: 'Short Finals has no accounts, ads, analytics or crash reporting. The privacy policy explains the few things that leave your phone and your rights under POPIA. Our Information Officer is Kyle Kimble, ' + mail + '.',
  inner: `<p class="more" data-reveal>${linkQ('Short Finals privacy policy', 'shortfinals-privacy.html')}</p>`,
});

const contact = sec({
  id: 'contact',
  cls: 'tail',
  kick: 'Still stuck?',
  title: 'Write to us',
  lead: `Email ${mail} for help with the app, a question you think is wrong, the unlock or a complaint, and tell us what happened. If we can't sort it out, you may contact the National Consumer Commission or the Consumer Goods and Services Ombud, and for privacy complaints the Information Regulator (details in the privacy policy).`,
  inner: `<p class="more" data-reveal>${linkQ('Short Finals privacy policy', 'shortfinals-privacy.html')}${linkQ('Short Finals terms of use', 'shortfinals-terms.html')}</p>`,
});

export default {
  slug: 'shortfinals-support.html',
  title: 'Short Finals support',
  headTitle: 'Short Finals support and contact · Tsamaya',
  description:
    'Help for the Short Finals ground school study app: what is free, reporting a wrong question, restoring the unlock, refunds, moving to a new phone, and the seller details.',
  heroClass: 'sn page-faq',
  hud: false,
  body: [
    pageHead({ crumb: { href: 'shortfinals.html', label: 'Short Finals' }, meta: 'Support', title: 'Short Finals support', lead: 'The free sampler, wrong questions, the unlock, instructor codes, refunds and moving phones. Version 1.1. Effective date: 26 November 2026.' }),
    aid,
    start,
    report,
    unlock,
    phone,
    seller,
    privacy,
    contact,
  ].join('\n'),
};
