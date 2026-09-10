#!/usr/bin/env python3
"""make-coverage-shapes.py — regenerates src/data/metro-shapes.json, the real
outline of the ground Tsamaya has actually rated in each metro.

WHY THIS AND NOT A BOUNDING BOX
The first version of the coverage map drew each metro as a rectangle, because a
rectangle is what the app's service-area gate is. It was accurate and it looked
like a spreadsheet. This dissolves the metro's actual risk zones into one shape,
which is both better looking and a truer answer to "where does this thing work":
the gate is a box, but the ground that carries ratings is the zones, and it is
the zones that decide whether the app has anything to tell you.

    set -a && source ~/Projects/SafeNav/.env && set +a
    ~/Projects/SafeNav/pipeline/.venv/bin/python scripts/make-coverage-shapes.py

Reads SUPABASE_URL / SUPABASE_ANON_KEY (or the EXPO_PUBLIC_ ones the app uses),
exactly like scripts/fetch-stats.mjs. Run it in the same sitting as `npm run
stats` so the shapes and the counts describe the same database. The site build
never touches the network; it reads the committed JSON.

WHICH ZONES GET DRAWN
A zone is drawn by the metro named in its `city` column — that attribution comes
from the pipeline's municipal assignment and is the same one the published zone
counts use — provided the zone lies mostly inside SOME metro's service area.
Service areas are the boxes in src/data/metro-bounds.json, the app's own GPS
gate, taken as one union rather than one at a time.

Both halves of that are load-bearing, and both were got wrong first:

  Testing a zone only against ITS OWN metro's box leaves holes. Bassonia,
  Glenvista and Liefde en Vrede are tagged to Ekurhuleni and are in Johannesburg;
  three red "City of Johannesburg NU" polygons are tagged to the West Rand;
  Noordwyk is tagged to Pretoria and is in Midrand. Eleven rated zones, several
  red, ended up inside a served area and on nobody's shape, because the metro
  they were tagged to correctly refused them and the metro they are actually in
  never saw them.

  Attributing GEOMETRICALLY instead of by the `city` column is worse still. The
  service boxes overlap heavily and are not a partition: Ekurhuleni's covers a
  large part of eastern Johannesburg, so "smallest box containing it wins" moved
  448 zones out of Johannesburg and into Ekurhuleni and the West Rand. Hovering
  Ekurhuleni in the list would then have lit up half of Johannesburg. Attributing
  by the cities.ts order is worse again: Johannesburg is listed first and its box
  spans all of Gauteng, so Pretoria, Ekurhuleni and the West Rand were left with
  nothing whatsoever to draw.

Testing against the boxes at all is necessary because StatsSA sub-places include
enormous rural "NU" remainders, and the pipeline pulls one in whole whenever it
so much as touches a metro's box. "Hessequa NU" is 5 000 km2 and is tagged to
Mossel Bay, whose coverage therefore stretched from Riversdale past George, five
times the width of the municipality. "Kgetlengrivier NU" is tagged to Rustenburg
and is three times the size of Rustenburg's entire service area, of which 2.5%
is in it.

Clipping every shape to its box was tried too and is worse: where a metro's own
rural remainder blankets the box — Govan Mbeki NU covers 70% of Secunda's — the
clip returns the box itself, so the small metros came out as rectangles again,
which is exactly what this map exists to stop being.

WHAT IT DOES NOT PUBLISH
Only the OUTLINE of each metro's coverage, dissolved. No zone names, no risk
bands, no per-zone geometry. A reader can see that Tsamaya has rated a patch of
ground the shape of eThekwini; they cannot see which part of it is red. That
line is the same one src/data/metros.mjs draws, and for the same reason.
"""

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from shapely.geometry import Polygon, box, shape
from shapely.ops import unary_union

# The metros the site publishes, in the same order and spelling as
# scripts/fetch-stats.mjs. `key` is the DB `city` value.
METROS = [
    "johannesburg", "cape_town", "pretoria", "ekurhuleni", "west_rand", "secunda",
    "stellenbosch", "rustenburg", "pilanesberg", "mossel_bay", "durban", "gqeberha",
]

