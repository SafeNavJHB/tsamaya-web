#!/usr/bin/env bash
# Throttled mobile Lighthouse run. Usage: run.sh <url> <name> [simulate|devtools]
# Default Lighthouse mobile profile: Moto G Power class screen, 4x CPU slowdown,
# slow 4G (150 ms RTT, 1.6 Mbps down). "devtools" applies the throttling for real
# instead of simulating it from an unthrottled trace.
set -euo pipefail
cd "$(dirname "$0")"
URL="$1"; NAME="$2"; METHOD="${3:-simulate}"
export CHROME_PATH="${CHROME_PATH:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
mkdir -p out
npx lighthouse "$URL" \
  --only-categories=performance,accessibility,best-practices,seo \
  --throttling-method="$METHOD" \
  --chrome-flags="--headless=new --no-sandbox --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-certificate-errors" \
  --output=json --output=html --output-path="out/$NAME" --quiet
node -e '
const r = require("./out/'"$NAME"'.report.json");
const a = r.audits, c = r.categories;
const pick = (k) => a[k] ? a[k].displayValue : "-";
console.log(["perf " + Math.round(c.performance.score*100), "a11y " + Math.round(c.accessibility.score*100), "bp " + Math.round(c["best-practices"].score*100), "seo " + Math.round(c.seo.score*100)].join(" | "));
console.log("FCP", pick("first-contentful-paint"), "| LCP", pick("largest-contentful-paint"), "| TBT", pick("total-blocking-time"), "| CLS", pick("cumulative-layout-shift"), "| SI", pick("speed-index"));
const lcpEl = a["largest-contentful-paint-element"];
try { console.log("LCP element:", lcpEl.details.items[0].items[0].node.snippet.slice(0, 160)); } catch (e) {}
console.log("Transfer:", pick("total-byte-weight"));
const items = (a["network-requests"].details.items || []);
const by = {};
for (const i of items) { const t = i.resourceType || "Other"; by[t] = (by[t] || 0) + (i.transferSize || 0); }
console.log(Object.entries(by).map(([k,v]) => k + " " + (v/1024).toFixed(1) + " KB").join(", "));
const fails = Object.values(r.categories.accessibility.auditRefs).map(x => a[x.id]).filter(x => x && x.score !== null && x.score < 1 && x.scoreDisplayMode !== "notApplicable" && x.scoreDisplayMode !== "manual" && x.scoreDisplayMode !== "informative");
if (fails.length) console.log("a11y fails:", fails.map(f => f.id).join(", "));
'
