#!/usr/bin/env python3
"""make-land-outline.py — regenerates src/data/za-land.json, the outline of South
Africa the coverage map is drawn on.

WHY IT IS A SEPARATE, MANUAL SCRIPT
The site build has no dependencies and never touches the network, so it cannot
derive a country outline itself. This script does that once, offline, against the
same StatsSA 2011 sub-place layer the risk pipeline already uses, and writes a
small JSON file that IS committed. Same arrangement as `npm run stats` and
`npm run images`: a manual step whose output lives in the repo.

You will almost never need to run it. Provincial and national borders do not move.

    /Users/kyle/Projects/SafeNav/pipeline/.venv/bin/python scripts/make-land-outline.py

Requires: geopandas + the StatsSA national sub-place shapefile from the pipeline
repo (pipeline/data/raw/statssa_subplace_national.zip). Both live in the SafeNav
pipeline checkout; pass --pipeline if yours is somewhere else.

WHAT IT EMITS, AND WHY IT IS SHAPED THIS WAY
  land    — ONE set of rings for the whole country, holes included (Lesotho is a
            hole; it is drawn with fill-rule="evenodd" so it stays a hole).
  borders — the INTERNAL provincial borders only, as bare lines.

The obvious alternative — nine province polygons, each filled — was tried and
rejected. Simplifying two polygons that share a border does not simplify the
shared vertices identically, so every internal border ends up with hairline gaps
and overlaps of up to the simplification tolerance. Filling the country once and
drawing the internal borders as lines on top makes that failure mode impossible.
"""

import argparse
import json
import sys
from pathlib import Path

import geopandas as gpd
from shapely.geometry import MultiPolygon, Polygon
from shapely.ops import linemerge, unary_union

# MDB municipality-code prefix → province. The sub-place layer carries no
# province column; the municipality code's prefix is the province, except for the
# eight metros, which carry their own three-letter codes.
PROVINCE_BY_PREFIX = {
    "WC0": "Western Cape", "CPT": "Western Cape",
    "EC1": "Eastern Cape", "EC4": "Eastern Cape", "BUF": "Eastern Cape", "NMA": "Eastern Cape",
    "NC0": "Northern Cape", "NC4": "Northern Cape",
    "FS1": "Free State", "FS2": "Free State", "MAN": "Free State",
    "KZN": "KwaZulu-Natal", "ETH": "KwaZulu-Natal",
    "NW3": "North West", "NW4": "North West",
    "GT4": "Gauteng", "JHB": "Gauteng", "TSH": "Gauteng", "EKU": "Gauteng",
    "MP3": "Mpumalanga",
    "LIM": "Limpopo",
}

# Douglas-Peucker tolerances, in degrees. The whole country is ~1 000 SVG units
# wide, so one degree of longitude is roughly 60 units and 0.006 degrees is about
# a third of a unit — below what a screen can show, while cutting the vertex
# count by well over 90%. Provincial borders are context rather than the subject,
# so they get a coarser one; every point saved there is page weight on eleven
# pages.
LAND_TOLERANCE = 0.006
BORDER_TOLERANCE = 0.02

# Drop anything smaller than this (square degrees). Keeps the mainland and the
# few islands attached to it; discards the Prince Edward Islands, which sit
# 1 800 km south-east and would otherwise force the map to zoom out to nothing.
MIN_AREA = 0.0008
MAINLAND_BOUNDS = (15.0, -35.5, 34.0, -21.5)  # lng min, lat min, lng max, lat max

# Dissolving 22 196 hand-digitised sub-places leaves hairline gaps between
# neighbours. They surface as two kinds of rubbish, and both need a floor:
#   - interior rings a few metres across, which would be drawn as holes in the
#     country. Lesotho, the one hole that is real, is about 3.0 square degrees.
MIN_HOLE_AREA = 0.05
#   - border fragments a few metres long. A real provincial border runs for
#     degrees; anything under ~5 km is a sliver, not a border.
MIN_BORDER_LEN = 0.05


