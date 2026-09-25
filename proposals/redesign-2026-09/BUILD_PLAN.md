# Build plan: the Sensor redesign of tsamayaapp.co.za

Written 2026/09/25. Status: Phases 0 to 3 done (2026/09/25); Phase 4 next.
Preview of the branch build (private): https://claude.ai/artifact/UML9VQcPGy26gfbXSJUjj7, republished at the end of each phase.
Prototype: `proposals/redesign-2026-09/concept-4-sensor.html` (home and Johannesburg views, with the interactive map spike).
Owner decisions were settled on 2026/09/25 and are recorded in section 10.

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

### 5.5 What the prototype taught us (2026/09/25)

The map, hero chips, route spotlight and clickable day line are built in the prototype. They were tested with a mouse, touch at 390 px and the keyboard, with no page errors. Lessons to carry into the build:

- **Band rings only on the national view.** Zoomed in, a ring sized for the whole country becomes a big red circle over a city, which reads like a risk zone drawn on real ground. The prototype now fades the rings out as the camera zooms in, and the card carries the numbers.
- **Pillars shrink as the camera zooms in**, or they fill the view.
- **On phones, the info card sits under the map** with the back button above it; there is no room beside the metro at 390 px.
- **The "Three clocks" chapter only covers 05:00 to 23:00.** A click on the day line before 05:00 goes to the night end. In the build, either extend the chapter to 04:59 or label the line.
- **The explore map scrolls with the section** once it passes the top of the screen, so pointer targets stay lined up with the pillars.
- **No count-ups (found in Phase 0).** Today's `public/app.js` records why they were removed: a screenshot taken mid-count showed "117 risk zones" for Cape Town, which had 918. A site whose argument is that every figure comes from the live database must never display a number that is not true, even for a frame.
  - The prototypes count through in-between values (1 372 up to 2 525, 4 down to 2).
  - In the build, numbers switch between real values only: a quick digit flip or crossfade from one true figure to the next.
  - Bars, rings, columns and light can still move smoothly.

### 5.6 Metro pages and everywhere else

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
| **2. The map** | The explore map on home and the full coverage page: hover, click, fly-in, the Gauteng cluster, band rings, synced list, live region, SVG fallback | Every row of table 5.1 works with a mouse, touch and keyboard; screen reader walk-through done | 3 to 4 days |
| **3. Every other page** | Metro page template (12 pages), how it works, see it, updates, technical, about, support, contact, get the app, legal pages, tracker restyle, 404 | All pages on the new design; tracker tested end to end with a real shared trip | 5 to 6 days |
| **4. Extras** | "Try it" toy router; new social image; fresh app screenshots in the See it page | Toy router labelled and working on touch; screenshots show no suburb names under risk colours | 2 to 3 days |
| **5. Hardening and launch** | Device matrix (Galaxy A06 and A15, an older iPhone SE, a recent iPhone, a mid laptop on Chrome, Safari and Firefox); Lighthouse; accessibility pass; copy pass for banned words and dashes; staged review; merge to `main` | All "done means" items in section 1 are met and recorded | 2 to 3 days |

**Total:** about 18 to 24 working days.

**Branching:** build on one long-lived branch and merge to `main` once, at launch. The shell change touches every page, so a half-migrated live site would look broken.

### Phase 0 record (2026/09/25)

**Built:**
- Vendored libraries and `npm run vendor`:
  - GSAP 3.15.0 with ScrollTrigger and SplitText;
  - Lenis 1.3.26;
  - a trimmed Three.js r186 module at 141 KB gzipped.
- Archivo and Martian Mono, self-hosted and trimmed with fontTools to 79 KB together.
- The new layout shell:
  - header with five primary items;
  - full-screen phone menu;
  - live South African time strip;
  - "Go well." footer.
- The dark token set, with the older components remapped onto it.
- `public/js/site.js`, replacing `app.js` with every feature carried over.
- The engine skeleton: `public/js/scene/tier.js` and `engine.js`.
- The build now writes `data/site.json` and `data/geo.json`.
- Numbers use the South African format.
- `npm run check` has the number-format fix and two new checks: no em dash outside the legal pages, and no 3D library on a page without a canvas.

**Verified:**
- `npm run check` passes.
- Both new checks fail on a planted em dash and on a planted script tag.
- All 25 pages load with no script errors and no sideways scroll at 360 px.
- The menu opens, moves focus and closes on Escape.
- The engine was exercised in a test page: it renders, pauses on "Pause motion", resumes, and falls back to the poster on a lost graphics context.

