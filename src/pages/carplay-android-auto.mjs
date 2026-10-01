import { F } from '../faqs.mjs';
import { sec } from '../kit.mjs';
import { topicPage, prose, ul, grid } from '../topic.mjs';

// CarPlay and Android Auto (added 2026-10-01). Everything under "CarPlay" is
// checked against the changelog (20 Aug, 29 Aug, 11 Aug, 2 Jul, 17 to 26 Sep
// 2026). Android Auto stays "in testing" until a build with it reaches Google
// Play open testing, exactly as facts.mjs, llms.mjs and the home page say. The
// SOS wording copies the careful two-halves form used on the home page.

const carplay = sec({
  id: 'carplay',
  kick: 'Apple CarPlay',
  title: 'The same trip, on the car screen',
  lead: 'Tsamaya runs on your iPhone and the car shows it. Routes, voice and alerts are the same as on the phone.',
  inner: grid([
    ['Route options', 'Pick Fastest, Balanced or Lower-risk from the car, each with its A to E grade and what it passes. The Fastest route appears within a few seconds, with the lower-risk options filling in behind it.'],
    ['Risk border', 'The screen edge takes the colour of the area you are in. Turn cards show orange and red whenever they apply, and calmer colours only near the turn.'],
    ['Pins and notices', 'Speed camera and hotspot pins, road closure and reroute notices, and traffic notices, with a spoken heads-up for cameras and hotspots.'],
    ['Report and Search', 'A Report button for police, roadblocks, speed cameras and crashes, by tap or by voice, with a few seconds to Undo. Search and Settings stay on the car screen during a drive.'],
    ['Mini map', 'The CarPlay dashboard shows a live mini map with your speed, the road and the area\'s risk, even when Tsamaya is not open on the main car screen.'],
    ['Day and night', 'The map follows the car\'s own day or night appearance. Satellite imagery and an optional full 3D map are in Settings.'],
    ['Turns over other apps', 'With music or another app full screen, the next turn appears as a banner as it comes up and again just before you reach it.'],
    ['Guardian', 'A standing link for your emergency contact. Switch it on from the car screen and they can follow that drive live.'],
  ]),
});

const aa = sec({
  id: 'android-auto',
  kick: 'Android Auto',
  title: 'In testing',
  lead: 'Android Auto is built and testers drive with it, but it is not in the public Google Play build yet.',
  inner: prose(
    `<p>The Android Auto screen has the same route list with grades, turn cards, speed dial, risk border, Report and Settings buttons, voice reports, and spoken directions on the car's navigation volume. When it reaches the public build, this page and the app's listing will say so.</p>`,
  ),
});

const sos = sec({
  id: 'sos',
  kick: 'Emergencies',
  title: 'SOS and CarPlay',
  inner: prose(
    `<p>In the current release the SOS button is on the phone's drive screen and is not shown while a drive is on CarPlay, so dial 112 from the phone there. From version 1.8, in testing now, it stays on the phone during a CarPlay or Android Auto drive and the car map gets its own SOS button whose menu holds Guardian.</p>`,
  ),
});

const needs = sec({
  id: 'needs',
  kick: 'What you need',
  title: 'Setup',
  inner: prose(
    ul([
      'An iPhone on iOS 16.4 or later with Tsamaya installed, and a car or head unit with Apple CarPlay.',
      'No separate car app to install: connect the phone as you normally do and open Tsamaya on the car screen.',
      'A data connection to plan a new route. Download offline maps for the places where the signal drops.',
    ]),
  ),
});

const faqs = [F.carplay, F.aa, F.sos, F.offline, F.voice];

export default topicPage({
  slug: 'carplay-android-auto.html',
  title: 'CarPlay and Android Auto',
  description: 'What Tsamaya does on Apple CarPlay: graded route options, risk border, speed camera and hotspot pins, closure notices, voice reports and Guardian. Android Auto is in testing.',
  meta: 'CarPlay · Android Auto',
  h1: 'Tsamaya on your car screen.',
  lead: 'Apple CarPlay shows the same lower-risk routes, voice guidance and alerts as the phone. Android Auto is in testing.',
  sections: [carplay, aa, sos, needs],
  faqs,
  links: [['Features', 'features.html'], ['Live trip sharing', 'live-trip-sharing.html'], ['Speed cameras', 'speed-cameras.html'], ['Get the app', 'get-app.html']],
});
