import { stats, fmt } from '../../site.config.mjs';
import { F } from '../faqs.mjs';
import { sec } from '../kit.mjs';
import { POSITIONING, STANDOUT } from '../facts.mjs';
import { topicPage, prose, grid } from '../topic.mjs';

// Why Tsamaya (added 2026-10-28, Kyle: "find a way to differentiate while
// expressing the features we have"). The page a search engine or an assistant
// should land on for "risk-aware navigation app South Africa". RULE: it never
// says "first" or "only" (other South African apps already show crime maps and
// score routes; facts.mjs STANDOUT has the detail) and never names another
// safety app. It says what Tsamaya does, all of it, in one place.

const nMetros = stats.totals.metros;
const t = stats.totals;

const apart = sec({
  id: 'apart',
  kick: 'What sets it apart',
  title: 'Risk in every part of the drive',
  lead: 'A crime map tells you where trouble has been. Tsamaya uses that to plan the drive, guide it turn by turn, and help if something goes wrong.',
  inner: grid(STANDOUT),
});

const made = sec({
  id: 'made',
  kick: 'Made here',
  title: 'Proudly South African',
  inner: prose(
    `<p>Tsamaya is designed, built and run in Johannesburg by a South African company, for the way people drive here. Its ratings come from published South African Police Service crime statistics, scored against the roads of ${nMetros} metros: ${fmt(t.zones)} rated areas, ${fmt(t.corridorsSafe)} checked road stretches and ${fmt(t.corridorsDanger)} flagged ones, as of ${stats.asOf}.</p>`,
    `<p>The name is Sesotho and Setswana for "go", from <em>tsamaya sentle</em>, go well. It is a wish for a good journey, not a promise: lower risk is not no risk, and the app says so.</p>`,
  ),
});

const faqs = [F.different, F.local, F.avoid, F.free, F.guarantee];

export default topicPage({
  slug: 'why-tsamaya.html',
  title: 'Why Tsamaya',
  description: `Tsamaya is a risk-aware navigation app built in South Africa: ratings for the hour you drive, rated roads, graded routes, CarPlay and Android Auto, SOS and trip sharing, free in ${nMetros} metros.`,
  meta: 'Why Tsamaya',
  h1: POSITIONING,
  lead: `Tsamaya plans your route around areas with a history of vehicle crime, at the hour you drive, then guides you there turn by turn. It is free, it covers ${nMetros} South African metros, and it is made in Johannesburg.`,
  sections: [apart, made],
  faqs,
  links: [['Everything it does', 'features.html'], ['How it works', 'how-it-works.html'], ['Coverage', 'coverage.html'], ['About us', 'about.html']],
  ctaTitle: 'Go well.',
});
