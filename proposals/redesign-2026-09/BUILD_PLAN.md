# Build plan: the Sensor redesign of tsamayaapp.co.za

Written 2026/09/25. Status: plan agreed in principle, build not started.
Prototype: `proposals/redesign-2026-09/concept-4-sensor.html` (home and Johannesburg views, with the interactive map spike).
Owner decisions still open are listed in section 10; the plan assumes the recommended option for each.

## 1. What we are building

Rebuild the whole public site in the Sensor design: a dim, live 3D model of an illustrative city in which risk columns rise and fall with the clock and the emerald route bends around them. The page is driven by scrolling, and the South Africa map and a few other elements also respond to hover, click, touch and keyboard.

**Done means:**

- Every current page (home, how it works, see it, coverage, 12 metro pages, updates, technical, about, support, contact, get the app, privacy, terms and the live-trip tracker) is live on the new design, with all of today's content.
- `npm run build && npm run check` passes, and the check has been updated for the new number format (section 3.1).
- The home page on a mid-range Android phone (Galaxy A15 class):
  - largest paint within 2.5 s on a throttled 4G run;
  - layout shift under 0.1;
  - taps answered within 200 ms;
  - the 3D scene holds at least 45 frames a second in its light tier.
- The home page transfers at most about 600 KB compressed on first visit. Text-only pages transfer at most about 250 KB and never load the 3D library.
- Every interaction works with a mouse, a touch screen and a keyboard. Everything shown on the canvas is also available as real HTML text for screen readers and search engines. Reduced-motion users get a complete, still version.

## 2. Rules carried over from today's site (non-negotiable)

1. **Figures are never typed by hand.** Every number comes from `src/data/stats.json` through the build. This covers counts, bands, per-metro figures and the coverage outlines.
2. **No suburb is ever named or shown as risky.** The 3D city is procedural and labelled "Illustrative city". The South Africa map only shows whole metros: pillar height is rated areas (coverage), and the band rings are metro totals. Nothing finer than a whole metro appears anywhere.
3. **Lower-risk language, never "safe".** "Lower risk is not no risk" stays visible on the home page, and the disclaimer stays in the footer.
4. **The build has no dependencies.** `node build.mjs` must still run on a clean checkout without `npm install`.
   - Libraries are committed as files under `public/vendor/`, like the fonts are today.
   - Their versions and licences are recorded in `public/vendor/README.md`.
5. **Progressive enhancement.** Each page is complete as HTML and CSS; motion and 3D are an enhancement on top. If a script fails, the page still reads.
6. **Cookieless analytics only.** Cloudflare Web Analytics stays, and nothing new is added that would need a POPIA consent banner.
7. **The tracker stays safe.**
   - `track.html` keeps its `noindex`, stays out of the sitemap and keeps its no-referrer rule.
   - The universal-link files in `public/.well-known/` are untouched.

## 3. Architecture

### 3.1 Build and data (keep the current system, extend it)

- Keep `build.mjs`, `src/layout.mjs` and the one-file-per-page system in `src/pages/`.
- **Client code as plain ES modules, no bundler**, under `public/js/`:

  | File | What it does |
  |---|---|
  | `site.js` | Header, mobile menu, Lenis + GSAP wiring, text reveals, magnetic buttons, "Pause motion", the live South African clock |
  | `scene/engine.js` | Renderer, the single canvas, device tiers, adaptive quality, visibility pausing, context loss |
  | `scene/city.js` | The procedural city, the risk cells and the routes, ported from the prototype |
  | `scene/chapters.js` | The chapter clock `c`, the camera path, the scroll triggers |
  | `scene/explore.js` | The interactive South Africa map (section 5) |
  | `scene/poster.js` | The static SVG fallback |
  | `metro.js` | The metro pages |

- **Three.js as an ES module.** Use the current release (r186) instead of the deprecated r160 UMD file the prototype needed.
  - r186 ships no pre-minified file. Add a one-off `npm run vendor` step that uses esbuild as a devDependency, the same way `npm run images` uses sharp. It bundles only the Three.js classes the scene imports into `public/vendor/three.scene.min.js`.
  - That file is committed, so the site build itself stays dependency-free.
  - Measured on 2026/09/25: the whole of r186, bundled and minified, is 184 KB compressed. A trimmed bundle should come in well under that.
- **GSAP 3.15 (ScrollTrigger, SplitText) and Lenis 1.3** load as vendored files with `defer`. Measured together at 52 KB compressed. GSAP has been free for all use, plugins included, since version 3.13.
- **Data files written by the build**, never by hand:
  - `dist/data/site.json`: totals, and for each metro its slug, province, rated areas and high-risk counts for daytime, evening and night.
  - `dist/data/geo.json`: the South Africa outline and the metro outlines, already projected and rounded.

  The scene fetches these lazily after first paint, which keeps the HTML small. The few numbers in headlines are still written into the HTML at build time.
