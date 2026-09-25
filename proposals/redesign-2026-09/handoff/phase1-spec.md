# Phase 1 spec: the Sensor home page, built for real

Repo: `/home/user/tsamaya-web` (static marketing site for the Tsamaya app, deploys from `main`).
Branch: `claude/quirky-keller-3i1043` (already checked out). **Do not commit, do not push, do not touch `main`.** Leave every change in the working tree; the lead reviews, commits and pushes.

## 0. Read first (in this order)

1. `proposals/redesign-2026-09/BUILD_PLAN.md`: sections 1 to 8, and especially 3.3, 5.2, 5.3, 5.5, 6, 7. Phase 1 row in section 8.
2. The prototype you are porting: `proposals/redesign-2026-09/concept-4-sensor.html` (2 631 lines).
   - CSS: lines 5 to 581.
   - Home markup: lines 600 to 939 (lines 585, 723, 724, 725 and 744 are huge inline SVG/path lines; do not read them whole, grep them).
   - Script: lines 1078 to 2631. `makeScene()` starts at 1670, `camAt` 1916, `stateAt` 1942, `chapterC` 2356, `updateUI` 2373, `preview` (hero chips) 2443. Read the rest around them (pins, panel fades, spotlight `spot`/`placeSpot` near 2200, parallax, dayline click).
   - Its generator and poster build: `/tmp/claude-0/-home-user/cc91829d-9738-5aed-8992-96cc2510c765/scratchpad/s4/gen.js` (the `/*GEN*/` block) and `s4/build.mjs` (how the `pl-*` poster SVG groups and the SA dots figure were produced).
3. Phase 0 code you build on, and must not re-implement:
   - `src/layout.mjs` (shell: header, HUD strip, footer; `page.hud`, `page.scripts` which are emitted as `type="module"`).
   - `public/js/site.js` (SAST clock `[data-sa-time]`/`[data-sa-band]`, `window.Tsamaya = {saMinutes, bandAt, bands, reducedMotion, setMotionPaused}`, `[data-motion-toggle]` which dispatches `tsamaya:motion` and toggles `html.motion-paused`, `[data-reveal]`, `[data-split]` / `data-split-now`, Lenis as `window.lenis` synced to ScrollTrigger, magnetic `.btn-mag`). Reduced motion there means no Lenis, no reveals.
   - `public/js/scene/tier.js` (`detectTier()` → `'full' | 'light' | 'static'`, `pixelRatioFor`).
   - `public/js/scene/engine.js` (`createEngine({canvas, stage, tier, fov, onFrame, onResize, onDegrade, onLost})`; the ONLY place a WebGLRenderer is created; `.is-live` on the stage after the first frame; pauses off screen / hidden tab / Pause motion; `invalidate()`; adaptive quality).
   - `public/vendor/three.scene.min.js` is a TRIMMED Three.js r186 ESM bundle. Its exports are listed in `scripts/vendor/three-entry.mjs`. If you need a class that is not exported, add it to that entry file and run `npm run vendor` (devDependencies are installed; if not, `npm install` in the repo is fine). Record any addition in your report.
   - `src/sitedata.mjs` (`siteData()`, `geoData()`), `site.config.mjs` (`stats`, `fmt` which groups thousands with a non-breaking space, `site.testflightPublicLink`, `site.androidPlayLink`, `site.pronunciation`), `src/seo.mjs` (`faqNode`), `src/data/stats.json`, `src/data/metros.mjs`.
   - `public/styles.css`: tokens at the top (`--night`, `--surface`, `--go`, `--hud`, `--fg-2`, `--hairline`, easing vars, etc.). Reuse them; do not redefine header, footer, button or HUD-strip styles.
   - `scripts/check-seo.mjs` (`npm run check`): the deploy gate. Checks 10 to 12 matter here (number format, no em dash, no Three.js without a `<canvas`).
4. Copy source: `/tmp/claude-0/-home-user/cc91829d-9738-5aed-8992-96cc2510c765/scratchpad/content-brief.md` and the prototype's own copy (already humanised; reuse it word for word unless a rule below forces a change).

## 1. What to build

Replace the home page (`src/pages/index.mjs`) with the prototype's home, minus the "04 / Explore" interactive map (that is Phase 2). Section order:

