# Tsamaya website

The public website for **Tsamaya — Go well.** It's a plain static site: HTML, CSS
and a little JavaScript, assembled by a small Node script with **no dependencies**
(nothing to `npm install`). That means it builds anywhere Node runs, hosts anywhere
that can serve files, and can't break from a bad package update.

```
tsamaya-web/  (this repo — site lives at the root)
├── build.mjs            ← the build (run this; writes ./dist)
├── serve.mjs            ← local preview server
├── site.config.mjs      ← EDIT HERE: name, links, bank details, colours, canonical URLs
├── scripts/
│   ├── fetch-stats.mjs   ← pulls live coverage figures from Supabase
│   ├── sync-metro-bounds.mjs ← copies the app's metro bounding boxes over
│   ├── make-land-outline.py  ← regenerates the country outline (run once, ever)
│   ├── optimise-images.mjs ← screenshots → AVIF/WebP/JPEG at three widths
│   └── check-seo.mjs     ← guards the SEO invariants (runs in CI, gates deploy)
├── src/
│   ├── layout.mjs        ← the shared page shell (header + footer + meta + JSON-LD)
│   ├── seo.mjs           ← structured data (Organization, app, FAQ, breadcrumbs)
│   ├── charts.mjs        ← the data visualisations
│   ├── map.mjs           ← the coverage map (South Africa, with the metros on it)
│   ├── components.mjs    ← logo, icons, phone frames, <picture> helper
│   ├── shots.mjs         ← the real app screenshots used on the demo page
│   ├── data/
│   │   ├── stats.json    ← LIVE FIGURES (generated — do not hand-edit)
│   │   ├── metro-bounds.json ← metro bounding boxes (generated — do not hand-edit)
│   │   ├── za-land.json  ← the country outline (generated — do not hand-edit)
│   │   └── metros.mjs    ← per-metro editorial copy for the landing pages
│   └── pages/*.mjs       ← one file per page; metros.mjs emits thirteen at once (twelve metros plus the coverage index)
├── public/               ← static assets copied as-is (styles.css, app.js, fonts, images)
└── dist/                 ← the built site (created by build.mjs; safe to delete)
```

## Pages

Home · How it works · See it (demo) · **Coverage** · Technical · About · Sponsor & Donate · Contact,
plus a landing page per metro (`/johannesburg.html`, `/cape-town.html`, …) generated
from `src/data/metros.mjs`.

## The two rules that keep this site honest

**1. Figures are never typed by hand.** Every coverage number on the site comes from
`src/data/stats.json`, which is generated from the live database. Refresh it with:

```bash
npm run stats
```

Then eyeball the diff and commit the JSON. The site build itself never touches the
network, so it still works offline and in CI without secrets.

The same goes for the **shapes on the coverage map**. Each metro's block is the app's
own service-area box, copied out of `src/constants/cities.ts` in the app repo — the
rectangle inside which a GPS fix is trusted and risk ratings apply. Refresh it in the
same sitting as the figures:

```bash
npm run bounds
```

Forgetting is loud rather than silent: the build throws if a metro has published zone
counts and no bounds, rather than quietly leaving it off the map.

**2. Metro pages never name a suburb as dangerous.** The risk data is at census
sub-place granularity, and the highest band is overwhelmingly townships and informal
settlements. Showing a driver a risk overlay for the road ahead is the product;
publishing a permanent, indexable list of those place names is a redline map. The
metro pages carry counts, band distributions, roads and driving context — never a
list of neighbourhoods. See the editorial note at the top of `src/data/metros.mjs`.

## Before you push

```bash
npm run build && npm run check
```

`npm run check` fails the build if the sitemap and the page canonicals disagree, if a
page has no structured data, if two pages share a title, if an image is referenced but
missing, or if the token-bearing live-trip page loses its `noindex`. The same check
runs in CI and blocks the deploy — every one of those rules exists because something
was actually broken in production.

## Build it locally

Build the site into `dist/`:

```bash
node build.mjs
```

Preview it in a browser (then open http://localhost:4321):

```bash
node serve.mjs
```

Or do both at once:

```bash
npm run dev
```

## Put it online (GitHub Pages — automatic)

The site auto-builds and deploys whenever you push a change under this repo.
The workflow lives at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

**One-time setup** (only needed once, in the GitHub web UI):

1. Push this repo to GitHub.
2. In the repo, open **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.

That's it. From then on, every push that changes the website rebuilds and
redeploys it. The live URL appears in **Settings → Pages** (it'll look like
`https://<your-username>.github.io/<repo>/`).

## Add your domain (when you've registered one)

The site is built to work at **any** address — a root domain, a `github.io`
sub-path, or a folder on another host — because every internal link is relative.
When you register a domain:

1. Create a file `public/CNAME` containing just the bare host, e.g.
   `tsamayaapp.co.za` (one line, no `https://`).
2. In `site.config.mjs`, set `domain: 'https://tsamayaapp.co.za'` (used for canonical
   tags and social previews).
3. At your domain registrar, point the domain at GitHub Pages (a `CNAME` record
   to `<your-username>.github.io`, or the four Pages `A` records for an apex
   domain — GitHub's Pages settings page shows the exact values).
4. Push. Done.

## Host it somewhere else instead

`dist/` is just static files. To use any other host (Netlify, Vercel, Cloudflare
Pages, cPanel, a VPS, an S3 bucket): run `node build.mjs` and upload the contents
of `dist/`. No server-side code, no database, no build server required.

## Editing content

- **Text, links, bank details, stats:** `site.config.mjs` (most things live here).
- **A whole page's copy:** the matching file in `src/pages/`.
- **Colours / styling:** CSS variables at the top of `public/styles.css`.
- **App screenshots:** drop PNGs in `public/img/screens/` and list them in
  `src/shots.mjs`. To add a screen recording, set `shots.video` there too.

See [`BUILD_NOTES.md`](./BUILD_NOTES.md) for how the screenshots were captured and
for app bugs noted along the way.

### Onboarding a new metro onto the site

Three edits, in this order:

1. `npm run stats` — pulls the new metro's zone counts out of the live database.
2. `npm run bounds` — copies its bounding box across from the app.
3. Add its entry to `src/data/metros.mjs` (intro, driving context, FAQs). That file
   is what turns a row of numbers into a page, and it is the only part written by hand.

Then `npm run build && npm run check`. The metro gets a landing page, a card on the
coverage page, a block on the map and a footer link, all at once.

If its label lands on top of a neighbour's on the map, give it an entry in `LABELS` at
the top of `src/map.mjs`. Nothing checks label collisions for you.

### The country outline

`src/data/za-land.json` is the coastline, the provincial borders and the hole where
Lesotho is. It is generated from the StatsSA census sub-place layer that the risk
pipeline already downloads, by dissolving 22 196 sub-places into nine provinces:

```bash
~/Projects/SafeNav/pipeline/.venv/bin/python scripts/make-land-outline.py
```

You will almost certainly never run it. Borders do not move, the output is committed,
and it needs geopandas plus the pipeline checkout — none of which the site build knows
anything about.