**Deviation from the plan:**
- Three.js is imported by relative path (`../../vendor/three.scene.min.js`) instead of through an import map. Same result, one less moving part.
- Pages that do not use the scene never request it.

### Phase 1 record (2026/09/25)

Built by an agent in the cloud session from `handoff/phase1-spec.md`, then reviewed, fixed and measured in a local session on the Mac (`handoff/HANDOFF.md`).

**Built:**
- The home page in the Sensor design (`src/pages/index.mjs`): hero, the three pinned chapters, inside the app, coverage, questions, get the app and ways to help, with a marked seam for the Phase 2 explore map.
- `src/poster.mjs` and `public/js/scene/citygen.js`: one generator for the illustrative city, shared by the build-time SVG poster and the 3D scene (byte-identical in Node and the browser).
- `public/js/home.js`, `scene/city.js` and `scene/chapters.js`: tiers, the scene, the chapter clock, the band chips, the route spotlight, pointer parallax and the clickable day line, which now covers the whole day from 05:00.
- `src/data/route-card.json`: the chapter 1 figures (decision 8).

**Fixed in review** (against the prototype and at more screen sizes than it was built for):
- **Chapter 3 on wide screens.** The text column lines up with the header (130 px in at 1440 wide, 370 px at 1920), not the prototype's 56 px, and the country is sized by the screen's height, so the note and the Cape Town label ran over the west coast. The camera now fits South Africa beside the text: the largest zoom (at most 1) and the smallest shift that keep every coast point and metro label clear of the text and inside the frame, allowing for the idle sway (`saFit` in `chapters.js`). It is measured once per screen size and again after every re-pin, so it follows a window resize. The chapter 3 panel is narrowed to its text, so the progress rail stops short of the map too.
- **Short laptop windows.** A 1366 x 768 laptop (the commonest size) shows about 625 to 660 px of page under the browser's toolbars, and there the buttons and the disclaimer ran into the fixed "12 metros" HUD line; the prototype has the same fault. Below 880 px tall the headline is now sized by the window's height as well as its width, from a measured text budget (`p1/herobudget.mjs`), with more room below it under 1024 px wide (where the disclaimer reaches under the "Illustrative city" and Pause motion corner) and tighter gaps under 660 px tall.
- **Hero tags on the text.** At 375 x 667 (iPhone SE) the "Lower-risk" tag covered the "Tsamaya (say: ...)" line, and in desktop windows under about 1100 px wide the tags landed on the headline or the sub-text (the routes pass behind the text column there). A hero tag now never sits on a line of hero text: on phones the tags stay between the band chips and the text, side by side when there is room for one row only, and hide where there is none (320 x 568); on wider screens a tag moves right past the line it would cover, or hides if that would take it off screen. This holds while the hero scrolls away, too. The spotlight card used to flip left onto the headline in windows 768 to 1100 px wide; it now takes the first free place beside, under or above its tag, and only where there is none (a portrait tablet, an 800 x 600 window) does it open over the sub-text.
- **Chapter 3's metro labels** (Kyle, in review). Six labels with their counts overlapped on smaller maps. A label now shows the metro's name; its count opens under it on hover, a tap or a click (which pins it), and the six-metro list with every count is now visible in the panel on desktop too, so nothing is hover-only. Each row is a button: hovering, focusing or pressing it opens that metro's label and lights its pillar emerald (the others dim), which is the same list-and-map pairing Phase 2's explore map will use (`highlight()` in `city.js`). Labels that would still overlap give way, larger metros first, and come back when their row is used; a label that would leave the screen or touch a HUD corner hides, and a count that would run into the bottom corner opens above its name. Which labels show is decided at the camera's pose without the idle sway, with a little hysteresis, so none of them blinks.
- **Faded panels.** After its pin, each chapter's panel fades out but its buttons still took clicks. A faded panel now lets the pointer through; it stays in the page for screen readers, and tabbing back into it brings its chapter back into view.
- **Layout shift when the fonts arrive.** With the fallback font the headline set in two lines and with Archivo in three, so the bottom-aligned hero jumped up by 40 px on phones and 118 px on desktop when Archivo landed. The headline's three lines are written in, the say line breaks where it wraps on phones, the button row always stacks below 350 px wide, and new fallback faces sized to the web fonts' widths keep every other line where it is: `Archivo Fallback` (Arial, Helvetica, Roboto) and `Martian Mono Fallback` (Menlo, Consolas and the other common monospace fonts), with `size-adjust` measured (`p1/fontwidth.mjs`, `p1/monowidth.mjs`) and Archivo's character range, so a glyph Archivo lacks (the arrow in "4 -> 0") still comes from the system font. Measured: no hero element moves at 21 screen sizes from 320 to 1920 wide.
- **The header logo** was the 51 KB, 512 px `icon.png` shown at 30 px on every page; it is now a 1 KB 96 px copy (`img/icon-96.png`). The About page keeps the large one.
- **Footer "Admin" link contrast** (every page): 2.37:1 with 45% opacity, now `--fg-2`, which passes AA.
- **The test tools** in `handoff/tools/` run on the Mac: paths are relative to the repo, output goes to `tools/out/` (ignored), the CDN stub is a no-op, and Lighthouse uses the real GPU (`GL=swiftshader` restores the cloud's software rendering, which turns GPU work into CPU time and inflated the blocking time from about 0.15 s to 8.9 s).

**Verified** (tools in `handoff/tools/`; numbers from the final run):
- `npm run check` passes; the copy lint finds 0 hits on the home page, and no suburb name appears anywhere on it.
- Interactions (`p1/interact.mjs`): 34 of 34 pass, with a mouse, a tap at 390 px and the keyboard, in the full and static tiers, including Pause motion, the lost-context fall back and the day line at 02:00.
- Numbers only ever show true values (`p1/numbers.mjs`, sampled every frame at 1440 and 390): the stat is always 4 or 0, the count always 1 372, 1 524 or 2 525.
- Panels hold at full opacity for their whole pin and fade after it; text over the scene passes AA; no sideways scroll at 360 px in any tier, with or without JavaScript.
- Matches the prototype at 1440 x 900 and 390 x 844 (`p1/compare.mjs`), apart from the deliberate changes above and the header and footer from Phase 0.
- Fallbacks: reduced motion, `?tier=static` and JavaScript off each give a complete, readable page, and reduced motion never requests Three.js.
- All 25 pages load with no script errors, no sideways scroll and no broken images at 360 and 1440 wide (`p1/pages.mjs`).
- The hero's text keeps at least 12 px from the HUD corners and the spotlight tags at every size probed from 320 x 568 to 1920 x 1080, laptop browser windows included (`p1/herofit.mjs`).
- Chapter 3 keeps text, labels and country apart, with no label over another or off screen, from 800 x 600 to 3440 x 1440 and on portrait tablets (`p1/fitprobe.mjs`); its fit after a resize equals a fresh load (`p1/fitresize.mjs`); the label and list interactions pass with a mouse, the keyboard and a tap (`p1/labels.mjs`, 14 checks).
- Five rounds of adversarial review by a separate agent, each attacking the previous round's fixes; every confirmed finding is fixed above, and a final pass re-ran every reproduction they wrote plus `tools/suite.sh`, all clean.

**Performance** (throttled mobile Lighthouse: Moto G Power screen, 4x CPU slowdown, slow 4G):

| Measure | Budget | Result |
|---|---|---|
| Largest paint | 2.5 s or less | 2.3 s simulated (three runs), 2.0 s with real throttling |
| Layout shift | 0.1 or less | 0, with simulated and with real throttling |
| Home transfer over a full scroll | about 600 KB | 423 KB phone, 456 KB desktop, 252 KB with reduced motion (no Three.js) |
| Our own JS, gzipped | 45 KB or less | 43 KB: under budget, but Phase 2's map needs room, so plan a trim or a minify step for our own modules |
| HTML + CSS, gzipped | 60 KB or less | 48 KB |

Lighthouse scores on the final run: performance 93 to 97, accessibility 100, SEO 100, best practices 96. The best-practices points go to the analytics beacon refusing localhost (not an issue on the live domain) and to `vendor/lenis.min.js` naming a source map that was not vendored (strip that comment in `npm run vendor`). Measured on the real GPU; the cloud session's software rendering had shown 4.9 s and 8.9 s of blocking time, which was the rendering, not the page.

**Deviation from the plan:**
- Portrait tablets (768 to about 1100 px wide and taller than wide) get the desktop side-by-side layout, as in the prototype, and it does not suit them: callouts clip at the right edge, chapter 2's count crowds its label, and in chapter 3 the country is small (zoom 0.3) and one label gives way. Landscape phones (844 x 390 and the like, which are over 768 wide) and windows under 600 px tall overflow the hero under the HUD corners. Neither is part of Phase 1's "desktop and phone"; both are listed for Phase 5, where the device matrix gains a tablet and a landscape phone. The likely fix is the stacked phone layout for any screen taller than it is wide or under about 560 px tall.

### Phase 2 record (2026/09/25)

Built and reviewed in a local session on the Mac. Preview: https://claude.ai/artifact/UML9VQcPGy26gfbXSJUjj7 (version 3).

**Built:**
- One "Explore the 12 metros" section (`src/explore.mjs`) on two pages:
  - the home page, after chapter 3, drawn by the story's own scene;
  - the coverage page, which now opens on it, full screen, with its h1 and a scene of its own inside the section.
- Without JavaScript it is the metros as links to their pages. With it, `public/js/explore.js` runs the parts that work in every tier:
  - the rows become buttons (one tab stop; the arrows, Home and End move along it);
  - the band switch, the card, the Escape key and the "Back to all 12" button;
  - an `aria-live` line that reads out each pick, the regional view and the way home;
  - in the static tier, an SVG map drawn from `data/geo.json`, with each metro's real coverage outline, a dot and a ring.
- `public/js/scene/explore.js` draws the 3D map on the pillars:
  - each metro's coverage outline as a glowing ribbon that draws itself on when picked, then fills with faint emerald dots;
  - a ring at each pillar's base for the band's high-risk count, at national scale only;
  - one ripple on hover;
  - the Gauteng cluster: pointing at it names the seven metros, a click flies to a regional view;
  - camera flights of 1.2 s (a cut with Pause motion on), and the card following the metro.
- On the coverage page, `scene/country.js` builds South Africa and its pillars with `scene/sa.js`, which is split out of the home page's `city.js`, so the two maps match point for point. `public/js/coverage.js` loads it at idle; the static tier never downloads Three.js.
- The build now strips comments and indentation from our own scripts on their way into `dist/` (`scripts/strip-js.mjs`; `npm run check:js` proves with esbuild that every script means the same after). That took our own JS from 43 KB to 29 KB gzipped before the map was added.

**Decided in the build:**
- **The coverage page has one layout in every tier,** so nothing moves when the 3D map arrives: heading and list on the left, the map in the stage on the right. The card is written into the HTML with the first metro's figures, the ones the script shows first, so it keeps its height when the script takes over.
- **Under 1024 px wide the section stacks** on both pages (phones and tablets): the map, then the card, then the heading and the list. The card docks over the foot of the map on the home page and has its own place under it on the coverage page. Beside the list, a map narrower than that left a pinned card nowhere to go but over the rows. In this layout, a row tapped low in the list scrolls the map and its card back into view.
- **Keyboard:** the list is one tab stop. Up and down move along it, left and right cross its two columns, and Enter flies in. Tab from a row goes on into its card's link, and the card stays up around it. Enter never scrolls the page, so focus stays in view.
- **Pause motion** sits under the coverage map, because its idle sway runs on its own in the full tier.

**Fixed in review** (rounds of adversarial review by a separate agent, which reproduced its findings in the browser):
- A pinned card could flip left over the list rows at 768 to 1150 px wide, where it also took the clicks meant for them. Fixed by the stacked layout under 1024, and on wider screens the card never goes left of the stage.
- Chapter 3's pinned metro lost its emerald pillar after a trip into the explore map and back. The map now hands the pillars' highlight back.
- In the static tier, "Back to all 12" sat on the card's title on the home page, and at 768 to 1000 px the coverage page's card covered the button and the Gauteng outlines.
- The band switch's "Now" chip was set once at load, so across a band boundary (17:30, say) it disagreed with the card. Both now follow the clock.
- On a short window, a card picked after scrolling the coverage page could open under the header.
- Crossing the phone breakpoint (a phone turning round) left the coverage card in the wrong state.
- If `data/geo.json` failed, the home page's card stuck at the window's corner under the header. The section now keeps its list and a card in its own place.
- Round 2, mostly tablets (768 to 1023 px), which the stacked layout newly brought to the home page:
  - the HUD's bottom corner and its Pause motion button sat over the list's right column. In chapter 4 that corner now fades out and the section's own Pause motion takes over, under the map;
  - a window resize could drop the reader's pick, and a picked metro kept its old framing after a tablet turned round;
  - chapter 3's pinned pillar turned white as soon as the explore map started to take over. It now blends across;
  - landing on the section (a link to `#explore`, or a reload there) showed a layout shift of up to 1.0 when the scene arrived, because the section changed layout at that moment. It now takes the 3D layout while the page is read in;
  - the static map pushed the list down when it loaded in the stacked layout (a shift of 0.20). Its place is now kept.
- Round 3, mostly the moments before the map exists:
  - with the scene's layout taken early, a pick made before the map was built showed no card, and a slow or missing data file left the card under the header or on top of Back. Until the map is built, the card now sits in the stage and shows the pick, and Back and Pause motion wait for the map;
  - on common phones (360 to 430 px) the card's "Now" or "Selected" tag pushed one band's figure onto the next. The tag now has a line of its own;
  - leaving the section just after a phone's toolbar came back (a resize) kept the pick on the way back into chapter 3;
  - at 320 px Back and Pause motion overlapped; the HUD's Pause lost keyboard focus when it made way for the section's.
- Round 4:
  - a metro picked before the map was built was never flown to once the map arrived. It is now, on both pages;
  - WebGL detection accepted WebGL 1, but the vendored Three.js needs WebGL 2, so a WebGL 1 browser (iOS 14 Safari, say) downloaded the scene only to fall back to the static tier on every visit. It now asks for WebGL 2 and gets the static tier straight away;
  - after a click on the HUD's Pause (which focuses it), the corner stayed over the list. It is now only held for keyboard focus;
  - on a phone on its side, Back and Pause were lifted under the header; with the card docked on a short screen, Tab into its link landed under the header too.
- Round 5:
  - closing the mobile menu with Escape also reset the map and announced "All 12 metros.". Escape now follows focus: inside the section it always belongs to the map; from elsewhere only when nothing else used it and the section is on screen;
  - pressing the card's link with a mouse scrolled it out from under the pointer, so the click missed; a quick second Tab was overridden by the same scroll. That scroll now happens only for keyboard focus, and at once;
  - on phones, Back and Pause stuck under the header over the card while the list scrolled.
- Round 6:
  - on a short laptop (1366 x 657), tabbing to the coverage map's Pause scrolled the map out of view, and the arrow keys centred each row, which did the same. Pause now sits in the first screen, the arrows scroll only as far as needed, and a picked metro is framed into the part of the map in the window;
  - the card could cover "Back to all 12" (1024 to 1150 px wide), or open under the header after a scroll, and on the home page the HUD clock painted over its title;
  - in the static tier on phones, Back covered the Western Cape metros on the map;
  - a pin left in chapter 3 swallowed the first Escape meant for the explore map.
- Round 7:
  - round 6's "keep Back and the card in view" had no lower limit, so on the coverage page they followed the reader past the section and sat over "Pick a metro", where the pinned card blocked a link. They now stop at the stage's foot and scroll away with it;
  - at common laptop sizes the pinned card covered the pillar of the metro just picked (11 or 12 picks of 12 at 1280 x 720). The card now keeps clear of the pillar, base to top;
  - "Back to all 12" on a scrolled coverage page framed the country partly under the header; with motion paused, Back did not follow the scroll; a hover could stick after the pointer left the map.
- Round 8:
  - at iPad-landscape widths (1024 to about 1140 px) the stage is too narrow for the card beside a metro in its middle, so most picks still put the card on the pillar. A pick there now frames the metro (or the Gauteng cluster) to the left of the card's width;
  - the coverage scene kept drawing at 60 frames a second while scrolled far off screen, because its idle sway kept the loop busy past the engine's off-screen pause. It now stops, and a scroll redraws only while the section is on screen;
  - after "Back to all 12" on a scrolled page, scrolling back up left the country framed low.

The review loop stopped after round 8. Every finding of rounds 1 to 8 is fixed; round 8's findings were fixed and re-checked with the reviewer's own probes, but no ninth round was run on those fixes. The rounds had narrowed to short windows and rare timing, and a real click-through is now the better check.

**Verified** (tools in `handoff/tools/`):
- `p2/explore.mjs home` and `p2/explore.mjs coverage`: 34 checks each, every row of table 5.1, all passing on both pages:
  - with a mouse, the keyboard, and touch at 390 px (phone) and 820 px (tablet), plus every pick at 1024 px, where the stage is narrowest;
  - in the 3D tier and the static tier;
  - with no page errors.
- The coverage page shows no layout shift on load at 1440 and 390 wide, in the full, light and static tiers.
- A lost graphics context mid-session falls back to the SVG map and keeps the metro picked.
- Without JavaScript, the coverage page lists all 12 metros as links, with no sideways scroll.
- Screen reader walk-through (the accessibility tree, both tiers):
  - the page's h1;
  - the band group, with the pressed state;
  - "The 12 metros" list, whose buttons read like "Cape Town 909 rated areas";
  - the live line after a pick ("Johannesburg, Gauteng. 800 rated areas. Daytime: 315 rated high risk.");
  - the card as a group named after its metro, ending in a link to the metro page.

  The 3D and SVG maps are hidden from assistive tech, because the list and the card carry the same information.
- Budgets (gzipped):

  | Measure | Budget | Home | Coverage |
  |---|---|---|---|
  | Our own JS | 45 KB or less | 43.1 KB | 24.6 KB (8.7 KB in the static tier) |
  | HTML + CSS | 60 KB or less | 53.2 KB | 36.1 KB |

  The review fixes cost about 1.6 KB of the home page's JS, which leaves under 2 KB of headroom. Phase 3 adds no JS to the home page, but Phase 4's "Try it" router goes on How it works, so this is worth watching.

**Performance** (throttled mobile Lighthouse as in Phase 1, on the real GPU):

| Measure | Budget | Home | Coverage (three runs) |
|---|---|---|---|
| Largest paint | 2.5 s or less | 2.3 s | 2.0 to 2.1 s |
| Layout shift | 0.1 or less | 0 | 0 |
| Blocking time | (none set) | 130 ms | 60 ms and 160 ms, and 1.97 s on the first run |
| Transfer on load | about 600 KB | 403 KB | 367 KB |
| Performance score | | 97 | 99, 96, and 71 on the first run |

Accessibility scores 100 on both. The first coverage run had one 2-second task at the scene's first frame, which the next two runs did not repeat. It looks like a cold start (the GPU compiling the shaders for the first time), which a first-time visitor could also meet. Compiling the shaders ahead of the first frame (`renderer.compileAsync`) is worth trying during the Phase 5 device checks, on both pages.

**Left for later:**
- The rest of the coverage page (the metro cards, the chart, the questions) keeps its current content until Phase 3. The copy lint's one hit on it, "Mapped risk zones per metro" in the chart, belongs to that pass.
- `src/map.mjs`'s old `coverageMap()` has no caller now; remove it in Phase 3 along with its CSS.
- Known edges, left as they are:
  - A first visit that lands straight on `/#explore` with no WebGL 2, or where Three.js cannot load, shows one layout shift when the page settles on the static tier. Return visits remember the tier.
  - On a phone on its side (under about 420 px tall) the docked card covers most of the map, Back sits over the card's top edge, and the HUD clock can touch the card's corner. Phase 5 takes landscape phones, as it does for the hero.
  - At a metro's zoom on a phone, its pillar runs past the top of the map.
  - A short laptop window scrolled so deep that less than about 330 px of the map shows: there is no room for both the card and Back, so the card moves right and Back may sit over its left edge.

### Phase 3 record (2026/09/25)

Built in a local session on the Mac, in five batches, each published to the preview as it landed (versions 4 to 8).

**Built:**
- **A page kit** (`src/kit.mjs`): a page header (telemetry line, display headline, lead, and optionally a figure beside it), sections with a kick, the FAQ, the two store panels with the privacy line, arrow links, copy buttons, and a contents list for the legal text. The home page's flow-section styles now apply to every page with `body.sn` (the home page included), and every inner page sets `hud: false`: its header carries the telemetry line.
- **Contact, Get the app, Support, Privacy and Terms.** Get the app lights the store panel for the visitor's phone without moving anything. Support leads with the free ways to help and shows the bank details as a spec sheet with copy buttons, and keeps the `#help`, `#donate` and `#sponsor` anchors other pages link to. The legal pages have a contents list beside the text; their words still come from the app repo's `legal/*.md`.
- **A 404 page, "Recalculating"**: the grey route runs into a missing block and the emerald one bends round it. `noindex`, out of the sitemap, with `<base href="/">` so it styles itself at any depth on GitHub Pages.
- **The 12 metro pages** and the coverage page's lower half. Each metro page draws the metro's own coverage outline with a dot fill (outline only), beside a band switch and one big number: the areas rated high risk in each part of the day, the band in force first, switching by crossfade between true figures (`public/js/metro.js`). Then its driving notes, questions, the store panels and the other metros. "Lower-risk driving routes in" stays above the name in the h1, for search.
- **Updates**: the changelog as a timeline with its dates on the rail, filtered by CSS-only chips (radio buttons with `:checked` and `:has`), which work without JavaScript.
- **Technical**: the stack and the routing rules as spec sheets, and the pipeline as five stages that an emerald pulse runs along once. The data model now names all three stored road types, closed roads included.
- **About**: the name and the founder's story over a quiet dotted outline of South Africa (SVG only).
- **See it**: four screens from the daytime set, each with numbered markers matched by a list; pointing at an item lights its part of the screen (CSS only). The older night captures, with risk colours over named suburbs, are no longer shown.
- **How it works**: the six real steps as camera stops in the home page's illustrative city (`public/js/how.js` driving `scene/city.js`): the fastest route draws, a pulse tests it against the rated cells, the lower-risk route bends round them, and the car drives it. It moves with the scroll only. The static tier draws the same city flat.
- **The live-trip tracker**: restyled with the same behaviour. It uses Mapbox's dark style with the route and driver in emerald and a light destination pin, and shows a state dot instead of emoji. It is still `noindex` with no referrer.
- Copy on every page brought to the brand rules as it was rebuilt: straight quotes, "rated areas" for "risk zones", no safety promise, no suburb near a risk figure.

**Verified** (tools in `handoff/tools/`):
- `npm run check` passes on all 26 pages; `p1/pages.mjs` finds no script errors, sideways scroll or broken images at 360 and 1440, and a separate sweep finds no sideways scroll at 320 either.
- `p3/axe.mjs` (axe-core, whole pages at 1440 and 390): no violations on any Phase 3 page.
- `p3/metro.mjs`: the band switch with a mouse, the keyboard and no JavaScript, true figures only (sampled every frame), and the right band first at 10:00 SAST.
- `p3/track.mjs`: every tracker state against a mocked trip (a missing token, active with an ETA, arrived, a waiting Guardian link polling every ~30 s, the next drive, SOS), with no emoji left.
- The update filters with and without JavaScript and from the keyboard (counts match the data); See it's markers light only their own part of the screen.
- How it works walked through all six steps at 1440 and 390, in the 3D and static tiers, with no page errors.

**Review.** An independent reviewer tried to break the Phase 3 pages (brand and data, SEO, accessibility, layout, behaviour and budgets), and the full suite ran again. Nothing was rated high; everything rated medium was fixed, with the cheap low ones:
- Two Phase 3 style rules leaked onto the home page once the page kit became `body.sn` for every page: About's pronunciation style (`.say`) shrank the home hero's own line into the HUD corner at four laptop sizes, and the Updates timeline's class `tl` drew a border on the HUD's top-left corner (also `tl`). About's rule is now scoped to its headline and the timeline is `up-tl`. A computed-style comparison of the home page against the Phase 2 stylesheet now differs only in the kit's "more" link row (same sizes), and the coverage page's map section, header and footer do not differ at all.
- In-page links and the skip link now move keyboard focus to their target while the smooth scroll runs (`site.js`, and the home chapters' own links in `chapters.js`), without a focus ring round the whole section.
- The 404 page writes its links and files from the site root (`renderPage`'s `root` option) instead of a `<base href>`, which had sent its skip link to the home page.
- How it works: the car's drive is over by the middle of the last step, and the steps' padding holds the city pinned past it (checked at seven sizes).
- See it: screenshots stop at 600 px wide with `sizes` matched to the frame (a 3x phone moves 118 KB of them instead of about 250 KB); the phone fits the window, so it stays in view while its notes are read; pointing at a note lights it instead of dimming the others (which failed contrast); its wording holds for any recapture of the route card (quicker, the same, or longer; one area or several); and the lead no longer reads as a promise ("the one with less risk on it").
- Technical says search runs on Google Places (Mapbox names the place you tap); a double press on a copy button no longer sticks; without JavaScript the contact form hands the fields to the email app instead of putting them in the address.
- After the fixes the whole suite passes again (`suite.sh`, both explore tests, `p3/metro.mjs`, `p3/track.mjs` and the new `p3/behaviour.mjs`), and axe finds nothing on the changed pages, See it's hovered notes included.

**Style clean-up.** 344 rules of the old design that no built page or script uses were removed from `styles.css` (scripted: a rule goes only when every selector names a class or id that appears in no page and no script, with unused keyframes and the comments that only described removed rules). Every element on all 26 pages, and its `::before` and `::after`, computes the same style with the old and new stylesheet at 1440 and 390 wide. The stylesheet went from 34.5 to 26.6 KB gzipped.

**Budgets** (gzipped): our own JS on the text pages is `site.js` alone (3.4 KB), plus 1 KB on the metro pages. HTML plus CSS is 29 to 39 KB on every page but two: the home page (49 of 60 KB, down from 59) and Updates (81 KB, because its 205 releases are the content).

**Left for later:**
- **A real shared trip.** The tracker is tested against a mocked trip only. The plan's "tested end to end with a real shared trip" needs a trip shared from the app on a phone, opened on the preview or the live site.
- **The metro point cloud.** The plan asks for "a slowly turning point cloud" of the metro's outline. The prototype never built one, so the pages use the flat outline, which the plan specifies for the light tier anyway. A 3D version is a possible Phase 4 extra.
- **Page weight.** Updates is over the 60 KB HTML-plus-CSS line (its whole changelog is inline; the fix is the newest releases inline and an archive page). See it moves about 320 KB on a desktop screen, over the 250 KB aimed at text pages, because its content is four 600 px screenshots (Chrome fetches lazy images well ahead of the window).
- **Smaller notes.** On a 320 x 568 phone three of the How it works steps never sit whole below the pinned city. The Updates filter radios have no group name. See it's notes also quote what the screenshots show (43 in a 60, 280 m, 8 minutes), which no data file backs; they change only with a recapture.
- **App changelog wording.** Updates mirrors the app's What's New word for word, and older entries there say "safer route" and "risk zones". Fix them in the app's `whatsNew.ts` if they should change here.
- **Content decisions for Kyle.** Some metro blurbs name towns such as Umlazi, Ledig and Mogwase as covered, never as risky; that wording is from before the redesign. The legal texts still carry an em dash, "risk zones" and a quoted "Asambe" button label; those come from the app repo, and a separate session is re-syncing the Terms.

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

## 10. Decisions (settled with Kyle on 2026/09/25)

1. **Build system: keep the static build.** Kyle's brief is "professional and impressive". The look and the motion come from the design and the client code, which are identical on either build system. So we keep today's zero-dependency static build with vendored libraries. It loads fast, hosts free on GitHub Pages and has the least to maintain.
2. **Previews: private artifact links per phase.** No Cloudflare setup.
3. **"Try it" toy router: yes.** Phase 4, labelled as a toy.
4. **"Use my location": no.** There are only 12 metros and people know their own area. Removed from section 5.1.
5. **Launch: once, after Phase 5.** One merge to `main`.
6. **App screenshots: Kyle captures a daytime set,** helped by a local Claude Code session driving the iOS simulator on the Mac. A cloud session cannot run the simulator. Brief:
   - daytime (SAST);
   - nothing where a residential area's name sits under a red or orange overlay;
   - route options, turn-by-turn, CarPlay and the home screen.

   Until then, the site uses the crops it has today.

   **Delivered 2026/09/25** on `screens/daytime-2026-09`, merged into the redesign branch: `home-day`, `route-card-day`, `route-result-day`, `navigation-day`, `route-result-airport-day` and `route-result-detour-day`, each as AVIF, WebP and JPEG at 300, 600 and 900 wide, with alt text in `src/shots.mjs`. The airport shot is kept but not planned for use: every option is graded D because of the airport's own area, so it shows little of a detour.
7. **The name line: either form is fine.** Keep the current wording ("tsamaya sentle", go well) and adjust if a first-language speaker suggests "tsamaya hantle" for Sesotho.
8. **Chapter 1 tells the daytime detour (settled 2026/09/25).** The home page's route story uses the `route-result-detour-day` card:
   - Standard: grade E, 49 min, 42.4 km, 4 high-risk areas.
   - Balanced, lower-risk: grade B, 47 min, 52.3 km, 1 medium-risk area, 99% less risk.
   - It is 9.8 km further but was 2 minutes quicker in that morning's traffic.

   The figures live in `src/data/route-card.json`. The trip's place names are never printed next to them, because the areas it avoids are named suburbs. The illustrative city is tuned to match: the lower-risk route crosses no high cell.

## 11. Out of scope for this build

- Changes to the app, the pipeline or the admin site.
- New content beyond what the site has today, apart from the 404 page and the "Try it" label.
- Sound, accounts, sign-ups, comments or anything else that would need consent under POPIA.
