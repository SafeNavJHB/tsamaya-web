// metros.mjs — the editorial content for the per-metro landing pages.
//
// The *numbers* on these pages come from src/data/stats.json (live database).
// The *words* live here. Keeping them apart means a data refresh never silently
// rewrites the prose, and an editing pass never invents a statistic.
//
// EDITORIAL RULE, PLEASE READ BEFORE ADDING ANYTHING:
// These pages never name a suburb, township or sub-place as high-risk. The risk
// data is at census sub-place granularity and the red band is overwhelmingly
// townships and informal settlements — publishing those names as a permanent,
// indexable list would function as a redline map, regardless of intent. Naming
// *roads and routes* is fine (they're public infrastructure and it's what a driver
// actually searches for); naming *where people live* is not. The app shows a
// driver their surroundings in context; a marketing page is a different act.

export const metros = [
  {
    key: 'johannesburg',
    slug: 'johannesburg',
    name: 'Johannesburg',
    region: 'Gauteng',
    // Short, keyword-honest description used in <meta> and the coverage grid.
    blurb:
      'Risk-aware driving routes across Johannesburg — the CBD, the northern suburbs, Soweto and the M1/M2 corridors.',
    // The opening paragraph. Written for a driver, not a search engine, because
    // pages written for search engines now rank worse than pages written for people.
    intro:
      'Johannesburg is where Tsamaya started, and it remains the densest part of the map. The city’s road network funnels an enormous amount of traffic through a handful of arteries — the M1 and M2, Empire Road, Louis Botha, Oxford — and those arteries pass close to areas where vehicle crime clusters. A route that optimises purely for time will happily send you through the worst of it at the worst hour of the day.',
    // Genuinely useful local driving context. Roads and behaviour, never suburbs.
    context: [
      'The M1 and M2 through the inner city carry the highest concentration of flagged road segments in the country — mostly smash-and-grab and stop-street robbery reports clustered at off-ramps and traffic-light intersections.',
      'Risk in Johannesburg shifts more sharply by time of day than in any other metro we map. Several corridors that carry no penalty at midday move to the highest band after 19:30.',
      'Load-shedding matters here: dark intersections change the risk profile of an otherwise ordinary route, which is part of why the evening and night bands exist as separate ratings rather than a single "after dark" flag.',
    ],
    faqs: [
      {
        q: 'Does Tsamaya cover Soweto and the southern suburbs?',
        a: 'Yes. Johannesburg coverage spans the full municipal area, including Soweto, the southern suburbs and the inner city, not just the northern suburbs.',
      },
      {
        q: 'Will it route me the long way round?',
        a: 'Only within limits. A detour has to actually reduce measured risk exposure to be offered at all, and a route that is dramatically longer than the direct one is rejected even if it is safer. In practice most lower-risk routes in Johannesburg add a few minutes, not half an hour.',
      },
      {
        q: 'Does it work on the highways out of Joburg?',
        a: 'Yes — the N1, N3, N12 and N17 are all mapped, and the major freeways carry protective ratings so the app will not push you off a freeway onto surface roads to shave a risk score.',
      },
    ],
  },
  {
    key: 'cape_town',
    slug: 'cape-town',
    name: 'Cape Town',
    region: 'Western Cape',
    blurb:
      'Risk-aware driving routes across Cape Town — the N1, N2, R300 and the routes in and out of the city bowl.',
    intro:
      'Cape Town has the largest zone count of any metro on the map, and a geography that makes routing unusually consequential. Mountain and coastline mean there are often only two or three ways to get between two points, so when a route does pass a flagged area there is rarely a trivial alternative. That makes the difference between a considered detour and a naive one much bigger here than elsewhere.',
    context: [
      'The N2 corridor between the airport and the city is the single most-searched safety question we get about Cape Town. It is fully mapped, with separate ratings by time of day.',
      'The N1, N2, N7 and R300 carry protective ratings, so the router will not divert you off a major freeway onto surface streets purely to reduce a score — a failure mode that would make you less safe, not more.',
      'Cape Town’s risk pattern is more geographically concentrated than Johannesburg’s: large parts of the metro carry no penalty at all, which is why the map looks emptier here despite having more zones overall.',
    ],
    faqs: [
      {
        q: 'Is the drive from Cape Town International into the city covered?',
        a: 'Yes. The N2 airport corridor is mapped in both directions with day, evening and night ratings, and the app will show you what it routed around if it takes you a different way.',
      },
      {
        q: 'Does Tsamaya work over Table Mountain and the peninsula?',
        a: 'The full City of Cape Town municipal area is mapped, including the Atlantic seaboard, the southern peninsula and the Cape Flats.',
      },
      {
        q: 'Why does the Cape Town map look emptier than Johannesburg?',
        a: 'Because it genuinely is. Risk in Cape Town concentrates into specific areas rather than spreading along arterial roads the way it does in Johannesburg. Blank map is real information — it means no flagged data, not missing data.',
      },
    ],
  },
  {
    key: 'pretoria',
    slug: 'pretoria',
    name: 'Pretoria',
    region: 'Gauteng',
    blurb:
      'Risk-aware driving routes across Pretoria and Tshwane — the N1, N4, Ben Schoeman and the routes into the CBD.',
    intro:
      'Pretoria sits at the northern end of the country’s busiest commuter corridor, and a large share of the driving here is the daily run down the Ben Schoeman to Johannesburg and back. The city itself has a compact, high-density centre surrounded by long arterial routes, which produces a very different risk shape from Johannesburg’s sprawl.',
    context: [
      'The Ben Schoeman (N1) and the N4 both carry protective ratings. An early version of the data flagged a stretch of the Ben Schoeman in a way that would have pushed traffic onto surface roads; that was caught by a cross-metro validation check and corrected.',
      'Pretoria has proportionally more mid-band (caution) zones than any other metro we map, which means more routes get a small nudge rather than a full re-route.',
      'The CBD and the areas immediately around it change rating between the daytime and evening bands more often than the outer suburbs do.',
    ],
    faqs: [
      {
        q: 'Does Tsamaya cover all of Tshwane or just central Pretoria?',
        a: 'The mapped area covers the Tshwane metro, including Centurion, Mamelodi, Atteridgeville and the eastern suburbs, not only the central city.',
      },
      {
        q: 'Is the Ben Schoeman commute covered end to end?',
        a: 'Yes — the N1 corridor between Pretoria and Johannesburg is mapped from both ends, and both metros are live, so a route across the two is handled as one continuous drive.',
      },
    ],
  },
  {
    key: 'ekurhuleni',
    slug: 'ekurhuleni',
    name: 'Ekurhuleni',
    region: 'Gauteng',
    blurb:
      'Risk-aware driving routes across Ekurhuleni and the East Rand — OR Tambo, the N12, N17 and R21 corridors.',
    intro:
      'Ekurhuleni covers the East Rand — Kempton Park, Benoni, Boksburg, Germiston, Springs and the belt around OR Tambo International. It is the metro most drivers pass through without thinking about, because the airport run and the N12 and N17 freight corridors cut straight across it. It also carries the highest proportion of top-band zones of any metro on our map.',
    context: [
      'The R21 and N12 around OR Tambo are heavily travelled by drivers who do not know the area, which is exactly the situation risk-aware routing is for.',
      'Ekurhuleni has the highest share of top-band zones of any metro we map — a majority of its flagged areas sit in the red band rather than the middle ones.',
      'Freight routes matter here in a way they do not elsewhere: truck hijacking appears in the underlying crime data along the N12 and N17 corridors, and those roads are rated accordingly.',
    ],
    faqs: [
      {
        q: 'Does Tsamaya cover the drive to OR Tambo?',
        a: 'Yes. The airport approaches on the R21, N12 and surrounding roads are mapped, with separate ratings for day, evening and night.',
      },
      {
        q: 'Is the East Rand the same as Ekurhuleni?',
        a: 'Effectively yes — Ekurhuleni is the metropolitan municipality that covers the area most people still call the East Rand, including Kempton Park, Benoni, Boksburg, Germiston and Springs.',
      },
    ],
  },
  {
    key: 'west_rand',
    slug: 'west-rand',
    name: 'West Rand',
    region: 'Gauteng',
    blurb:
      'Risk-aware driving routes across the West Rand — Roodepoort, Krugersdorp, Randfontein and the N14 corridor.',
    intro:
      'The West Rand covers Roodepoort, Krugersdorp, Randfontein and the mining belt west of Johannesburg. It is a smaller map than the Gauteng metros to its east, and a noticeably different one: a large share of the area carries an explicit verified-safe rating rather than simply having no data.',
    context: [
      'The N14 and the R28 are the two routes most West Rand driving depends on, and both are mapped end to end.',
      'This metro has an unusually high proportion of verified-safe zones — areas actively checked and rated as carrying no penalty, rather than areas we simply have no data for. That distinction matters: one is knowledge, the other is a gap.',
      'The commute into Johannesburg along the N1 and the M5 is covered continuously, because both metros are live.',
    ],
    faqs: [
      {
        q: 'Does Tsamaya cover Krugersdorp and Roodepoort?',
        a: 'Yes, both are inside the mapped West Rand area, along with Randfontein and the surrounding routes.',
      },
      {
        q: 'Why does the West Rand have fewer zones than Johannesburg?',
        a: 'It is a smaller and less densely populated area, so there is genuinely less to map. Fewer zones here reflects the size of the area, not thinner coverage of it.',
      },
    ],
  },
  {
    key: 'secunda',
    slug: 'secunda',
    name: 'Secunda',
    region: 'Mpumalanga',
    blurb:
      'Risk-aware driving routes around Secunda and Evander — the N17 and the routes through the petrochemical belt.',
    intro:
      'Secunda is the smallest metro on the map and the only one outside the two big provincial centres. It exists on the map because of the N17 — the corridor that carries an enormous amount of shift traffic and freight through the petrochemical belt, much of it driven in the dark at either end of a shift.',
    context: [
      'Shift patterns mean a large share of Secunda driving happens in the evening and night bands, which is precisely when ratings diverge most from the daytime picture.',
      'The N17 is the spine of this map and is rated along its length.',
      'Coverage here is deliberately tight around the town and its approach roads rather than spread thin across the wider district.',
    ],
    faqs: [
      {
        q: 'Why is Secunda on the map when much bigger cities are not?',
        a: 'Because of the N17 corridor and the shift-work driving pattern around the petrochemical plants — a lot of routine driving happens there after dark, which is when risk-aware routing is most useful.',
      },
      {
        q: 'Does coverage extend to Evander and Trichardt?',
        a: 'The mapped area covers Secunda and its immediate approach roads, including the routes toward Evander.',
      },
    ],
  },
  {
    key: 'stellenbosch',
    slug: 'stellenbosch',
    name: 'Stellenbosch',
    region: 'Western Cape',
    blurb:
      'Risk-aware driving routes around Stellenbosch — the R44, R304 and the routes between the town and Cape Town.',
    intro:
      'Stellenbosch is the newest addition to the map and the most recent test of whether the approach transfers to a smaller town rather than a sprawling metro. It largely does, with one adjustment: in a town this size the zones are small and close together, so the routing has to be more careful about detours that would otherwise be trivially short.',
    context: [
      'The R44 and R304 connect the town to the N1 and N2, and both are mapped.',
      'Stellenbosch overlaps geographically with the edge of the Cape Town map, so routes between the two are handled continuously rather than stopping at a boundary.',
      'It is a small map by design — 32 zones rather than hundreds — because the town is small, not because coverage is partial.',
    ],
    faqs: [
      {
        q: 'Does Tsamaya work for the drive between Stellenbosch and Cape Town?',
        a: 'Yes. Both areas are live and their maps adjoin, so a route between them is treated as one continuous drive rather than two separate ones.',
      },
      {
        q: 'Is a small town really worth mapping?',
        a: 'The student population does a lot of after-dark driving in a compact area, which is a good match for time-of-day risk ratings. It was also a deliberate test of whether the method works outside the big metros.',
      },
    ],
  },
];

// Look up the editorial entry for a metro key from stats.json.
export const metroByKey = (key) => metros.find((m) => m.key === key);
