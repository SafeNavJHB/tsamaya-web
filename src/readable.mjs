// readable.mjs: keeps the page's plain text readable to a reader that ignores CSS.
//
// AI assistants and search tools read the HTML as text, without the stylesheet.
// Two elements written back to back with no whitespace between them ("<span>
// Johannesburg</span><span>800</span>") come out of that as one word,
// "Johannesburg800", even though the browser lays them out apart. A 2026-11-03
// fetch test of the site found dozens of these: counts glued to names, "01The",
// "Daytime, 05:00 to 17:30282".
//
// This pass puts one space at each such join, at build time, so no template has
// to remember. It only touches joins between elements (and text glued to a number
// span), never text inside an element. The joins it touches sit in flex and grid
// layouts, where whitespace between items is not drawn; a before-and-after
// screenshot of every page at desktop and phone widths came out pixel identical.
// If a new layout ever relies on two inline elements touching, give it a flex or
// grid parent rather than removing it from this pass.

const INLINE = 'span|b|strong|em|i|a|small|label|button|code|time|abbr|bdi';
const NEXT = `${INLINE}|p|div|h[1-6]|ul|ol|li|dl|dt|dd|svg|img|figure|figcaption|article|section`;
const JOIN = new RegExp(`(</(?:${INLINE})>)(<(?:${NEXT})\\b)`, 'g');
// "Hijacking<span class="num">15</span>": text glued to a number.
const NUM = /([^\s>])(<(?:span|b)\b[^>]*\bclass="(?:[^"]*\s)?num(?:\s[^"]*)?")/g;
// Never inside these: their whitespace is content, or they are not text.
const KEEP = /<(script|style|pre|textarea|svg)\b[\s\S]*?<\/\1>/g;

export function readableJoins(html) {
  const start = html.indexOf('<body');
  if (start < 0) return html;
  const head = html.slice(0, start);
  const kept = [];
  const body = html
    .slice(start)
    .replace(KEEP, (m) => `\u0000${kept.push(m) - 1}\u0000`)
    .replace(JOIN, '$1 $2')
    .replace(NUM, '$1 $2')
    .replace(/\u0000(\d+)\u0000/g, (_, i) => kept[+i]);
  return head + body;
}
