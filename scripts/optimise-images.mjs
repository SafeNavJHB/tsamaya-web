#!/usr/bin/env node
// optimise-images.mjs — turns the raw simulator captures into web-ready images.
//
// WHY
// The screenshots were shipping as ~250 KB JPEGs at full device resolution, with
// no smaller variants. A phone on a South African mobile connection downloaded the
// same pixels as a desktop, and paid for the ones it could not display.
//
// WHAT IT DOES
// For every PNG/JPG in public/img/screens/src/, writes AVIF + WebP + a JPEG
// fallback at three widths into public/img/screens/. The site references them
// through <picture> with srcset, so a browser picks the smallest format and size
// it can actually use.
//
//   npm run images
//
// This is a BUILD-TIME step, run by hand when screenshots change and the results
// committed. `node build.mjs` never runs it, so the site still builds with no
// dependencies installed — sharp is a devDependency, not a runtime one.

import { readdir, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, basename } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const srcDir = join(root, 'public', 'img', 'screens', 'src');
const outDir = join(root, 'public', 'img', 'screens');

// Widths a phone screenshot is actually displayed at on this site: the demo grid
// caps around 300 CSS px, the hero device around 380. 2x those, plus one larger
// for very high-density displays.
const WIDTHS = [300, 600, 900];

let sharp;
try {
  ({ default: sharp } = await import('sharp'));
} catch {
  console.error(
    'sharp is not installed. It is a devDependency, so:\n\n  npm install\n\n' +
      'then re-run. The site itself needs no dependencies — this script is the only thing that does.\n',
  );
  process.exit(1);
}

if (!existsSync(srcDir)) {
  console.error(
    `No source directory at ${srcDir}\n\n` +
      'Put the raw simulator captures there (they stay out of the built site),\n' +
      'and the optimised variants get written to public/img/screens/.\n',
  );
  process.exit(1);
}

const files = (await readdir(srcDir)).filter((f) => /\.(png|jpe?g)$/i.test(f));
if (!files.length) {
  console.error(`No PNG or JPEG files in ${srcDir}`);
  process.exit(1);
}

await mkdir(outDir, { recursive: true });

let totalIn = 0;
let totalOut = 0;

for (const file of files) {
  const name = basename(file, extname(file));
  const inPath = join(srcDir, file);
  totalIn += (await stat(inPath)).size;

  const meta = await sharp(inPath).metadata();
  console.log(`\n${file}  (${meta.width}×${meta.height})`);

  for (const w of WIDTHS) {
    // Never upscale — a 300px-wide source does not benefit from a 900px variant.
    if (meta.width < w) continue;
    const base = sharp(inPath).resize({ width: w, withoutEnlargement: true });

    const targets = [
      { ext: 'avif', opts: { quality: 55, effort: 6 } },
      { ext: 'webp', opts: { quality: 74 } },
      { ext: 'jpg', opts: { quality: 78, mozjpeg: true } },
    ];

    for (const t of targets) {
      const outPath = join(outDir, `${name}-${w}.${t.ext}`);
      const info = await base.clone()[t.ext === 'jpg' ? 'jpeg' : t.ext](t.opts).toFile(outPath);
      totalOut += info.size;
      console.log(`   ${String(w).padStart(4)}px ${t.ext.padEnd(4)} ${String(Math.round(info.size / 1024)).padStart(4)} KB`);
    }
  }
}

const pct = Math.round((1 - totalOut / totalIn) * 100);
console.log(
  `\n  sources ${Math.round(totalIn / 1024)} KB → all variants ${Math.round(totalOut / 1024)} KB` +
    `\n  (a browser downloads ONE variant, so the real saving per visitor is far larger than ${pct}%)\n`,
);
