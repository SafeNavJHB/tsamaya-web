// strip-js.mjs: takes the comments and the indentation out of the site's own
// scripts on their way into dist/ (public/js/ keeps them, for people). Plain
// Node, no dependencies, so the build is still one `node build.mjs`.
//
// WHY: the home page's own JavaScript has a budget of 45 KB gzipped
// (proposals/redesign-2026-09/BUILD_PLAN.md, section 6), and about 40% of it
// was comments. Measured 2026/09/25: 43.3 KB as written, 27.1 KB stripped.
// Renaming variables as well (a full minifier) would only save 2 KB more, and
// would need a dependency.
//
// HOW: a small tokenizer, not a regular expression. Strings, template literals
// (with their ${} expressions, nested) and regular expression literals pass
// through untouched, so a "//" or "/*" inside any of them survives. A regular
// expression is told from a division by the token before it, the usual rule.
// Line breaks are kept wherever code or a comment had one, so automatic
// semicolon insertion sees what it saw before. Runs of spaces become one.
//
// CHECK: `npm run check:js` (needs the devDependencies) minifies every script
// before and after stripping with esbuild and fails unless the two agree, so a
// tokenizer slip cannot reach the site unnoticed.

const WORD = /[A-Za-z0-9_$]/;
// after these, a "/" starts a regular expression rather than dividing
const RE_AFTER_CHAR = new Set(['', '(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '<', '>', '~', '^']);
const RE_AFTER_WORD = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'yield', 'await', 'instanceof']);

export function stripJs(src) {
  const n = src.length;
  let out = '';
  let i = 0;
  // the last significant character written, and the word it ends, for telling
  // a regular expression from a division
  let last = '';
  let lastWord = '';
  // open template literals: for each, how deep its current ${} expression is
  const tpl = [];
  let pendingSpace = false;
  let pendingBreak = false;

  const emit = (s) => {
    if (pendingBreak) { if (out && !out.endsWith('\n')) out += '\n'; pendingBreak = false; pendingSpace = false; }
    else if (pendingSpace) { if (out && !/[\s]$/.test(out)) out += ' '; pendingSpace = false; }
    out += s;
  };
  const note = (s) => {
    const c = s[s.length - 1];
    if (WORD.test(c)) {
      const m = out.match(/[A-Za-z0-9_$]+$/);
      lastWord = m ? m[0] : '';
    } else lastWord = '';
    last = c;
  };
  // copy a quoted string or a regular expression body up to its end
  const copyUntil = (start, endCh, isRe) => {
    let j = start + 1, inClass = false;
    while (j < n) {
      const c = src[j];
      if (c === '\\') { j += 2; continue; }
      if (isRe) {
        if (c === '[') inClass = true;
        else if (c === ']') inClass = false;
        else if (c === '/' && !inClass) break;
      } else if (c === endCh) break;
      if (c === '\n' && !isRe) break; // an unterminated string: leave the rest as it is
      j++;
    }
    j++;
    if (isRe) while (j < n && WORD.test(src[j])) j++; // flags
    return j;
  };

  while (i < n) {
    const c = src[i], d = src[i + 1];
    // inside a template literal's text
    if (tpl.length && tpl[tpl.length - 1] === -1) {
      let j = i;
      while (j < n && src[j] !== '`') {
        if (src[j] === '\\') { j += 2; continue; }
        if (src[j] === '$' && src[j + 1] === '{') break;
        j++;
      }
      out += src.slice(i, j);
      if (src[j] === '`') { out += '`'; tpl.pop(); last = '`'; lastWord = ''; i = j + 1; continue; }
      out += '${'; tpl[tpl.length - 1] = 0; last = '{'; lastWord = ''; i = j + 2; continue;
    }
    if (c === '\n') { pendingBreak = true; i++; continue; }
    if (c === ' ' || c === '\t' || c === '\r') { pendingSpace = true; i++; continue; }
    if (c === '/' && d === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') {
      const end = src.indexOf('*/', i + 2), stop = end < 0 ? n : end + 2;
      if (src.slice(i, stop).includes('\n')) pendingBreak = true; else pendingSpace = true;
      i = stop;
      continue;
    }
    if (c === '"' || c === "'") { const j = copyUntil(i, c, false); emit(src.slice(i, j)); note(src.slice(i, j)); i = j; continue; }
    if (c === '`') { emit('`'); tpl.push(-1); i++; continue; }
    if (c === '/') {
      const reOk = RE_AFTER_CHAR.has(last) || RE_AFTER_WORD.has(lastWord);
      if (reOk) { const j = copyUntil(i, '/', true); emit(src.slice(i, j)); note(src.slice(i, j)); i = j; continue; }
    }
    // braces inside a template literal's ${} expression
    if (tpl.length && tpl[tpl.length - 1] >= 0) {
      if (c === '{') tpl[tpl.length - 1]++;
      else if (c === '}') {
        if (tpl[tpl.length - 1] === 0) { emit('}'); tpl[tpl.length - 1] = -1; i++; continue; }
        tpl[tpl.length - 1]--;
      }
    }
    if (WORD.test(c)) {
      let j = i;
      while (j < n && WORD.test(src[j])) j++;
      emit(src.slice(i, j)); note(src.slice(i, j)); i = j; continue;
    }
    emit(c); note(c); i++;
  }
  return out.replace(/^\s+/, '') + (out.endsWith('\n') ? '' : '\n');
}
