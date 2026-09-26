#!/usr/bin/env node
// strip-js-check.mjs: proves scripts/strip-js.mjs changes nothing but comments
// and whitespace. Every file under public/js/ is minified by esbuild (a
// devDependency) before and after stripping; the two must be identical, and
// the stripped file must still parse as a module.
//
//   npm run check:js
//
// Run it after changing strip-js.mjs, and before a release if a script uses
// syntax the tokenizer has not met before (it is also cheap enough to run
// every time).
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripJs } from './strip-js.mjs';

let esbuild;
try {
  esbuild = await import('esbuild');
} catch {
  console.error('esbuild is not installed. It is a devDependency, so: npm install');
  process.exit(1);
}

const root = dirname(dirname(fileURLToPath(import.meta.url)));
async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (p.endsWith('.js')) yield p;
  }
}

let bad = 0, before = 0, after = 0;
for await (const file of walk(join(root, 'public', 'js'))) {
  const src = await readFile(file, 'utf8');
  const out = stripJs(src);
  before += src.length; after += out.length;
  const min = async (code) => (await esbuild.transform(code, { minify: true, format: 'esm', loader: 'js' })).code;
  let a, b;
  try { a = await min(src); } catch (e) { console.error(`FAIL ${file}: the original does not parse (${e.message})`); bad++; continue; }
  try { b = await min(out); } catch (e) { console.error(`FAIL ${file}: stripped, it no longer parses (${e.message.split('\n')[0]})`); bad++; continue; }
  if (a !== b) {
    let k = 0;
    while (k < a.length && a[k] === b[k]) k++;
    console.error(`FAIL ${file}: stripped, it minifies differently near\n  before: ${a.slice(Math.max(0, k - 60), k + 60)}\n  after:  ${b.slice(Math.max(0, k - 60), k + 60)}`);
    bad++;
  }
}
if (bad) { console.error(`\n${bad} script(s) changed meaning when stripped`); process.exit(1); }
console.log(`strip-js: every script means the same stripped (${Math.round(before / 1024)} KB -> ${Math.round(after / 1024)} KB before gzip)`);
