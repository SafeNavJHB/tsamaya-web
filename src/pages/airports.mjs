import { stats } from '../../site.config.mjs';
import { F } from '../faqs.mjs';
import { sec } from '../kit.mjs';
import { topicPage, prose, ul, table } from '../topic.mjs';

// Driving to and from the airport (added 2026-10-26, after the SEO audit asked
// for airport content). A problem-first page for people landing in a covered
// metro, often in a hired car and often after dark.
//
// Every claim is checked against the app repo:
//   - the drop-off rule: src/lib/arrivalPoints.ts (ARRIVAL_SITES, five airports,
//     2026-10-10, in every public build since build 28). An airport's map pin
//     sits between the runways and the nearest road is a service road; the app
//     ends a drive to the airport on its public drop-off road instead. The
//     measured cost of the pin: 7 km and 10 to 14 minutes to O.R. Tambo from
//     Sandton, Pretoria and Germiston.
//   - ratings by hour, after-dark warning, offline maps, SOS, sharing: facts.mjs.
// EDITORIAL RULE: roads and metros only, never a suburb; never "safe" as a promise.

const nMetros = stats.totals.metros;

const AIRPORTS = [
  ['O.R. Tambo International', 'Ekurhuleni, for Johannesburg and Pretoria', 'ekurhuleni.html'],
  ['Cape Town International', 'Cape Town', 'cape-town.html'],
  ['King Shaka International', 'Durban', 'durban.html'],
  ['Chief Dawid Stuurman International', 'Gqeberha', 'gqeberha.html'],
  ['Kruger Mpumalanga International', 'Kruger and the Lowveld', 'kruger.html'],
];

const landing = sec({
  id: 'landing',
  kick: 'Why the first drive matters',
  title: 'A new city, a hired car and often the dark',
  lead: 'The drive out of the airport is usually the one you know least: an unfamiliar car, roads you have not driven, and, on many flights, the evening or night ratings rather than the daytime ones.',
  inner: prose(
    `<p>Tsamaya rates every area in ${nMetros} South African metros three times, for daytime (05:00 to 17:30), evening (17:30 to 19:30) and night (19:30 to 05:00), and plans your route with the ratings for the hour you actually drive it. Ask for directions from the airport and it compares the fastest route with lower-risk options, grades each from A to E, and says what each one passes.</p>`,
  ),
});

const dropoff = sec({
  id: 'drop-off',
  kick: 'Going to the airport',
  title: 'It takes you to the drop-off road, not the middle of the runway',
  lead: 'An airport\'s point on a map sits between its runways. A navigator that routes to that point can end on a perimeter service road on the far side. At five airports, Tsamaya ends the drive on the public drop-off road instead.',
  inner: `${table({
    label: 'Airports where Tsamaya routes to the drop-off road',
    head: ['Airport', 'Metro'],
    rows: AIRPORTS.map(([a, m, h]) => [a, `<a href="${h}">${m}</a>`]),
  })}
    ${prose(`<p>Before this rule, a trip to O.R. Tambo from Sandton, Pretoria or Germiston was planned to the airport's map point and came out about 7 km longer and 10 to 14 minutes slower than the drive to the terminal. It applies when you pick the airport itself; a hotel, car hire desk or parking address at the airport has its own point and is routed to it as normal.</p>`)}`,
});

const before = sec({
  id: 'before',
  kick: 'Before you fly',
  title: 'Five minutes at home saves the arrivals hall',
  inner: prose(
    ul([
      'Install Tsamaya and download the offline map for the metro you are flying to, so the map keeps drawing where the signal drops. Planning a route needs data, so plan it on the airport Wi-Fi if your mobile data has not started yet.',
      'Save where you are staying, so the route from the airport is one tap.',
      'Add an emergency contact in Settings, so the SOS button can text them your location and a live link.',
      'Plan to share the trip with someone at home. They follow it in any browser and need no app.',
      'If the hired car has Apple CarPlay or Android Auto, Tsamaya runs on its screen.',
    ]),
    `<p>Tsamaya cuts your exposure to areas with a history of vehicle crime. It cannot make a drive safe, and lower risk is not no risk. Keep doors locked and windows up in slow traffic, and keep your own judgement about where and when to stop.</p>`,
  ),
});

const airportFaq = {
  q: 'Does Tsamaya work for the drive from the airport?',
  a: `Yes, when the airport is in one of the ${nMetros} metros it covers. It plans the trip with the ratings for the hour you drive, which after an evening flight are the evening or night ones, and compares the fastest route with lower-risk options. Going to O.R. Tambo, Cape Town International, King Shaka, Chief Dawid Stuurman or Kruger Mpumalanga, it ends the drive on the drop-off road.`,
};
const hireFaq = {
  q: 'Can I use Tsamaya in a hired car?',
  a: 'Yes. It runs on your phone, so the car does not matter. If the car has Apple CarPlay or Android Auto, connect your phone and Tsamaya shows on the car\'s screen.',
};

export default topicPage({
  slug: 'airports.html',
  title: 'Driving to and from the airport',
  description: `Lower-risk routes from O.R. Tambo, Cape Town International, King Shaka and other South African airports, rated for the hour you land, with drives that end on the drop-off road.`,
  meta: 'Airports · arrivals and departures',
  h1: 'Driving to and from the airport.',
  lead: 'Landing in Johannesburg, Cape Town, Durban or another covered metro? Tsamaya plans the drive out of the airport for the hour you land, and the drive back to the drop-off road.',
  sections: [landing, dropoff, before],
  faqs: [airportFaq, hireFaq, F.offline, F.share, F.guarantee],
  links: [['Driving here as a visitor', 'driving-in-south-africa.html'], ['CarPlay and Android Auto', 'carplay-android-auto.html'], ['Driving at night in Gauteng', 'night-driving-gauteng.html'], ['Coverage', 'coverage.html']],
  ctaTitle: 'Put it on your phone before you fly.',
});