1. Scene zone: fixed canvas + poster + scene HUD corners + callouts.
2. Hero (h1 "Go where the trouble isn't.", say line, sub, CTA, note "Lower risk is not no risk. ...", band chips, route spotlight callouts).
3. Chapter 1 "The bend" (pinned). 4. Chapter 2 "Three clocks" (pinned). 5. Chapter 3 "Twelve metros" (pinned).
6. Inside the app (six steps + phone image + "Also in the app" grid).
7. Coverage (stats row + two tables, rows link to the real metro pages `<slug>.html`, plus a "Coverage by metro" link to `coverage.html`).
8. Questions (accordion).
9. Get the app (Google Play first, TestFlight second, privacy aside).
10. Ways to help (free list first, then R 100 / R 1 000 / R 2 500), with a link to `sponsor.html` (and `sponsor.html#donate`) instead of printing bank details on the home page.

Leave a clearly commented seam where Phase 2 will insert the explore section and extend the chapter clock past 6 (see 3.2).

### 1.1 Files

| File | What |
|---|---|
| `public/js/scene/citygen.js` | NEW. Pure ES module port of the `/*GEN*/` block of `s4/gen.js`: `mulberry32`, `crSample`, `CITY`, `genCity`, `genCells`. No DOM, no Three.js. Imported by BOTH the build (Node) and the browser. Output must be byte-identical in both (same seeds as the prototype: city 7, cells 11). |
| `src/poster.mjs` | NEW. Build-time SVG: the `pl-base`, `pl-c0..2`, `pl-fast`, `pl-low` groups (port of `s4/build.mjs`, rounded to 0.1) and the South Africa figure for chapter 3 (land, borders, metro dots sized by rated areas, from `geoData()` / `stats`). Emits a hidden `<svg class="defs">` block plus helpers that return `<svg><use href="#pl-..."/></svg>` figures. |
| `src/pages/index.mjs` | REWRITTEN. Real HTML text for every section. `hud: false` (the scene has its own HUD corners), `scripts: ['js/home.js']`, `heroClass: 'page-home'`, `jsonLd: [faqNode(faqs)]`. Keep today's six FAQ items and their answers (you may keep the prototype's four short ones visible first, but the JSON-LD must match what is on the page; simplest is to show all six). |
| `src/data/route-card.json` | NEW. The one example trip from a real in-app route card: fastest grade E, 25 min, 18.0 km, 4 high-risk areas; balanced lower-risk grade D, 25 min, 17.4 km, 2 high-risk areas, 68% less risk. Add a `"source"` field saying it is copied from the app's route card screenshot (`img/screens/route-card-*`). Every page string that shows these numbers reads this file. |
| `public/js/home.js` | NEW entry (module). Decides the tier (allow a `?tier=static|light|full` URL override for testing only), sets `html.tier-<name>`, wires the non-3D UI that must work in every tier (chips reflect the live band; FAQ accordion; spotlight cards open on tap/focus as plain HTML), then at idle after first paint (`requestIdleCallback` with a 1 500 ms timeout, fallback `setTimeout`) dynamically imports `scene/engine.js`, `scene/city.js`, `scene/chapters.js`. Exposes a test hook `window.__home = { tier, c(), state(), ready }`. |
| `public/js/scene/city.js` | NEW. Builds the scene on the engine: point-cloud city, hex risk cells per band (InstancedMesh), the fastest and lower-risk routes (with the draw-on, pulse and fade uniforms), the car, the SA morph targets and metro pillars for chapter 3. Exposes `apply(state, t)` and the 3D anchors the callouts need. Point and cell counts per tier as in the prototype (full 70 000 desktop / 42 000 phone, light 20 000; hex radius 2.65 full, 4.1 light); `onDegrade` halves the points. |
| `public/js/scene/chapters.js` | NEW. The chapter clock `c`, `stateAt(c)`, `camAt(c)` (desktop and phone keyframes), pinned ScrollTriggers, the panel fades (see 3.4), and all DOM updates (steps, rails, stat, clock, day line, counts, band rows, HUD place label, scene fade out). Also: hero band chips, route spotlight, pointer parallax, clickable day line and band rows, rail labels that jump. |
| `public/styles.css` | APPEND one block headed `/* ===== Home (Phase 1) ===== */`. Port only the prototype CSS the home needs, mapped to the Phase 0 tokens. |