- **Number format.** Change `fmt()` in `site.config.mjs` to the South African style: a space as the thousands separator, written as a non-breaking space. Then update check 10 in `scripts/check-seo.mjs`, which currently looks for "4,396" with a comma and would start warning.
- **Fonts.** Self-host Archivo (variable, width and weight) and Martian Mono, Latin subset, preloaded. Both are under the SIL Open Font License. They replace Sora and Inter.
- **Tokens.** One colour and spacing token set at the top of `public/styles.css`, taken from the prototype:
  - navy-black `#0A0F1C`;
  - cool greys `#C9D6E3`, `#94A3B8`, `#414758`;
  - emerald `#34D399`, only for your route and the main action;
  - amber and red, only on risk cells.

### 3.2 Page shell (`src/layout.mjs`)

- **New header:** logo, five nav items and "Get the app". The mobile menu becomes a full-screen sheet.
- **Optional HUD frame per page**, with its corner readouts: the live South African time and band, "12 metros · 4 396 rated areas".
- **New footer:** the large "Go well." sign-off, all 12 metro links, legal links and the disclaimer.
- **Kept exactly:** canonical tags, Open Graph, JSON-LD, the Search Console verification tag, the analytics snippet, the skip link and `lang="en-ZA"`.

### 3.3 The scene engine (ported from the prototype)

- **One fixed canvas per page**, shared by the hero, the chapters and the explore map. Pages without 3D never load Three.js.
- **Three tiers, chosen at load:**
  - **Full:** about 70 000 points and 700 cells.
  - **Light:** about 20 000 points and 300 cells, lower resolution, no idle drift. Used for data saver, fewer than 4 CPU cores or less than 4 GB of memory.
  - **Static:** the SVG poster. Used for reduced motion, no WebGL or a lost graphics context.
- **Adaptive quality:** if the first 60 frames average over 20 ms, halve the points and lower the resolution.
- **Pausing:** the render loop stops when the canvas is off screen, when the tab is hidden, when nothing is moving, or when "Pause motion" is pressed.
- **Camera path:** every scene value stays a function of the chapter clock `c`, as in the prototype. It is the reason the choreography is easy to tune and to reverse.

## 4. Pages

| Page | Sensor treatment | Interactivity | Notes |
|---|---|---|---|
| **Home** | The hero scene. Three pinned chapters: the bend, three clocks, twelve metros. Then the explore map, inside the app, questions, get the app, ways to help | Hero band chips, route spotlight, pointer parallax, clickable day line, the explore map | Straight port of the prototype |
| **How it works** | The six real pipeline steps as camera stops in the illustrative city: fetch the fastest route, test it against the cells, check corridors, bypass waypoints, re-route and sanity-check, drive | "Try it": tap two points and watch a toy router bend around high cells (section 5.4) | Replaces the current timeline |
| **See it** | Real app screenshots in flat device frames, with HUD callouts pointing at parts of the UI | Hover a callout to highlight that part of the screen | Needs fresh captures (section 10) |
| **Coverage** | The explore map full screen, plus the metro list and the band switch | The full map interaction | This is where the map lives in full |
| **12 metro pages** | Generated from `src/data/metros.mjs`: title, band tabs, the metro's coverage outline as a slowly turning point cloud (outline only, no risk), intro, driving notes, roads, FAQs | Band tabs animate the light and the numbers | FAQ JSON-LD kept. The light tier uses the 2D outline |
| **Updates** | The changelog from `whats-new.json` as a HUD-style timeline | Filter chips by category (feature, fix, tweak) | No 3D |
| **Technical** | A spec sheet in HUD style, with a small animated pipeline diagram (SVG) | None beyond reveals | No 3D |
| **About** | Name and founder story over a quiet point outline of South Africa | None | Light 3D, or SVG only |
| **Support** | Free ways to help first, then the bank details | Copy buttons (kept) | No 3D |
| **Get the app** | Two large panels: Google Play first, TestFlight second | Detects Android or iPhone and lifts the matching panel | Privacy line next to the buttons |
| **Contact, Privacy, Terms** | Plain dark reading pages | None | Legal text still rendered from `src/content/*.md` |
| **Live trip (track.html)** | Restyled to the dark palette with a dark Mapbox style | Unchanged behaviour | Keep noindex, the token handling, polling and the Guardian waiting states |
| **404 (new)** | "Recalculating": the emerald route redraws around a missing block | Button back to home | GitHub Pages serves `404.html` automatically |

## 5. Interactivity

