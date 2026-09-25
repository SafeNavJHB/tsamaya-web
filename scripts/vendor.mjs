#!/usr/bin/env node
// vendor.mjs: copies the site's third-party browser libraries into public/vendor/.
//
//   npm install      (once, for the devDependencies)
//   npm run vendor
//
// WHY THE FILES ARE COMMITTED
// The site build (`node build.mjs`) has no dependencies and must keep running on
// a clean checkout with no `npm install`: that is what keeps CI and hosting
// simple. So, like the fonts in public/fonts/ and the images made by
// `npm run images`, these files are produced once by this manual step and
// committed. build.mjs copies public/ as it is and never runs this script.
//
// WHAT IT WRITES
//   gsap.min.js, ScrollTrigger.min.js, SplitText.min.js   copied from the gsap package
//   lenis.min.js                                          copied from the lenis package
//   three.scene.min.js                                    a trimmed ES module bundle of
//                                                         the Three.js classes listed in
//                                                         scripts/vendor/three-entry.mjs
//
// Versions are pinned exactly in package.json. Upgrading one is deliberate: bump
// it there, run this script, test the pages that use it, update
// public/vendor/README.md, commit.
import { copyFile, mkdir, readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { gzipSync } from 'node:zlib';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = join(root, 'public', 'vendor');
const nm = join(root, 'node_modules');

let esbuild;
try {
  esbuild = await import('esbuild');
} catch {
  console.error('esbuild is not installed. Run `npm install` first (it is a devDependency).');
  process.exit(1);
}

const version = async (pkg) => JSON.parse(await readFile(join(nm, pkg, 'package.json'), 'utf8')).version;
const report = async (file) => {
  const buf = await readFile(join(out, file));
  console.log(`  ${file.padEnd(22)} ${String(Math.round(buf.length / 1024)).padStart(4)} KB, ${String(Math.round(gzipSync(buf).length / 1024)).padStart(3)} KB gzipped`);
};

await mkdir(out, { recursive: true });

const copies = [
  ['gsap', 'dist/gsap.min.js', 'gsap.min.js'],
  ['gsap', 'dist/ScrollTrigger.min.js', 'ScrollTrigger.min.js'],
  ['gsap', 'dist/SplitText.min.js', 'SplitText.min.js'],
  ['lenis', 'dist/lenis.min.js', 'lenis.min.js'],
];
for (const [pkg, from, to] of copies) {
  const src = join(nm, pkg, from);
  await stat(src).catch(() => { throw new Error(`missing ${pkg}/${from}; run npm install`); });
  await copyFile(src, join(out, to));
}

await esbuild.build({
  entryPoints: [join(root, 'scripts', 'vendor', 'three-entry.mjs')],
  outfile: join(out, 'three.scene.min.js'),
  bundle: true,
  minify: true,
  format: 'esm',
  target: ['es2020'],
  legalComments: 'inline',
  logLevel: 'warning',
});

console.log(`Vendored into public/vendor/ (gsap ${await version('gsap')}, lenis ${await version('lenis')}, three ${await version('three')}):`);
for (const f of ['gsap.min.js', 'ScrollTrigger.min.js', 'SplitText.min.js', 'lenis.min.js', 'three.scene.min.js']) await report(f);