Keep our own JS (home.js + city.js + chapters.js + citygen.js) at or under **45 KB gzipped in total**. Do not minify by hand; write clear code with short comments in the house style (see engine.js).

## 2. Hard rules (a review fails on any of these)

1. **No count-ups, ever.** A number on screen is always a true value. Where the prototype tweens a number (`statO` 4 → 2 in chapter 1, `cntO` 1 372 → 1 524 → 2 525 in chapter 2, `data-count` in coverage), switch between the true values with a quick crossfade or a vertical digit flip (old value out, new value in, 250 ms, `expo.out`). Bars, rings, columns and light may move smoothly. The chapter 2 clock (05:00, 05:05, ...) is a time label, not a statistic: it may step in 5-minute increments.
2. **Figures come from data, never typed.** Counts from `stats.json` via `stats` / `siteData()` and `fmt()`. Band counts are `stats.byTime.day.red`, `.evening.red`, `.night.red`. Metro rows from `stats.metros` (sort by zones, descending). Route-card figures from `src/data/route-card.json`. The client reads numbers from the DOM or from `data/site.json`, never from literals in JS.
3. **Language:** never "safe route", "safest", "stay safe", "guarantee(d)" as a claim (the FAQ question "Does it guarantee I will be safe?" with its "No" answer stays). Use "lower-risk". "Lower risk is not no risk." must be visible in the hero. No suburb or township names anywhere; the 3D city is labelled "Illustrative city". "Asambe" is not used. **No em dashes** (U+2014) anywhere; avoid en dashes in prose too. **Straight quotes only** (no curly quotes). Dates yyyy/mm/dd.
4. **Progressive enhancement.** With JavaScript off, the page reads top to bottom: every chapter shows its SVG figure and its end-state text (chapter 1 stat visible, chapter 2 band list visible, all steps visible), FAQ answers readable, no pinned blank space, nothing stuck at opacity 0.
5. **Static tier** (reduced motion, no WebGL, lost context, or `?tier=static`): no Three.js download at all, no pins, no scrubbing, no Lenis (site.js already skips it), no SplitText, no parallax. Poster stays. Chapters render as the no-JS layout. Hero chips still work (they change the highlighted band in the poster: swap the `<use href="#pl-cN">`). Spotlight cards open on tap/focus/hover. 200 ms fades at most.
6. **Accessibility:** one `h1`. Canvas and poster `aria-hidden`. Every callout that is interactive is a real `<button>` with `aria-expanded`/`aria-controls`; Escape closes. Chips are buttons with `aria-pressed`. The day line is operable by keyboard (a `role="slider"` with arrow keys, or real buttons for the three bands plus the rail labels as buttons; your call, keep it simple and correct). Visible focus on everything. 44 px tap targets on phones. Text over the scene stays AA contrast (use a scrim where the city is bright).
7. **Loading order** (BUILD_PLAN section 6): HTML, CSS, fonts; the poster paints as the largest element; GSAP/Lenis (already deferred by the layout); three.scene.min.js and the scene modules only at idle after first paint; the canvas fades in over the poster only once its first frame is drawn (the engine adds `.is-live` to the stage; Phase 0 CSS `.scene-stage` handles the fade). **The hero h1 must be visible in the very first paint** (do not hide it with CSS waiting for JS; if you animate it, animate transform only, starting from visible). Nothing may shift layout when the canvas, fonts or scripts arrive.
8. **Engine only.** Never `new WebGLRenderer` outside engine.js. Pass `fov: 36`. Use `onFrame` for per-frame work and return `true` only while something is easing; call `engine.invalidate()` on scroll updates so the light tier (no idle drift) still redraws while scrubbing. Full tier: `engine.start()` for the idle drift. Light tier: no idle drift.
9. **Do not edit:** `src/content/*.md`, `track.html` / `src/pages/track.mjs`, `public/.well-known/`, the Search Console tag, the analytics snippet, `proposals/` (read only), other pages (except where the shared CSS must not break them).

## 3. Behaviour to port (and the changes)