These rules apply to every interaction:
- **No hover-only information.** Anything that lights up on hover also works by tap and by keyboard, and is repeated as real HTML (a list, a card, a table).
- **One gesture per element.** Hover (or first tap) previews, click (or second tap, or Enter) commits, and Escape backs out.
- **Motion language.** Camera flights about 1.2 s on `power3.inOut`. Highlights 250 ms on `expo.out`. Interface feedback under 200 ms.
- **Metro-level data only.** Pillar height is rated areas; rings are high-risk totals for the band picked.

### 5.1 The South Africa map (home "Explore", and the coverage page)

| Action | What happens |
|---|---|
| Hover or focus a metro | Its pillar turns emerald and rises slightly. Its real coverage outline glows, a pulse ripples out once from its base, and the other pillars dim. An info card follows it: name, province, rated areas, three bars for the high-risk count in daytime, evening and night (the band in force now is marked), and a link to the metro page |
| Click, tap or press Enter | The camera flies to the metro and tilts the map. Its outline draws itself and fills with a faint emerald dot field. The card pins open. Clicking another metro flies straight across |
| The Gauteng cluster | Johannesburg, Pretoria, Ekurhuleni and West Rand, plus Rustenburg, Pilanesberg and Secunda, are too close at national scale. Hovering the area shows "Gauteng and surrounds: 7 metros"; clicking flies to a regional view where each one is easy to pick |
| Band switch (Daytime / Evening / Night) | A ring at the base of each pillar grows or shrinks with that metro's high-risk total for the band. Pillar height does not change |
| Escape or "Back to all 12" | The camera flies back to the national view |
| Metro list beside the map | Real buttons, synced both ways with the map. Arrow keys move, Enter flies in, and an `aria-live` line reads out the selection |
| "Use my location" (optional) | Asks the browser for location and highlights the nearest covered metro. It is worked out on the phone and never sent anywhere or stored |
| Reduced motion or no WebGL | The same list and card drive the SVG map: outlines highlight and no camera moves |

### 5.2 Hero

- **Band chips (Day / Evening / Night):** preview the other bands. The columns rise or fall and the light shifts. "Back to live" returns to the band in force now.
- **Route spotlight:** hover or focus the "Fastest · E" or "Lower-risk · D" callout. That route pulses, the other fades, and the real route-card numbers appear.
- **Pointer parallax:** the camera leans up to about 2.5 degrees toward the pointer. Fine pointers only; off on touch and with reduced motion.

### 5.3 Chapters

- **The day line in "Three clocks":** clicking any point on the 24-hour line scrolls to the moment the chapter shows that time. The band rows do the same.
- **Chapter rails:** each pinned chapter shows a progress rail, and its labels jump to that step.

### 5.4 "Try it" on How it works (Phase 4)

- **What the visitor does:** taps a start and an end point on the illustrative city.
- **What the toy router does:** a path search on the hex grid, where a high cell costs far more to cross. It draws the grey straight-line route and then the emerald bend, with a small readout: "2 high cells avoided, about +3 min".
- **How it is labelled:** "A toy version of the idea. The app uses real roads, real ratings and a limit on detours." This is a teaching device, not the real router.

### 5.5 Metro pages and everywhere else

- **Metro band tabs:** the point cloud's light and the big number animate together.
- **Everywhere else:** magnetic primary buttons on fine pointers, visible focus rings everywhere, the live time in the HUD, and a "Pause motion" control wherever something moves on its own for more than 5 seconds.

## 6. Performance budget

| Item | Budget (compressed) |
|---|---|
| Three.js, trimmed bundle | at most about 150 KB (the whole library is 184 KB). Home, how it works, coverage and metro pages only |
| GSAP + ScrollTrigger + SplitText + Lenis | 52 KB measured, all pages |
| Our own JS | at most 45 KB on the home page, at most 15 KB on text pages |
| Fonts (two families, Latin subset) | at most 90 KB |
| HTML + CSS | at most 60 KB per page |
| Images | at most 120 KB above the fold. AVIF with WebP and JPEG fallbacks, as today (`npm run images`) |
| Home total first visit | at most about 600 KB |

**Loading order on the home page:**
1. HTML, CSS and fonts.
2. The static poster, painted as the largest element.
3. GSAP and Lenis for the text reveals.
4. After first paint, at idle: Three.js and `geo.json`.
5. The canvas fades in over the poster once its first frame is drawn.

## 7. Accessibility and SEO checklist

- One `h1` per page, real text, never drawn on the canvas. Canvases are `aria-hidden`.
- Every interactive map state is mirrored in the list, the card and the live region.
- Visible focus, 44 px tap targets, WCAG AA contrast (including text over the scene, with a scrim).
- Reduced motion: no smooth scroll, no pinned scrubbing, no camera flights; end states or 200 ms fades.
- "Pause motion" wherever motion runs by itself.
- **Keep every `npm run check` invariant:**
  - canonicals and the sitemap agree;
  - JSON-LD on every page;
  - unique titles and descriptions;
  - image sizes and dimensions;
  - the tracker stays `noindex`;
  - the Search Console token is present.

  Add two checks: no page loads Three.js unless it has a canvas, and no page contains an em dash.
