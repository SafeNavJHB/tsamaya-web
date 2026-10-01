import { F } from '../faqs.mjs';
import { sec } from '../kit.mjs';
import { topicPage, prose, ul, table } from '../topic.mjs';

// Speed cameras and speed traps (added 2026-10-01). Facts come from the changelog
// entries of 25 June, 26 June, 2 July, 9 August, 4 and 6 September and 18
// September 2026, and from assets/data/speed_cameras_v1.json in the app repo,
// which calls itself NOT exhaustive. Never promise coverage; never encourage
// speeding.

const what = sec({
  id: 'what',
  kick: 'On the map',
  title: 'Known fixed cameras, with a heads-up',
  lead: 'Fixed speed cameras show as pins on the phone map, the car map and the CarPlay mini map, with a spoken "speed camera ahead" as you approach one.',
  inner: prose(
    ul([
      'Settings, Navigation, Speed cameras lets you keep the pins and choose the voice alert: every camera ahead, only when you are near the camera\'s limit (about eight seconds out, with a "check your speed" nudge), or off.',
      'It also works without a route. In free drive, on the phone or the car screen, Tsamaya warns about fixed cameras coming up on the road you are driving.',
      'Cameras the app knows are switched off show greyed out. Johannesburg\'s automated cameras have been off since December 2025, after the city\'s contract with its camera supplier ended, and tapping one explains that.',
    ]),
  ),
});

const honest = sec({
  id: 'coverage',
  kick: 'Coverage',
  title: 'A list of the cameras we know about',
  lead: 'It is not a complete list, and it is better in some places than others.',
  inner: prose(
    `<p>Open map data is dense for fixed cameras in Cape Town and thin in Gauteng, so the list starts from what is known and grows from drivers\' reports. Known fixed positions have been added around Durban (the N2, N3, M7 and Umhlanga Rocks Drive), Sun City and Mossel Bay. The speed limit each camera enforces is shown where it is known, and drivers can suggest the limit for one that has none.</p>`,
    `<p>A camera that is not on the map may still be there. Speed limit signs on the road always come first.</p>`,
  ),
});

const reports = sec({
  id: 'reports',
  kick: 'Reporting',
  title: 'Cameras and vans, kept current by drivers',
  inner: table({
    label: 'Speed camera reports',
    head: ['What you report', 'What happens'],
    rows: [
      ['A permanent camera', 'Added to a review queue and put on the map automatically once a few drivers flag the same place. A person reads reports before anything changes.'],
      ['A camera van', 'Shown in amber for about three hours from when it was spotted, and never turned into a permanent camera. Tap one and say "still there" to keep it up for others, or "not there" to take it down.'],
      ['A switched-off camera that is working again', 'Tap the greyed-out pin and report it. A few reports switch it back to a live camera.'],
      ['By voice', 'Tap Report, then Speak, and say "speed camera". It goes through the same Undo as a tap, on the phone and on the car screen.'],
    ],
  }),
});

const faqs = [F.cameras, F.vans, F.voice, {
  q: 'Why does Tsamaya show greyed-out cameras in Johannesburg?',
  a: 'Johannesburg\'s automated speed cameras have been switched off since December 2025, when the city\'s contract with its camera supplier ended and the equipment was removed. Tsamaya greys them out and says so when you tap one, rather than warning you about a camera that is not working.',
}, F.guarantee];

export default topicPage({
  slug: 'speed-cameras.html',
  title: 'Speed cameras',
  description: 'Speed cameras on the Tsamaya map: known fixed cameras with a spoken heads-up, camera vans reported by drivers for about three hours, and honest limits on coverage.',
  meta: 'Speed cameras · speed traps',
  h1: 'Speed cameras and speed traps.',
  lead: 'Tsamaya marks the fixed speed cameras it knows about, says so as you approach, and lets drivers report cameras and camera vans. It is a list of what is known, not a complete one.',
  sections: [what, honest, reports],
  faqs,
  links: [['Features', 'features.html'], ['Protests and road closures', 'closures-and-protests.html'], ['Hijacking hotspots', 'hijacking-hotspots.html'], ['CarPlay and Android Auto', 'carplay-android-auto.html']],
});