PAGE = 500  # rows per request; zone geometry is large, so keep the pages small

# Douglas-Peucker tolerance in degrees. The whole country is drawn 1000 units
# wide, so a degree of longitude is about 61 units and 0.004 degrees is a quarter
# of a unit — under a third of a pixel at the size this is ever displayed, while
# removing the great majority of the vertices. Metro coverage is only ever a few
# dozen units across on this map; detail below this is invisible by definition.
TOLERANCE = 0.004

# Dissolving hundreds of separately digitised sub-places leaves hairline cracks
# between neighbours. Grow by ~110 m and shrink back to close them, so a metro
# reads as one piece of ground rather than a shattered mosaic.
CLOSE = 0.001

# Holes and specks below these (square degrees) are dissolve artefacts, not
# real gaps in coverage. 0.0004 is roughly 4 km2 at these latitudes.
MIN_HOLE_AREA = 0.0004
MIN_PART_AREA = 0.0002


def fetch_city(base, key, city):
    """Every live zone geometry for one city, paged."""
    out, offset = [], 0
    while True:
        query = urllib.parse.urlencode({
            "select": "id,geometry",
            "deleted_at": "is.null",
            "city": f"eq.{city}",
            # Ordering is not optional with limit/offset. Postgres makes no
            # promise about row order between two unordered queries, so paging
            # without it can hand back the same row twice and skip another —
            # and a skipped zone quietly shrinks a metro's coverage.
            "order": "id.asc",
            "limit": PAGE,
            "offset": offset,
        })
        req = urllib.request.Request(
            f"{base}/rest/v1/zones?{query}",
            headers={"apikey": key, "Authorization": f"Bearer {key}"},
        )
        # A dozen requests of half a megabyte each; one of them being reset by the
        # far end is ordinary, and losing the whole run to it is not.
        for attempt in range(4):
            try:
                with urllib.request.urlopen(req, timeout=120) as res:
                    rows = json.load(res)
                break
            except (urllib.error.URLError, ConnectionError, TimeoutError) as err:
                if attempt == 3:
                    raise
                wait = 2 ** attempt
                print(f"    {city}: {type(err).__name__}, retrying in {wait}s")
                time.sleep(wait)
        out.extend(rows)
        if len(rows) < PAGE:
            return out
        offset += PAGE


def rings_of(geom):
    """Flatten a (Multi)Polygon into closed coordinate rings, dropping specks."""
    out = []
    for poly in getattr(geom, "geoms", [geom]):
        if poly.is_empty or poly.geom_type != "Polygon" or poly.area < MIN_PART_AREA:
            continue
        holes = [r for r in poly.interiors if Polygon(r).area >= MIN_HOLE_AREA]
        for ring in [poly.exterior, *holes]:
            coords = [[round(x, 4), round(y, 4)] for x, y in ring.coords]
            deduped = [coords[0]]
            for c in coords[1:]:
                if c != deduped[-1]:
                    deduped.append(c)
            if len(deduped) >= 4:
                out.append(deduped)
    return out


def largest_part(geom):
    """The biggest polygon in a (Multi)Polygon."""
    parts = list(getattr(geom, "geoms", [geom]))
    return max(parts, key=lambda p: p.area)


def anchor_point(geom):
    """Where to put the marker and hang the label.

    The centroid of the largest piece, which lands in the main urban mass, unless
    that piece is crescent-shaped enough that its centroid falls outside it —
    Cape Town wraps around a mountain — in which case take a point guaranteed to
    be on the surface.
    """
    part = largest_part(geom)
    c = part.centroid
    return c if part.contains(c) else part.representative_point()


