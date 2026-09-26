# Handoff: finish Phase 1 (the home page) locally

Written 2026/09/25, when the work moved from a Claude Code cloud session to Kyle's Mac.

> **Done (2026/09/25, local session).** Every item under "What is left for Phase 1" is finished; the results, the fixes made in review and the measured budgets are in the Phase 1 record in `../BUILD_PLAN.md` section 8. The test tools below now run on the Mac as they are. The rest of this note is kept as the record of the handover.
>
> **Phase 2 (the explore map) is done too,** on the home page and the coverage page: see the Phase 2 record in the same section. Its test is `node p2/explore.mjs home` or `node p2/explore.mjs coverage` (34 checks each).
>
> **Phase 3 (every other page) is done as well:** all 26 pages are on the new design. See the Phase 3 record in the same section. Its tests are `node p3/axe.mjs index.html about.html` and so on (accessibility), `node p3/metro.mjs` (the metro band switch) and `node p3/track.mjs` (the live-trip tracker against a mocked trip). The tracker still needs one test with a real trip shared from the app.
>
> **Phase 4 is done too (2026/09/26),** with light mode (the 3D scenes follow it; `?scenes=dark` keeps them as night panels, and which way ships is Kyle's call), load more on Updates, "Try it" on How it works and a new social image: see the Phase 4 record. To test the tracker on a local build, put the three public client keys in a gitignored `config.local.json` at the repo root (same shape as `dist/config.json`; the live site's `/config.json` has them). Next is Phase 5 (hardening and launch).

## Where things stand

- **Branch:** `claude/quirky-keller-3i1043`. Never push to `main` (it auto-deploys the live site). The launch is one merge, after Phase 5.
- **Phase 0 is done and reviewed:** vendored libraries, fonts, the new layout shell, `site.js`, and the engine in `public/js/scene/`. See the Phase 0 record in `../BUILD_PLAN.md`.
- **The daytime screenshots are merged** and are recorded under decision 6 in the plan.
- **Chapter 1 now tells the daytime detour story** (decision 8).
- **Phase 1 was built by an agent and is committed as work in progress. It has not been reviewed.**
  - The agent was stopped during its own verification pass.
  - At that point `node build.mjs` worked and `npm run check` passed.
  - The files:

    | File | What it is |
    |---|---|
    | `src/pages/index.mjs` | The new home page |
    | `src/poster.mjs` | The build-time SVG poster |
    | `src/data/route-card.json` | The chapter 1 figures |
    | `public/js/home.js` | The home page entry point |
    | `public/js/scene/citygen.js` | The illustrative city generator |
    | `public/js/scene/city.js` | The 3D scene |
    | `public/js/scene/chapters.js` | The chapter clock and scroll logic |
    | `public/styles.css` | Home styles appended at the end |

- **The spec the agent built from:** `phase1-spec.md` in this folder, including the addendum at the end.
- **The copy source:** `content-brief.md`.

## What is left for Phase 1

1. **Finish the checks in `phase1-spec.md` section 4.** The agent's own test scripts are in `tools/p1/`. It had finished the card, focus, contrast, overflow and panel checks, and was re-running the interaction test (`interact.mjs`).
2. **Review against the prototype** (`../concept-4-sensor.html`) at 1440 x 900 and 390 x 844, and fix what differs.
3. **Performance, on a throttled mobile run:**
   - largest paint 2.5 s or less;
   - layout shift 0.1 or less;
   - the home page transfers about 600 KB compressed or less, measured over a full scroll;
   - our own JS is 45 KB gzipped or less.

   Use `tools/run.sh` (Lighthouse) and `tools/xfer.mjs` (bytes over a full scroll) against `tools/gzserve.mjs`.
4. **Check the three fallbacks** for a complete, readable page: reduced motion, `?tier=static`, and JavaScript off.
5. **Run the copy lint:** `node tools/copylint.mjs dist index.html` should report 0 hits. The rules:
   - no em dashes;
   - straight quotes;
   - never "safe route", "safest" or "stay safe";
   - no suburb near a risk figure;
   - no count-ups.
6. **Fix the footer "Admin" link contrast.** It measures 2.37:1 against `#070b15` and needs at least 4.5:1. It is in `public/styles.css`, footer section, and affects every page.
7. **Write a "Phase 1 record"** into `BUILD_PLAN.md` section 8, in the same style as the Phase 0 record.
8. **Commit and push** to `claude/quirky-keller-3i1043`.