- A new 1200 x 630 social image from a still of the hero scene.

## 8. Phases

Estimates are working days for one developer. With Claude building in sessions, the speed limit is mostly review time, so each phase ends on a preview link for Kyle to click through.

| Phase | Scope | Done when | Estimate |
|---|---|---|---|
| **0. Foundations** | Vendored libraries with versions and licences; fonts; tokens; the new layout shell (header, menu, HUD, footer); `site.json` and `geo.json` written by the build; the number format and the check update; engine skeleton with tiers, pausing and the poster | Every existing page builds in the new shell with its current content; `npm run check` passes; no page loads Three.js yet | 2 to 3 days |
| **1. Home page** | Port the hero, the three chapters and the panel fades into modules. Hero band chips, route spotlight, parallax, clickable day line. Inside the app, questions, get the app, ways to help | Matches the prototype on desktop and phone; LCP and shift budgets met on a throttled run; reduced-motion and static tiers checked | 4 to 5 days |
| **2. The map** | The explore map on home and the full coverage page: hover, click, fly-in, the Gauteng cluster, band rings, synced list, live region, SVG fallback, optional "Use my location" | Every row of table 5.1 works with a mouse, touch and keyboard; screen reader walk-through done | 3 to 4 days |
| **3. Every other page** | Metro page template (12 pages), how it works, see it, updates, technical, about, support, contact, get the app, legal pages, tracker restyle, 404 | All pages on the new design; tracker tested end to end with a real shared trip | 5 to 6 days |
| **4. Extras** | "Try it" toy router; new social image; fresh app screenshots in the See it page | Toy router labelled and working on touch; screenshots show no suburb names under risk colours | 2 to 3 days |
| **5. Hardening and launch** | Device matrix (Galaxy A06 and A15, an older iPhone SE, a recent iPhone, a mid laptop on Chrome, Safari and Firefox); Lighthouse; accessibility pass; copy pass for banned words and dashes; staged review; merge to `main` | All "done means" items in section 1 are met and recorded | 2 to 3 days |

**Total:** about 18 to 24 working days.

**Branching:** build on one long-lived branch and merge to `main` once, at launch. The shell change touches every page, so a half-migrated live site would look broken.

## 9. Risks and what we do about them

| Risk | Mitigation |
|---|---|
| The 3D scene stutters on budget Android phones | Light tier, adaptive quality and the static poster are built in from Phase 0. The device test is a launch gate, not an afterthought. If the A06 cannot hold 45 fps in the light tier, it gets the poster and scroll-driven SVG instead |
| Search engines see less content | All text is HTML, the canvas only decorates, and metro pages stay static HTML with FAQ data. `npm run check` guards the invariants |
| Motion sickness | Slow, eased camera moves only, never constant orbiting. Reduced motion is honoured, and "Pause motion" is always on screen during long motion |
| Stigma from risk visuals | Procedural city, metro-level numbers only, the time-of-day framing, no alarm mechanics. This rule is written into section 2 and checked in review |
| Three.js or GSAP changes break things | Versions are pinned and vendored. Upgrades are deliberate, one library at a time |
| Tracker regression | It is restyled only; its behaviour is tested with a real shared trip before launch |
| Scope creep | Anything not in section 4 or 5 goes to a follow-up list, not into the launch |

## 10. Decisions for Kyle (the plan assumes the recommendation)

1. **Build system.** Keep today's zero-dependency static build with vendored libraries (recommended), or move to a framework such as Astro. A framework buys little here and adds a dependency tree to maintain.
2. **Preview links during the build.** Either private artifact links per phase (no setup, recommended to start), or connect Cloudflare Pages to the repository for automatic previews of every branch (free, about 15 minutes of setup).
3. **"Try it" toy router on How it works.** Include it in Phase 4 (recommended). It is the most memorable interaction on the site, and it is labelled as a toy.
4. **"Use my location" on the map.** Include it, processed on the phone only (recommended), or leave it out.
5. **Launch.** Once, after Phase 5 (recommended), or home page first. Home-first means running two designs side by side for a while.
6. **App screenshots.** New captures are needed. The June route-card capture still shows an old banner with a dash in it, and every capture is at night with suburb names under risk colours, so the site can only show cropped parts of them. A daytime set, taken in an area that shows no township names, would free the See it page.
7. **The name line.** Check "tsamaya sentle" (Setswana) and "tsamaya hantle" (Sesotho) with a first-language speaker before the new About page repeats it.

## 11. Out of scope for this build

- Changes to the app, the pipeline or the admin site.
- New content beyond what the site has today, apart from the 404 page and the "Try it" label.
- Sound, accounts, sign-ups, comments or anything else that would need consent under POPIA.