def declutter(geom):
    """Drop specks and sliver holes from a dissolved polygon.

    Dissolving hand-digitised sub-places leaves both. The sliver holes matter far
    more than they look: they sit ALONG the provincial borders, so they end up in
    the national boundary, and anything derived from that boundary then eats the
    real borders. Removing them here is what makes the border extraction work.
    """
    polys = [p for p in getattr(geom, "geoms", [geom]) if p.area >= MIN_AREA]
    kept = [
        Polygon(p.exterior, [r for r in p.interiors if Polygon(r).area >= MIN_HOLE_AREA])
        for p in polys
    ]
    return unary_union(kept)


def merged_lines(geom):
    """linemerge() that tolerates being handed a single LineString."""
    if geom.is_empty:
        return []
    if geom.geom_type == "LineString":
        return [geom]
    merged = linemerge(geom)
    return [ln for ln in getattr(merged, "geoms", [merged]) if ln.geom_type == "LineString"]


def rings(geom, out):
    """Flatten a (Multi)Polygon into a list of closed coordinate rings.

    Interior rings below MIN_HOLE_AREA are dropped: they are dissolve slivers,
    not real holes in the country.
    """
    polys = geom.geoms if isinstance(geom, MultiPolygon) else [geom]
    for poly in polys:
        if not isinstance(poly, Polygon) or poly.is_empty:
            continue
        holes = [r for r in poly.interiors if Polygon(r).area >= MIN_HOLE_AREA]
        for ring in [poly.exterior, *holes]:
            coords = [[round(x, 3), round(y, 3)] for x, y in ring.coords]
            # Rounding can collapse neighbouring vertices onto each other.
            deduped = [coords[0]]
            for c in coords[1:]:
                if c != deduped[-1]:
                    deduped.append(c)
            if len(deduped) >= 4:
                out.append(deduped)


def lines(geom, out):
    """Flatten a (Multi)LineString into a list of coordinate paths."""
    parts = getattr(geom, "geoms", [geom])
    for part in parts:
        if part.is_empty or part.geom_type != "LineString":
            continue
        coords = [[round(x, 3), round(y, 3)] for x, y in part.coords]
        deduped = [coords[0]]
        for c in coords[1:]:
            if c != deduped[-1]:
                deduped.append(c)
        if len(deduped) >= 2:
            out.append(deduped)


