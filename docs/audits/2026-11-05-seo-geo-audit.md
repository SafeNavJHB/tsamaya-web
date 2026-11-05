# SEO and AI search audit: findings and response (5 November 2026)

An external audit (ChatGPT, public retrieval only) reported mixed-age content for tsamayaapp.co.za and asked where the stale text really lives. This file records the answer, with evidence, so the next audit starts from facts. It is not published: `docs/` is outside the site build.

## Root cause

**The live site was not stale. The old counts live in other companies' search indexes, and in our own store listings.**

| Stale phrase in the audit | Live site (origin, 5 Nov 06:58 UTC) | Where it actually lives |
|---|---|---|
| "15 metros", "14 metros", "5,172 areas" | Absent from every page tested | Third-party search and AI snapshots of older builds. The site moved to 22 places on 3 Nov. |
| "Android Auto is in testing" | Absent | Older snapshots. `/features.html` says "Yes, from version 1.8 on Google Play". |
| Older place list | Current on the site | **Google Play listing: a real defect.** Last updated 29 Sept, names 14 of the 22 places. |
| "dangerous zones", "major metropolitan areas" | Absent | **TestFlight beta description: a real defect.** Off-brand wording, and its privacy link is the old github.io forwarder. |

### What is confirmed and what is not

- **Confirmed:** origin HTML is current, and identical for every user agent tested (below).
- **Not yet confirmed:** what Google's own index holds per page. That needs Search Console URL Inspection, which needs Kyle's sign-in (see Open items).
- **Measured on 5 Nov:** Anthropic's web search still returns no page from the domain, the same as 15 Oct. It has no submission tool, so this one is outside our control.

## Technical audit sheet

Measured with curl from Johannesburg on 5 Nov 2026 at 06:58 UTC. The site is GitHub Pages behind Fastly, with no WAF or bot management.

| URL | Status | Cache | Canonical | Robots | Schema nodes |
|---|---|---|---|---|---|
| `/` | 200 | max-age=600 | self | index,follow | Organization, WebSite, WebPage, MobileApplication, FAQPage |
| `/coverage.html` | 200 | max-age=600 | self | index,follow | as above + BreadcrumbList |
| `/features.html` | 200 | max-age=600 | self | index,follow | as above + BreadcrumbList |
| `/faq.html` | 200 | max-age=600 | self | index,follow | as above + BreadcrumbList |
| `/carplay-android-auto.html` | 200 | max-age=600 | self | index,follow | as above + BreadcrumbList |
| `/technical.html` | 200 | max-age=600 | self | index,follow | no BreadcrumbList (**added**) |
| `/johannesburg.html` | 200 | max-age=600 | self | index,follow | WebPage, FAQPage, BreadcrumbList + site nodes |
| `/mthatha.html` | 200 | max-age=600 | self | index,follow | WebPage, FAQPage, BreadcrumbList + site nodes |

| Check | Result |
|---|---|
| Crawler access | Googlebot, OAI-SearchBot, ChatGPT-User, GPTBot, bingbot, ClaudeBot, PerplexityBot and an iPhone browser all got 200 and a **byte-identical** `/features.html` (md5 `9da9c3c5...`). |
| Edge consistency | Four repeat fetches of `/coverage.html` across three Johannesburg edges gave one ETag. |
| Stale HTML | Cannot persist: `max-age=600`, so at most 10 minutes after a deploy. No change needed, and GitHub Pages does not let us set this anyway. |
| Redirects | `http://`, `www` and `http://www` all reach `https://tsamayaapp.co.za/` in one 301. |
| `robots.txt` | 200. Allows everything, names 15 AI crawlers with the same rules, declares the sitemap. Unchanged. |
| `sitemap.xml` | 200, valid, 55 URLs matching the indexable canonicals (already enforced by `check-seo`). |
| Rendering | All facts are in the raw HTML. No JavaScript is needed to read them. |
| `hreflang` | None, correctly: one language. |
| `/features` and `/index.html` | GitHub Pages also serves these with a 200, and their canonicals point to the right URL. Harmless. |
| Other search tools | IndexNow pings Bing on each deploy, and Bing Webmaster Tools is set up. Unchanged. |