### 3.1 From the prototype, as is
- `stateAt(c)` / `camAt(c)` choreography, desktop and phone keyframes, the fastest route drawing on, the "Re-routing" pulse, the lower-risk route bending round, the car along the lower-risk route, the dissolve and morph into South Africa, pillars growing, labels for the six largest metros (numbers from data).
- Callouts projected from 3D anchors (`place()`), clamped under the header.
- Hero band chips: "Day / Evening / Night" preview another band (columns rise or fall, light shifts); "Back to live" returns to the band in force now (`window.Tsamaya.bandAt(window.Tsamaya.saMinutes())`). Chips fade as chapter 1 approaches and the preview resets.
- Route spotlight: hover/focus/tap "Fastest · E" or "Lower-risk · D" → that route pulses, the other fades, the card with the real route-card numbers appears. Second tap or Escape closes.
- Pointer parallax: the camera leans up to about 2.5 degrees toward the pointer. Fine pointers only (`(hover: hover) and (pointer: fine)`); off on touch, reduced motion and when motion is paused.
- Chapter rails with progress; rail labels in chapter 1 jump to that step (scroll with `window.lenis.scrollTo` when present, else `scrollTo`).
- Scene HUD corners: top-left "Tsamaya · Route model", top-right live SAST time + chips, bottom-left "12 metros · 4 396 rated areas · 3 time bands" (from data), bottom-right place label ("Illustrative city" → "South Africa · 12 metros") and a Pause motion button (`data-motion-toggle`, with a `.motion-label` span; site.js does the rest).