def main() -> int:
    here = Path(__file__).resolve().parent.parent
    ap = argparse.ArgumentParser()
    ap.add_argument("--pipeline", default=str(Path.home() / "Projects/SafeNav/pipeline"))
    ap.add_argument("--out", default=str(here / "src" / "data" / "za-land.json"))
    ap.add_argument("--cache", default="", help="optional path to cache the dissolved provinces (speeds up re-runs)")
    args = ap.parse_args()

    cache = Path(args.cache) if args.cache else None
    if cache and cache.exists():
        print(f"  reusing dissolved provinces from {cache}")
        provinces = gpd.read_file(cache).set_index("province")["geometry"]
    else:
        zip_path = Path(args.pipeline) / "data" / "raw" / "statssa_subplace_national.zip"
        if not zip_path.exists():
            print(f"Cannot find {zip_path}. Pass --pipeline <path to the pipeline checkout>.")
            return 1

        print(f"  reading {zip_path.name} (this takes a minute — it is 22 196 sub-places)")
        gdf = gpd.read_file(f"zip://{zip_path}!Subplace/SP_SA_2011.shp", columns=["MN_MDB_C"])
        gdf = gdf.to_crs("EPSG:4326")

        gdf["province"] = gdf["MN_MDB_C"].astype(str).str[:3].map(PROVINCE_BY_PREFIX)
        unknown = gdf[gdf["province"].isna()]["MN_MDB_C"].astype(str).str[:3].unique()
        if len(unknown):
            print(f"  ! municipality prefixes with no province mapping: {sorted(unknown)}")
            return 1

        # Repair before dissolving: the 2011 layer has self-intersecting rings,
        # and a single bad ring aborts the whole union.
        gdf["geometry"] = gdf.geometry.make_valid()

        print("  dissolving provinces")
        dissolved = gdf.dissolve(by="province")

        # Sub-places were digitised one by one, so neighbours do not share exact
        # edges. Closing the hairline gaps here — grow by ~90 m, shrink back —
        # means the dissolve produces solid provinces instead of lace.
        print("  closing digitising slivers")
        dissolved["geometry"] = dissolved.geometry.buffer(0.0008).buffer(-0.0008)
        provinces = dissolved["geometry"]

        if cache:
            cache.parent.mkdir(parents=True, exist_ok=True)
            dissolved.reset_index()[["province", "geometry"]].to_file(cache, driver="GeoJSON")
            print(f"  cached dissolved provinces → {cache}")

    print("  building the national outline")
    national = unary_union(list(provinces))

    # Drop the far-flung islands and any speck too small to draw.
    keep = []
    for poly in getattr(national, "geoms", [national]):
        minx, miny, maxx, maxy = poly.bounds
        inside = (
            MAINLAND_BOUNDS[0] <= minx and maxx <= MAINLAND_BOUNDS[2]
            and MAINLAND_BOUNDS[1] <= miny and maxy <= MAINLAND_BOUNDS[3]
        )
        if inside and poly.area >= MIN_AREA:
            keep.append(poly)
    national = declutter(unary_union(keep))
    holes = sum(len(p.interiors) for p in getattr(national, "geoms", [national]))
    print(f"  kept {len(keep)} land polygon(s), {holes} hole(s) — Lesotho is the one real hole")

    print("  extracting internal provincial borders")
    # A provincial border is the part of a province's own outline that is NOT
    # also the country's outline. Taking each province's boundary separately is
    # load-bearing: unioning all nine first nodes them against each other at
    # every crossing and returns 180 000 disconnected snippets that no amount of
    # stitching brings back.
    coast = national.boundary.buffer(0.002)  # ~200 m, comfortably above float noise

    # Every internal border belongs to two provinces, so walking the nine in turn
    # traces each one twice. Subtracting what has already been collected — with a
    # 200 m tolerance, since the two tracings differ by a few metres — keeps one
    # copy of each. Without it the map carries about 150 degrees of border line
    # where the real network is 75.
    deduped, collected = [], None
    for name, geom in provinces.items():
        internal = declutter(geom).boundary.difference(coast)
        if collected is not None:
            internal = internal.difference(collected.buffer(0.002))
        arcs = [ln for ln in merged_lines(internal) if ln.length >= MIN_BORDER_LEN]
        deduped.extend(arcs)
        if arcs:
            collected = unary_union(arcs if collected is None else [collected, *arcs])
        print(f"    {name:<15} {len(arcs):>2} new arc(s), {sum(a.length for a in arcs):>6.2f} degrees")
    print(f"  {len(deduped)} border arc(s), {sum(a.length for a in deduped):.1f} degrees in total")

    land, borders = [], []
    rings(national.simplify(LAND_TOLERANCE, preserve_topology=True), land)
    for arc in deduped:
        lines(arc.simplify(BORDER_TOLERANCE, preserve_topology=True), borders)

    minx, miny, maxx, maxy = national.bounds
    payload = {
        "_generated": "scripts/make-land-outline.py — do not hand-edit",
        "_source": "Statistics South Africa, Sub-place layer SP_SA_2011 (Census 2011), dissolved to provinces",
        "_tolerance_deg": {"land": LAND_TOLERANCE, "borders": BORDER_TOLERANCE},
        "bounds": {
            "lngMin": round(minx, 3), "lngMax": round(maxx, 3),
            "latMin": round(miny, 3), "latMax": round(maxy, 3),
        },
        "land": land,
        "borders": borders,
    }

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, separators=(",", ":")) + "\n", encoding="utf8")

    land_pts = sum(len(r) for r in land)
    border_pts = sum(len(l) for l in borders)
    print(
        f"\n  land    {len(land):>4} ring(s)  {land_pts:>6} points"
        f"\n  borders {len(borders):>4} line(s)  {border_pts:>6} points"
        f"\n  bounds  {payload['bounds']}"
        f"\n  → wrote {out_path} ({out_path.stat().st_size / 1024:.0f} kB)\n"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