### Real defects found on the site

1. **Dates that lied.** Every changelog entry re-dated 19 topic pages (their "as of" line and `dateModified` were the newest changelog date), and any footer or stylesheet change re-dated all 55. All 55 sitemap dates fell within two days. Search engines discount dates that move together.
2. **`/technical.html` described an older app.** It said routes are tested "for the current time" (each part has been scored at the hour it is driven since September) and that only higher-risk areas trigger a detour.
3. **No limits or method in one place.** Sources, grades and limits were scattered across FAQ answers, and nothing said evening and night ratings are estimates.
4. **Price wording disagreed.** `/get-app.html` said "free while in beta", the FAQ said it stays free, and Google Play shows an unexplained "In-app purchases" label.
5. **Schema warning.** `slogan` is not a property of `MobileApplication` (Schema.org validator: 0 errors, 1 warning).
6. **No machine-readable dates.** No page used `<time>`.

An independent read of the new method copy against the pipeline and app code, before anything shipped, also caught overstatements in lines already live: "however short the stretch" (the red floor is 50 m) and "thrown out" (an opt-in longer card can still offer that road). Both are corrected.

## Changes made

| Change | Where | Rollback |
|---|---|---|
| One content-based date per page: sitemap, `dateModified` and a visible `<time>` line agree, and `check-seo` fails if not | `build.mjs`, `src/layout.mjs`, `src/topic.mjs`, `scripts/check-seo.mjs` | Revert the PR. Entries with `basis` are ignored by the old code's hash compare, so pages re-date once. |
| Method, grades, limits and five real trips on the technical page; stale routing rules corrected | `src/pages/technical.mjs`, `src/data/route-examples.json` | Revert the PR |
| One source for availability, method numbers and limits | `src/facts.mjs` | Revert the PR |
| Availability line with a checked date | get-app, CarPlay page, `llms.txt` | Revert the PR |
| Live stats refreshed: 9 015 rated roads (was 8 796), 5 Nov | `src/data/stats.json` | Revert, or `npm run stats` |
| `slogan` removed from the app node; breadcrumb added to the technical page | `src/seo.mjs`, `src/pages/technical.mjs` | Revert the PR |
| `npm run check:facts`: site against app repo and stores | `scripts/check-facts.mjs` | Delete the script |

Deliberately not done, because the audit's own anti-patterns or the evidence ruled them out: no rewrite of current pages, no robots change, no cache change, no new `llms.txt` strategy, no invented rating, and no new city pages.

## Schema report

Validated with the Schema.org validator against the live `/features.html`: **0 errors, 1 warning** (`slogan`, now removed). Google's app rich result needs a real rating or review, and the app has none on the web, so the node states facts and earns no star snippet. That is correct, and no rating should ever be added to change it. `offers.price` is 0 and true today; `MobileApplication` carries `installUrl` for both real install paths. `Organization` has `legalName`, `sameAs` (LinkedIn, Instagram) and `disambiguatingDescription`, which separates us from other uses of the word Tsamaya.

Google's Rich Results Test is interactive: run it once on `/` and `/faq.html` after the deploy.

## Store listings: text ready to send

### Google Play: HOLD until the version code 31 verdict

**Do not change the Play listing while version code 31 is in review.** Both Play support replies (cases 2-5186000041582 and 3-7166000042210, 4 Nov) say any new submission resets the review clock, and it has already been 10 days. A listing edit is a submission. Send this straight after the verdict.

Short description: unchanged.

In the full description, replace the "Ratings cover" paragraph with:

> Ratings cover Johannesburg, Pretoria, Ekurhuleni and the East Rand, the West Rand, Cape Town, Stellenbosch, Durban, Pietermaritzburg, Gqeberha, East London, Port Alfred, George, Mossel Bay, Beaufort West, Mthatha, Bloemfontein, Polokwane, Rustenburg, Pilanesberg and Sun City, Secunda, eMalahleni and Middelburg, and the Kruger National Park with Mbombela and the Lowveld. Everywhere else it works as an ordinary map and navigator.

Under "On the road", add:

> • Android Auto: the same routes and voice guidance on your car's screen.

Under "Privacy", add:

> Routing around risk, the SOS button and trip sharing stay free.

Then update `AVAILABILITY` in `src/facts.mjs` if the version changed, and run `npm run check:facts`.

### TestFlight beta description

Current: "Tsamaya is designed to be a navigation app for South Africans, to assist in routing around dangerous zones and roads within the major metropolitan areas, expanding across South African cities". Privacy link: the old github.io forwarder.

Proposed:

> Tsamaya is a navigation app for South African drivers. It plans routes around areas with a history of vehicle crime, using ratings that change with the time of day, in 22 places across South Africa, and guides you turn by turn on your phone and on Apple CarPlay. Lower risk does not mean safe: it gives you better information, and every driving decision stays yours. More at tsamayaapp.co.za.

Privacy link: `https://tsamayaapp.co.za/privacy.html`. It names no other platform, in line with the App Store rule.

## Release checklist

After a new place, a new store release, or a change to grades or time bands:

1. `npm run stats`, and the new-metro steps in the README if a place was added.
2. `npm run build && npm run check`. This is the deploy gate.
3. `npm run check:facts`. This compares the site with the app repo and the stores. It is not a deploy gate, because a lagging store listing must never block the site.
4. If it flags a store listing, update the listing, remembering that a Play change is a review submission.
5. **When 1.12.0 reaches the App Store:** `check:facts` fails on purpose. Update `AVAILABILITY`, `PREMIUM_NOTE` and `PREMIUM_SOON` in `src/facts.mjs`, the get-app page and the `installUrl` list.
6. After a big content change, request indexing in Search Console for the pages that matter. Do not repeat it for the same URL.

## Monitoring baseline

Repeat on or after **5 December 2026**, in a new chat each time, and record date, provider, answer, cited URL and whether it is correct. Answers vary by provider and time, so read the trend, not one result.

| # | Question | Claude web search, 5 Nov | ChatGPT | Copilot | Gemini |
|---|---|---|---|---|---|
| 1 | Is there a navigation app that considers hijacking risk in South Africa? | Not named | | | |
| 2 | Which navigation apps offer lower-risk route options in Johannesburg? | Not run | | | |
| 3 | Can I use Tsamaya in Cape Town? | Not run | | | |
| 4 | Does Tsamaya work with Android Auto? | Not run | | | |
| 5 | Does Tsamaya work with Apple CarPlay? | Not run | | | |
| 6 | Is Tsamaya free? | Not run | | | |
| 7 | How does Tsamaya calculate route risk? | Not run | | | |
| 8 | Does Tsamaya guarantee that a chosen route is safe? | Not run | | | |
| 9 | How does Tsamaya differ from Waze or Google Maps? | Not run | | | |
| 10 | Can I share my trip or use SOS in Tsamaya? | Not run | | | |

A direct "Tsamaya navigation app South Africa lower-risk routes" search through Claude's web search on 5 Nov found no page from the site, and no result on the app at all.

Score each answer: named for the category (discovery), correct on place, availability and risk claims (accuracy), cites current official pages (evidence), links to a working install path (conversion).

## Open items

- **Search Console:** record, for `/coverage.html`, `/features.html` and `/faq.html`, the last crawl, the user-declared and Google-selected canonicals, and indexed against live content. Then request indexing for those three plus `/technical.html`.
- **Play listing:** send the text above after the version code 31 verdict.
- **Independent coverage:** South African motoring, tech, insurance and fleet press is worth more than any change here. Earned, never bought. Not started.