### 3.2 Changes from the prototype
- **No Explore section and no SPA router / Johannesburg view.** The chapter clock runs 0 to 6 (hero 0 to 1, pin 1, gap, pin 2, gap, pin 3). After chapter 3 the scene holds the South Africa view and fades out as "Inside the app" scrolls over it (the prototype's `fade` logic, keyed to the end of pin 3 instead of explore). Put a comment where Phase 2 extends `K` with the explore trigger.
- **Chapter 2 covers the whole day.** The prototype ran 05:00 to 23:00, which made a click before 05:00 land in the wrong place. Rotate the day line to start at 05:00: 05:00 → 17:30 (daytime, 52.083 %), 17:30 → 19:30 (evening, 8.333 %), 19:30 → 05:00 next day (night, 39.583 %), ticks at 05:00, 17:30, 19:30, 00:00, 05:00. The clock label runs 05:00 ... 23:55, 00:00 ... 04:55. Clicking (or keyboard on) any point of the line scrolls to the moment the chapter shows that time; the band rows jump to the middle of their band.
- **No count-ups** (rule 2.1).
- **Real links:** CTA "Get the app" → `#get` on the page; "Watch it re-route" → `#bend`; coverage rows → `<slug>.html`; help → `sponsor.html`; the six steps' "full breakdown" → `how-it-works.html`; a "See it in action" link → `demo.html` somewhere sensible (for example under the phone image).
- Header, footer and fonts come from the Phase 0 layout; drop the prototype's own header and logo symbol.
- Images: use the site's existing responsive screenshots via `deviceShot`/`shotSize`/`altFor` from `src/components.mjs` / `src/shots.mjs` (AVIF + WebP + JPEG), lazy below the fold. The phone image in "Inside the app" is `navigation`.

### 3.3 Tiers
- `full`: as the prototype on desktop (70 000 points) and phone (42 000).
- `light`: 20 000 points, hex radius 4.1, pixel ratio capped by `pixelRatioFor`, no idle drift, no parallax.
- `static`: see rule 2.5.
- Lost context: the engine adds `.is-lost`; the page must look exactly like the static tier from that moment (poster back, pins may stay but figures must be visible; simplest is to kill the ScrollTriggers and add `html.tier-static`).

### 3.4 Panel fades (a bug fixed in the prototype; keep the fix)
Each pinned chapter's `.ch-panel` stays fully opaque for the whole pin and fades only after the pin releases:
`gsap.fromTo(panel, {opacity:1}, {opacity:0, ease:'none', immediateRender:false, scrollTrigger:{ start: () => pins[i].end, end: () => pins[i].end + innerHeight*0.38, scrub:true }})`. Never key it to `trigger: sec, start: 'bottom bottom'` (that fires during the pin).

## 4. Verify before you report

Build with `node build.mjs`, then `npm run check` (must pass with no new warnings). Serve `dist/` with `python3 -m http.server 8795 --directory /home/user/tsamaya-web/dist` (already running on 8795 if you find it up; reuse it).

Playwright: `import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'`, launch with `args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']`, context `ignoreHTTPSErrors: true`, plain viewports (do NOT use `isMobile` emulation). Useful existing scripts in the scratchpad `/tmp/claude-0/-home-user/cc91829d-9738-5aed-8992-96cc2510c765/scratchpad/`: `frames.mjs` (`node frames.mjs <url> <outdir> <w> <h> <scale> <maxFrames> <stepPx>` scrolls via `window.lenis.scrollTo` and saves viewport frames), `pinprobe.mjs`, `pages.mjs`. Read them before using; adapt copies, do not break the originals. Write your own test files into `scratchpad/p1/`.

Evidence to produce (save PNGs under `scratchpad/p1/`):
1. Frames through the whole home page at 1440 x 900 and 390 x 844 (full tier) and compare side by side with the prototype at the same scroll positions (`http://localhost:8780/concept-4-sensor.html` is the prototype server; start `python3 -m http.server 8780 --directory /home/user/tsamaya-web/proposals/redesign-2026-09` if it is down; the prototype pulls its libraries from CDNs which are blocked here, so use `scratchpad/cdnroute.mjs` route interception as `frames.mjs` does). The build must look like the prototype.
2. Same at 390 x 844 with `?tier=light` and `?tier=static`.
3. `reducedMotion: 'reduce'` context at 1440 and 390: no Three.js request (check the network log), chapters readable.
4. `javaScriptEnabled: false` at 1440 and 390: full page readable, no blank pinned space.
5. At 360 x 780: no horizontal overflow (`document.documentElement.scrollWidth <= 360`) at the top, mid and bottom.
6. Zero console errors and zero page errors in every run.
7. Interactions: chips change `aria-pressed` and the scene band (read `window.__home.state()`); "Back to live" appears only during a preview; spotlight opens with mouse hover, with a tap at 390, and with Tab + Enter, and closes on Escape; a click on the day line at 02:00 scrolls to a point where the clock label reads 02:00 (± 5 min) and the night row is active; chapter-1 rail labels jump to their step; Pause motion stops the render loop (count frames via a `requestAnimationFrame` wrapper or the engine) and resumes it.
8. Panel fade probe: during each pin the panel opacity is 1.00; after release it fades (adapt `pinprobe.mjs`).
9. Numbers: sample the chapter-1 stat and the chapter-2 count every animation frame while scrolling through both chapters; the set of distinct values seen must be a subset of the true values ({4, 2} and {1 372, 1 524, 2 525} formatted with a non-breaking space).
10. Sizes: gzip sizes of `dist/index.html`, `dist/styles.css`, and each of your JS files (`gzip -9 -c f | wc -c`), and the total of your own JS.

## 5. Report back (keep it short, no em dashes)

- Files created/changed with one line each.
- Sizes (gzip) table.
- The checklist above with pass/fail and the evidence file names.
- Any deviation from this spec and why.
- Anything you could not finish or that looks off to you, including visual differences from the prototype you noticed but did not fix.

## Addendum (2026/09/25, sent to the builder mid-run; already applied in the working tree)

The owner chose the daytime detour for chapter 1 (BUILD_PLAN decision 8). Applied: `src/data/route-card.json` holds the `route-result-detour-day` figures; `CITY.LONE` in `citygen.js` is one medium cell, so the lower-risk route crosses no high cell (`tools/p1/lowpath-check.mjs`). Copy that must match:

- Chapter 1 h2: "Two minutes quicker. Four fewer high-risk areas."
- Steps 01 and 03: Standard grade E, 49 min, 42.4 km, 4 high-risk areas; Balanced lower-risk grade B, 47 min, 52.3 km, "takes the freeway instead and passes 1 medium-risk area, for 0.1 km".
- Stat "4 → 0 high-risk areas"; "99% less risk than the standard route. 9.8 km further, and 2 minutes quicker in that morning's traffic."; footnote "Numbers from a real route card in the app, 2026/09/25."
- Rail labels Standard, Re-route, Bend, Drive. Hero spotlight "Standard · E" and "Lower-risk · B". Poster labels "STANDARD · E", "LOWER-RISK · B".
- No place names next to these figures, anywhere.
- "Inside the app" shows two phones: `route-result-detour-day` and `navigation-day` (replacing the night `navigation`).
- Number-sampling check for chapter 1 is {4, 0}.
