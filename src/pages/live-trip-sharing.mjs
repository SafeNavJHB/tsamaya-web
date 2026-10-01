import { F } from '../faqs.mjs';
import { sec } from '../kit.mjs';
import { topicPage, prose, ul, table } from '../topic.mjs';

// Live trip sharing, the SOS link and Guardian (added 2026-10-01). Facts: facts.mjs
// (Share a trip, SOS), the changelog entries of 27 June (the link closes after
// arrival) and 2 July (Guardian), docs/LINK_SHARING_AND_LIVE_TRIPS_SPEC.md in the
// app repo, and the Privacy policy on this site. The tracker page itself
// (track.html) is noindex on purpose: its URL carries the share token.

const how = sec({
  id: 'how',
  kick: 'Share a trip',
  title: 'A link anyone can open in a browser',
  lead: 'No account, no app for the person watching, and nothing to set up beforehand.',
  inner: prose(
    ul([
      'Start a drive, tap share, and send the link by any messaging app.',
      'The person who opens it sees your route, where you are now, your arrival time, and a full-screen Arrived message when you get there. It works in any browser, in any country.',
      'The link stops updating when you arrive and closes shortly after, so it cannot be used to follow you afterwards.',
    ]),
  ),
});

const kinds = sec({
  id: 'kinds',
  kick: 'Three ways to be followed',
  title: 'Trip link, SOS link and Guardian',
  inner: table({
    label: 'Ways to be followed',
    head: ['', 'What it is', 'When it is sent'],
    rows: [
      ['Trip link', 'A link for one drive that you send to anyone.', 'When you choose to share a trip.'],
      ['SOS link', 'The SOS button opens a text to your emergency contact, ready to send, with your location and a link that follows you live while you drive and stays up for 24 hours. The button also calls 10111 or 112.', 'When you press SOS and send the text yourself.'],
      ['Guardian', 'One standing link for your emergency contact. Switching it on from the CarPlay screen lets them follow that drive: your route, live position and the moment you arrive. From version 1.8, in testing now, it lives in the car map\'s SOS menu.', 'When you switch it on from the car screen.'],
    ],
  }),
});

const privacy = sec({
  id: 'privacy',
  kick: 'Privacy',
  title: 'What is kept, and who can see it',
  inner: prose(
    ul([
      'There is no account, and no trip history is kept on our servers unless you choose to share a live trip.',
      'The link is the only key. Anyone who has it can see the trip while it is live, so send it only to people you trust.',
      'Sharing ends when you arrive or stop the share, and the link then shows the Arrived screen instead of your position.',
    ]),
    `<p>The full detail is in the <a href="privacy.html">privacy policy</a>. Trip sharing needs a data connection. Tsamaya is not an emergency response service: it does not dispatch anyone itself.</p>`,
  ),
});

const faqs = [F.share, F.sos, {
  q: 'Does the person following me need to install Tsamaya?',
  a: 'No. The link opens in any browser on any phone or computer. They see your route, your live position, your arrival time and an Arrived screen.',
}, {
  q: 'How long does a shared trip link last?',
  a: 'A trip link updates while you drive, stops when you arrive or end the share, and closes shortly after. An SOS link follows you while you drive and stays up for 24 hours.',
}, F.privacy];

export default topicPage({
  slug: 'live-trip-sharing.html',
  title: 'Live trip sharing',
  description: 'Share a live Tsamaya trip with anyone in a browser: no app or account needed to watch, an Arrived screen at the end, plus the SOS link and Guardian, and what is kept.',
  meta: 'Trip sharing · SOS · Guardian',
  h1: 'Let someone follow your drive.',
  lead: 'Send a link and the person at home follows your drive live in any browser, down to an Arrived screen. The SOS button and Guardian use the same idea for emergencies.',
  sections: [how, kinds, privacy],
  faqs,
  links: [['Features', 'features.html'], ['CarPlay and Android Auto', 'carplay-android-auto.html'], ['Visiting South Africa', 'driving-in-south-africa.html'], ['Privacy policy', 'privacy.html']],
});
