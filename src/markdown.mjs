// markdown.mjs — a deliberately tiny Markdown→HTML renderer.
//
// WHY NOT A LIBRARY: the build has zero dependencies on purpose, so
// `node build.mjs` runs on a clean checkout and CI needs no install step
// (see the "//" note in package.json). Pulling in `marked` to render two
// rarely-changing legal pages would trade that away for nothing.
//
// It therefore supports EXACTLY the subset the legal documents in
// src/content/ actually use, verified against them:
//   # / ## / ###   headings
//   **bold**       inline
//   - item         bullet lists
//   | a | b |      tables with a |---|---| separator row
//   > quote        blockquotes
//   ---            horizontal rule
//   blank line     paragraph break
// No links, inline code, italics or numbered lists appear in those files. If
// you add one, add it here too — unsupported syntax renders as literal text
// rather than silently disappearing, which is the failure mode you want.

/** Escape text destined for HTML. Runs BEFORE inline formatting is applied. */
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Internal editorial annotations, e.g. "[ATTORNEY: confirm s72 position.]".
 * These are working notes to the reviewing attorney, NOT policy text — they
 * must never reach a published page. Stripped at render time rather than
 * deleted from source so the markdown stays the working document.
 */
function stripEditorialNotes(s) {
  return s
    .replace(/\[ATTORNEY:[^\]]*\]/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ +([.,;:])/g, '$1')
    .trim();
}

/** Inline formatting, applied to already-escaped text. */
function inline(s) {
  return stripEditorialNotes(esc(s)).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function renderTable(rows) {
  // rows[0] is the header, rows[1] is the |---|---| separator, rest are body.
  const head = rows[0].map((c) => `<th>${inline(c)}</th>`).join('');
  const body = rows
    .slice(2)
    .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
    .join('');
  return `<div class="table-scroll"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

/** Split a table row on unescaped pipes, dropping the leading/trailing empties. */
function splitRow(line) {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim());
}

export function renderMarkdown(src) {
  const lines = String(src).replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank
    if (!line.trim()) { i++; continue; }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) { out.push('<hr/>'); i++; continue; }

    // Heading
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      // Levels map straight through (## → h2). The page hero supplies the only
      // <h1> and the calling page strips the document's leading "# Title", so
      // nothing here emits a competing h1 and the hierarchy has no gaps.
      // Guard anyway: a stray "#" would otherwise become a second h1.
      const level = Math.min(Math.max(h[1].length, 2), 6);
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
      i++;
      continue;
    }

    // Table — needs a separator row directly beneath the header
    if (line.trim().startsWith('|') && lines[i + 1] && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      out.push(renderTable(rows));
      continue;
    }

    // Bullet list
    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^[-*]\s+/, ''))}</li>`);
        i++;
      }
      out.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      out.push(`<blockquote>${buf.map(inline).join('<br/>')}</blockquote>`);
      continue;
    }

    // Paragraph — consume until a blank line or the start of another block
    const buf = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6}\s|[-*]\s|>|---+$)/.test(lines[i]) &&
      !lines[i].trim().startsWith('|')
    ) {
      buf.push(lines[i]);
      i++;
    }
    const text = buf.map(inline).join('<br/>');
    if (text.trim()) out.push(`<p>${text}</p>`);
  }

  return out.join('\n');
}