## Follow-ups noticed (not Phase 1)

- `npm audit` flags `sharp` (a devDependency, libvips advisories).
- Done in Phase 3: the other pages' curly quotes and "risk zones" wording, and `about.html` no longer loads the 50 KB `img/icon.png` (only its structured data names it). Left: long-form dates such as "24 September 2026" in the legal texts, which come from the app repo.

## Running it on the Mac

```bash
cd ~/Projects/tsamaya-web
git fetch origin && git checkout claude/quirky-keller-3i1043 && git pull
node build.mjs && npm run check
python3 -m http.server 8795 --directory dist          # site at http://localhost:8795
python3 -m http.server 8780 --directory proposals/redesign-2026-09   # prototype at http://localhost:8780/concept-4-sensor.html

# test tools (once; node_modules, out/ and the npm files stay out of git via tools/.gitignore)
cd proposals/redesign-2026-09/handoff/tools
npm init -y >/dev/null && npm install playwright lighthouse && npx playwright install chromium
node gzserve.mjs ../../../../dist 8796                # gzip server, like GitHub Pages
./run.sh http://localhost:8796/ home                  # throttled mobile Lighthouse (real GPU; GL=swiftshader for the cloud's software rendering)
node xfer.mjs http://localhost:8796/ 390 844          # bytes over a full scroll
node p1/interact.mjs                                  # the interaction checklist (34 checks)
```

The scripts find the repo from their own location and write screenshots to `tools/out/` (set `OUT=` to change it). Scripts added in the local session:
- `p1/herofit.mjs`: hero text against the HUD corners and the spotlight tags (12 px of air), at many sizes; `p1/herobudget.mjs`: the hero's text budget per width, behind the short-screen CSS.
- `p1/fitprobe.mjs` and `p1/fitresize.mjs`: chapter 3's country, text and labels at many sizes, and after a resize; `p1/labels.mjs`: the metro labels and list (hover, focus, tap, pin, Escape).
- `p1/fontshift.mjs`: does the hero move when the web fonts land; `p1/fontwidth.mjs`, `p1/monowidth.mjs` and `p1/platfont.mjs`: the fallback font measurements.
- `p1/widths.mjs`, `p1/pages.mjs` (all 25 pages), `p1/fcp.mjs` and `p1/_shot.mjs`.
- `p2/explore.mjs [home|coverage]`: every row of table 5.1 with a mouse, touch and the keyboard, in the 3D and static tiers.
- `p3/axe.mjs page.html [...]`: axe-core over whole pages at 1440 and 390; `p3/metro.mjs`: the metro band switch (mouse, keyboard, no JavaScript, true figures only, the band in force first); `p3/track.mjs`: every tracker state against a mocked Supabase; `p3/behaviour.mjs`: focus after in-page links, the 404 at a deep path, copy buttons, the no-JavaScript contact form and See it's image sizes; `p3/cssdiff.mjs a.css b.css`: every element's computed style on every page under two stylesheets; `p3/prune-css.py`: removes style rules nothing can match (prove its output with `cssdiff`).
- `p3/theme.mjs`: light and dark, the button, the device default, the running 3D city switching, `?scenes=dark`; `p3/updates.mjs`: load more; `p4/try.mjs`: the toy router; `p4/og.mjs`: draws `public/img/og.png`. `p1/contrast.mjs` takes `COLOR=dark`; `p3/axe.mjs` scans both themes; `p3/cssdiff.mjs` compares in dark unless `COLOR=light`.
- `suite.sh`: every Phase 1 check in one run (about 20 minutes; starts the two local servers if they are not up).

## Prompt to paste into Claude Code on the Mac

> Read `proposals/redesign-2026-09/handoff/HANDOFF.md`, then `proposals/redesign-2026-09/BUILD_PLAN.md` and `handoff/phase1-spec.md`. We are finishing Phase 1 (the home page) of the Sensor redesign on branch `claude/quirky-keller-3i1043`. The Phase 1 code is committed as unreviewed work in progress.
>
> Work through "What is left for Phase 1" in order. Review the page against the prototype on desktop and phone, fix what differs, and meet the performance and fallback budgets. Keep every brand rule in the plan: no em dashes, straight quotes, lower-risk language, no suburb names next to risk, no count-ups, and every figure from data.
>
> Show me the result in the browser on localhost before committing. Then write the Phase 1 record into BUILD_PLAN.md, commit and push to the branch. Never push to `main`.
