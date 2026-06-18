# Tsamaya website

The public website for **Tsamaya — Go well.** It's a plain static site: HTML, CSS
and a little JavaScript, assembled by a small Node script with **no dependencies**
(nothing to `npm install`). That means it builds anywhere Node runs, hosts anywhere
that can serve files, and can't break from a bad package update.

```
tsamaya-web/  (this repo — site lives at the root)
├── build.mjs            ← the build (run this; writes ./dist)
├── serve.mjs            ← local preview server
├── site.config.mjs      ← EDIT HERE: name, links, bank details, stats, colours
├── src/
│   ├── layout.mjs        ← the shared page shell (header + footer)
│   ├── components.mjs    ← logo, icons, the phone mock-ups
│   ├── shots.mjs         ← the real app screenshots used on the demo page
│   └── pages/*.mjs       ← one file per page (home, about, demo, …)
├── public/               ← static assets copied as-is (styles.css, app.js, images)
└── dist/                 ← the built site (created by build.mjs; safe to delete)
```

## Pages

Home · How it works · See it (demo) · Technical · About · Sponsor & Donate · Contact.

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
