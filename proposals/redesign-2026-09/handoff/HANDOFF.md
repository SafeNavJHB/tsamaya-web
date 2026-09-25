# Handoff: finish Phase 1 (the home page) locally

Written 2026/09/25, when the work moved from a Claude Code cloud session to Kyle's Mac.

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
- The other pages still have curly quotes, "risk zones" wording and long-form dates such as "24 September 2026". Leave them for the Phase 3 and 5 copy pass.
- `about.html` loads the 50 KB `img/icon.png`.

## Running it on the Mac

```bash
cd ~/Desktop/tsamaya-web
git fetch origin && git checkout claude/quirky-keller-3i1043 && git pull
node build.mjs && npm run check
python3 -m http.server 8795 --directory dist          # site at http://localhost:8795
python3 -m http.server 8780 --directory proposals/redesign-2026-09   # prototype at http://localhost:8780/concept-4-sensor.html

# test tools (once)
cd proposals/redesign-2026-09/handoff/tools
npm init -y >/dev/null && npm install playwright lighthouse && npx playwright install chromium
node gzserve.mjs ../../../../dist 8796                # gzip server, like GitHub Pages
./run.sh http://localhost:8796/ home                  # throttled mobile Lighthouse
node xfer.mjs http://localhost:8796/ 390 844          # bytes over a full scroll
```

The scripts were written in the cloud container, so some of them still contain its paths:
- `/home/user/tsamaya-web` should become your repo path;
- `/tmp/claude-0/.../scratchpad` should become any output folder.

Playwright imports are already portable. On a Mac the SwiftShader launch flags are harmless and can be dropped.

## Prompt to paste into Claude Code on the Mac

> Read `proposals/redesign-2026-09/handoff/HANDOFF.md`, then `proposals/redesign-2026-09/BUILD_PLAN.md` and `handoff/phase1-spec.md`. We are finishing Phase 1 (the home page) of the Sensor redesign on branch `claude/quirky-keller-3i1043`. The Phase 1 code is committed as unreviewed work in progress.
>
> Work through "What is left for Phase 1" in order. Review the page against the prototype on desktop and phone, fix what differs, and meet the performance and fallback budgets. Keep every brand rule in the plan: no em dashes, straight quotes, lower-risk language, no suburb names next to risk, no count-ups, and every figure from data.
>
> Show me the result in the browser on localhost before committing. Then write the Phase 1 record into BUILD_PLAN.md, commit and push to the branch. Never push to `main`.
