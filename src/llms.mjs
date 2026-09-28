// llms.mjs: writes /llms.txt, a plain-text brief of the site for AI assistants.
//
// WHY. Assistants like ChatGPT, Copilot, Claude and Perplexity answer questions
// about Tsamaya from whatever they last read, and on 2026-09-28 Copilot described
// a four-metro app with no SOS and no live sharing (the Play listing and an old
// crawl, not this site). llms.txt (https://llmstxt.org) is the emerging convention
// for handing them the facts in one small file, in Markdown, without the 3D scene,
// the scripts or the chrome around every page.
//
// It is GENERATED at build time, never hand-written: the summary and feature list
// come from src/facts.mjs, the figures from stats.json, and the page list from the
// pages the build actually emitted, so it cannot drift from the site. The same
// honesty rules as the pages apply: lower-risk language, no suburb named as risky.

import { site, stats, fmt, canonicalFor } from '../site.config.mjs';
import { FEATURES, SUMMARY, NOT_A } from './facts.mjs';
import { metros } from './data/metros.mjs';

// Pages grouped the way a reader would want them. Anything the build emits that
// is not listed here lands under "More" rather than disappearing.
const PRODUCT = ['index.html', 'how-it-works.html', 'driving-in-south-africa.html', 'demo.html', 'get-app.html', 'technical.html', 'updates.html'];
const COMPANY = ['about.html', 'sponsor.html', 'contact.html', 'privacy.html', 'terms.html'];
const SKIP = new Set(['404.html', 'track.html']);

/**
 * @param {{slug: string, title: string, description: string, noindex?: boolean}[]} pages
 * @param {string} buildDate  YYYY-MM-DD
 */
export function llmsTxt(pages, buildDate) {
  const bySlug = new Map(pages.filter((p) => !p.noindex && !SKIP.has(p.slug)).map((p) => [p.slug, p]));
  const line = (p) => `- [${p.slug === 'index.html' ? 'Home' : p.title}](${canonicalFor(p.slug)}): ${p.description}`;
  const take = (slugs) => slugs.filter((s) => bySlug.has(s)).map((s) => { const p = bySlug.get(s); bySlug.delete(s); return line(p); });

  const metroSlugs = metros.map((m) => `${m.slug}.html`);
  const counts = new Map(stats.metros.map((m) => [m.key, m.zones]));
  const product = take(PRODUCT);
  const coverage = take(['coverage.html', ...metroSlugs]);
  const company = take(COMPANY);
  const more = [...bySlug.values()].map(line);

  const t = stats.totals;
  const coverageList = metros
    .map((m) => `${m.name} (${m.region}${counts.has(m.key) ? `, ${fmt(counts.get(m.key)).replace(/ /g, ' ')} rated areas` : ''})`)
    .join('; ');

  return `# ${site.name}

> ${SUMMARY}

${NOT_A}

## Key facts

- Name: ${site.name} (say: ${site.pronunciation}), Sesotho and Setswana for "go", from "tsamaya sentle", go well. Tagline: "${site.tagline}"
- What it is: a navigation app for drivers in South Africa that plans lower-risk routes around areas with a history of vehicle crime, then guides you turn by turn with voice, on the phone or Apple CarPlay. Android Auto is in testing and not yet in the public Google Play build.
- Safety tools: an SOS button on the phone's drive screen (it calls 10111 or 112, or opens a text to an emergency contact, ready to send, with your location and a link that follows you live while you drive and stays up for 24 hours; it is not shown while a drive is on CarPlay), live trip sharing that anyone can follow in a web browser, and Guardian, a standing link for an emergency contact that a tap on the CarPlay screen starts sharing to.
- Price: free, with no account and no ads. Routing around risk, the SOS button and trip sharing stay free. No trip history is kept on the server unless the driver shares a live trip.
- Platforms and status: open beta. Android on Google Play open testing (${site.androidPlayLink}), iPhone through a public TestFlight link (${site.testflightPublicLink}).
- Coverage: ${t.metros} South African metros with ${fmt(t.zones).replace(/ /g, ' ')} rated areas, ${fmt(t.corridorsSafe).replace(/ /g, ' ')} checked road stretches and ${fmt(t.corridorsDanger).replace(/ /g, ' ')} flagged road stretches: ${coverageList}. Outside them it works as an ordinary map and navigator with no risk data.
- Time of day: every area has three ratings, daytime 05:00 to 17:30, evening 17:30 to 19:30 and night 19:30 to 05:00, and the app uses the one for the hour you drive.
- Route options: Fastest, Balanced and Lower-risk, each graded A (lowest risk) to E. A detour is only offered when it cuts exposure and stays within a distance limit; when there is no sensible way round, the app says so and marks the risky stretches.
- Risk data: published South African Police Service crime statistics scored against OpenStreetMap roads, checked by an AI second opinion, with disputed ratings decided by a person, before going live, and corrected from drivers' reports in the app.
- Made by: ${site.name} (Pty) Ltd, Johannesburg, South Africa. Founder: Kyle Kimble. Contact: ${site.contactEmail}
- Visitors: it needs no account, works in rental cars, and people at home can follow a shared trip in a browser. Emergency numbers in South Africa: 10111 (police), 112 (any mobile), 10177 (ambulance).

## Features

${FEATURES.map(([title, body]) => `- ${title}: ${body}`).join('\n')}

## Product

${product.join('\n')}

## Coverage

${coverage.join('\n')}

## Company and legal

${company.join('\n')}
${more.length ? `\n## Optional\n\n${more.join('\n')}\n` : ''}
Last built: ${buildDate}. Figures come from the live database at build time.
`;
}