def main() -> int:
    here = Path(__file__).resolve().parent.parent
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(here / "src" / "data" / "metro-shapes.json"))
    ap.add_argument("--dry", action="store_true")
    args = ap.parse_args()

    base = (os.environ.get("SUPABASE_URL") or os.environ.get("EXPO_PUBLIC_SUPABASE_URL") or "").rstrip("/")
    key = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("EXPO_PUBLIC_SUPABASE_ANON_KEY") or ""
    if not base or not key:
        print(
            "Missing credentials. Set SUPABASE_URL and SUPABASE_ANON_KEY, e.g.:\n\n"
            "  set -a && source ~/Projects/SafeNav/.env && set +a\n"
        )
        return 1

    bounds_path = here / "src" / "data" / "metro-bounds.json"
    bounds = json.loads(bounds_path.read_text(encoding="utf8"))["metros"]
    known = {m["key"] for m in bounds}
    for city in METROS:
        if city not in known:
            print(f"  ! {city} has no entry in metro-bounds.json — run `npm run bounds` first")
            return 1
    # Every service area as one shape. A zone is drawn if most of it is inside
    # this, wherever "inside" happens to be; who draws it is the `city` column.
    served = unary_union([
        box(m["bbox"]["lngMin"], m["bbox"]["latMin"], m["bbox"]["lngMax"], m["bbox"]["latMax"])
        for m in bounds
    ])

    owned = {city: [] for city in METROS}
    homeless = 0
    geomless = 0  # rows with no usable geometry; counted so they cannot vanish quietly
    for city in METROS:
        rows = fetch_city(base, key, city)
        if not rows:
            print(f"  ! {city}: no live zones")
            continue
        for row in rows:
            g = row.get("geometry")
            if not g:
                geomless += 1
                continue
            # PostGIS hands PostgREST a `crs` member that shapely does not want.
            g.pop("crs", None)
            geom = shape(g)
            if not geom.is_valid:
                geom = geom.buffer(0)
            if geom.is_empty or geom.area <= 0:
                geomless += 1
                continue
            if geom.intersection(served).area >= 0.5 * geom.area:
                owned[city].append(geom)
            else:
                homeless += 1

    metros, total_pts = {}, 0
    for city in METROS:
        polys = owned.get(city) or []
        if not polys:
            print(f"  ! {city}: nothing to draw — skipped")
            continue

        dissolved = unary_union(polys)

        # Close the digitising cracks, then simplify. Order matters: simplifying
        # first turns a crack into a wedge that the close can no longer shut.
        closed = dissolved.buffer(CLOSE).buffer(-CLOSE)
        simplified = closed.simplify(TOLERANCE, preserve_topology=True)

        rings = rings_of(simplified)
        if not rings:
            print(f"  ! {city}: dissolved to nothing — skipped")
            continue

        point = anchor_point(simplified)
        pts = sum(len(r) for r in rings)
        total_pts += pts
        metros[city] = {
            "rings": rings,
            "point": [round(point.x, 4), round(point.y, 4)],
            "zones": len(polys),
        }
        print(f"  {city:<14} {len(polys):>4} zones → {len(rings):>3} ring(s), {pts:>5} points")

    if geomless:
        print(f"\n  ! {geomless} row(s) had no usable geometry and were skipped.")
    if homeless:
        print(
            f"\n  {homeless} zone(s) lie mostly outside every service area and are drawn by nobody."
            "\n  That is the intended outcome for a rural remainder tagged to a metro it merely touches."
        )

    missing = [c for c in METROS if c not in metros]
    if missing:
        print(f"\n  ! no shape for: {', '.join(missing)}")

    payload = {
        "_generated": "scripts/make-coverage-shapes.py — do not hand-edit",
        "_source": "live Supabase `zones` table, dissolved per city",
        "_tolerance_deg": TOLERANCE,
        "metros": metros,
    }
    json_text = json.dumps(payload, separators=(",", ":")) + "\n"

    drawn = sum(len(v) for v in owned.values())
    print(
        f"\n  {len(metros)} metros, {total_pts} points, {len(json_text) / 1024:.0f} kB"
        f"\n  {drawn + homeless + geomless} live zones read: {drawn} drawn,"
        f" {homeless} outside every service area, {geomless} without geometry"
    )
    if args.dry:
        print("  --dry: not written.\n")
        return 0
    Path(args.out).write_text(json_text, encoding="utf8")
    print(f"  → wrote {args.out}\n  Commit it so the build picks it up.\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
