#!/usr/bin/env bash
# Every Phase 1 check, one after another (one browser at a time), against the
# site served on http://localhost:8795 (python3 -m http.server 8795 --directory dist).
# Usage: ./suite.sh   (from this folder; about 20 minutes)
set -u
cd "$(dirname "$0")"
root=../../../..
# the servers the checks use: dist on 8795 (plain) and 8796 (gzip, like GitHub Pages)
up() { lsof -ti tcp:$1 -sTCP:LISTEN >/dev/null 2>&1; }
up 8795 || (python3 -m http.server 8795 --directory "$root/dist" >/dev/null 2>&1 &)
up 8796 || (node gzserve.mjs "$(cd "$root" && pwd)/dist" 8796 >/dev/null 2>&1 &)
sleep 1
run() { echo "== $1"; shift; "$@" 2>&1 | grep -E "$FILTER" || true; }
echo "== build and SEO gate"; (cd "$root" && node build.mjs >/dev/null && npm run check 2>&1 | grep -E "passed|✗|FAIL")
FILTER='hit'; run "copy lint (home)" node copylint.mjs "$root/dist" index.html
FILTER='^(FAIL|[0-9]+/)'; run "interactions" node p1/interact.mjs
FILTER='^(PASS|FAIL)|failure|all label'; run "chapter 3 labels" node p1/labels.mjs
for v in "1440 900" "390 844"; do
  FILTER='^(PASS|FAIL)'; run "numbers $v" node p1/numbers.mjs $v
  run "panel fades $v" node p1/panelprobe.mjs $v
  FILTER='^(PASS|FAIL)  all'; run "contrast $v" node p1/contrast.mjs $v
done
FILTER='PASS  no|FAIL'; run "overflow at 360" node p1/overflow.mjs
FILTER='^PASS|^FAIL'; run "hero cards" node p1/cards.mjs
FILTER='PASS|FAIL'; run "city generator parity" node p1/citygen-parity.mjs
FILTER='pages clean|FAIL'; run "all pages" node p1/pages.mjs
FILTER='moves|shift|still$' ; run "font swap" node p1/fontshift.mjs
FILTER='PASS|FAIL|follows|stale'; run "chapter 3 fit after resize" node p1/fitresize.mjs
FILTER='FAIL|pass'; run "chapter 3 fit" node p1/fitprobe.mjs 800x600,1024x768,1366x625,1440x900,1920x1080,768x1024,3440x1440
FILTER='OVERLAP|overlaps'; run "hero clearances" node p1/herofit.mjs 320x568,360x640,375x667,390x844,412x915,768x600,800x640,900x620,1024x768,1280x720,1366x625,1366x768,1440x789,1440x900,1536x864,1920x1080
