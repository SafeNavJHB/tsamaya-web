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
      'Driving routes around the risky parts of Johannesburg: the CBD, the northern suburbs, Soweto and the M1 and M2.',
    // The opening paragraph. Written for a driver, not a search engine, because
    // pages written for search engines now rank worse than pages written for people.
    intro:
      'Johannesburg is where Tsamaya started and it is still the busiest part of the map. Almost everything funnels through a handful of roads: the M1 and M2, Empire, Louis Botha, Oxford. Those roads run close to the places where vehicle crime concentrates. Plan purely for speed and you will be sent through the worst of it at the worst time of night, without being told.',
    // Genuinely useful local driving context. Roads and behaviour, never suburbs.
    context: [
      'The M1 and M2 through the inner city carry more flagged stretches than anywhere else in the country. Most of it is smash-and-grab and robbery at off-ramps and traffic lights.',
      'Ratings move more between day and night here than in any other metro we cover. Several roads that carry no penalty at midday sit in the top band after 19:30.',
      'Load-shedding matters. A dark intersection is a different proposition from a lit one, which is why evening and night are rated separately instead of lumped together as "after dark".',
    ],
    faqs: [
      {
        q: 'Does Tsamaya cover Soweto and the southern suburbs?',
        a: 'Yes. Coverage spans the whole municipal area: Soweto, the southern suburbs and the inner city, as well as the northern suburbs.',
      },
      {
        q: 'Will it route me the long way round?',
        a: 'Only within limits. A detour has to actually cut your exposure to be offered, and anything dramatically longer than the direct route gets rejected even when it is safer. In practice most lower-risk routes across Johannesburg add a few minutes.',
      },
      {
        q: 'Does it work on the highways out of Joburg?',
        a: 'Yes. The N1, N3, N12 and N17 are all mapped, and the major freeways carry protective ratings so the app will not push you off a freeway onto side roads to shave a score.',
      },
    ],
  },
  {
    key: 'cape_town',
    slug: 'cape-town',
    name: 'Cape Town',
    region: 'Western Cape',
    blurb:
      'Driving routes around the risky parts of Cape Town: the N1, N2, R300 and the ways in and out of the city bowl.',
    intro:
      'Cape Town has more rated areas than any other metro we cover, and a geography that makes the routing matter more. Mountain and coastline mean there are often only two or three ways between any two points, so when a route does pass something flagged there is rarely an easy alternative. A thoughtless detour costs you much more here than it would in Johannesburg.',
    context: [
      'The N2 between the airport and the city is the thing people ask about most. It is mapped end to end, rated separately for each time of day.',
      'The N1, N2, N7 and R300 carry protective ratings. Diverting you off a freeway onto side streets to improve a number would leave you worse off, so the router will not do it.',
      'Risk here sits in specific pockets rather than spreading along the main roads. Large parts of the metro carry no penalty at all, which is why the map looks emptier than Johannesburg despite having more rated areas.',
    ],
    faqs: [
      {
        q: 'Is the drive from Cape Town International into the city covered?',
        a: 'Yes. The N2 airport corridor is mapped both ways with separate day, evening and night ratings. If the app takes you a different way, it tells you what it went around.',
      },
      {
        q: 'Does Tsamaya work over Table Mountain and the peninsula?',
        a: 'The full City of Cape Town municipal area is mapped, including the Atlantic seaboard, the southern peninsula and the Cape Flats.',
      },
      {
        q: 'Why does the Cape Town map look emptier than Johannesburg?',
        a: 'Because it genuinely is emptier. Risk here sits in specific areas instead of spreading along the main roads. Blank map is real information: it means nothing was flagged, not that we never looked.',
      },
    ],
  },
  {
    key: 'pretoria',
    slug: 'pretoria',
    name: 'Pretoria',
    region: 'Gauteng',
    blurb:
      'Driving routes around the risky parts of Pretoria and Tshwane: the N1, N4, the Ben Schoeman and the roads into the CBD.',
    intro:
      'Pretoria sits at the top of the busiest commuter run in the country, and a good share of the driving here is the daily trip down the Ben Schoeman and back. The city has a tight, dense centre wrapped in long arterial roads, which gives it a very different shape from Johannesburg.',
    context: [
      'The Ben Schoeman and the N4 both carry protective ratings. An early version of the data flagged a stretch of the Ben Schoeman badly enough that it would have pushed traffic onto side roads. A validation check caught it before it shipped.',
      'Pretoria has proportionally more middle-band areas than anywhere else we cover, so routes here tend to get a small nudge rather than a full detour.',
      'The CBD and the areas immediately around it change rating between the daytime and evening bands more often than the outer suburbs do.',
    ],
    faqs: [
      {
        q: 'Does Tsamaya cover all of Tshwane or just central Pretoria?',
        a: 'The mapped area covers the Tshwane metro, including Centurion, Mamelodi, Atteridgeville and the eastern suburbs, not only the central city.',
      },
      {
        q: 'Is the Ben Schoeman commute covered end to end?',
        a: 'Yes. The N1 between Pretoria and Johannesburg is mapped from both ends, and both metros are live, so a trip across the two is treated as one drive rather than stopping at a boundary.',
      },
    ],
  },
  {
    key: 'ekurhuleni',
    slug: 'ekurhuleni',
    name: 'Ekurhuleni',
    region: 'Gauteng',
    blurb:
      'Driving routes around the risky parts of Ekurhuleni and the East Rand, including OR Tambo, the N12, N17 and R21.',
    intro:
      'Ekurhuleni is the East Rand: Kempton Park, Benoni, Boksburg, Germiston, Springs, and the belt around OR Tambo. Most drivers pass through it without thinking, because the airport run and the N12 and N17 freight routes cut straight across. It also has the highest share of top-band areas of anywhere we map.',
    context: [
      'The R21 and N12 around OR Tambo carry a lot of drivers who do not know the area. That is exactly who this is for.',
      'More than half of the flagged areas here sit in the top band rather than the middle ones, which is not true anywhere else we cover.',
      'Freight matters here in a way it does not elsewhere. Truck hijacking shows up in the crime data along the N12 and N17, and those roads are rated accordingly.',
    ],
    faqs: [
      {
        q: 'Does Tsamaya cover the drive to OR Tambo?',
        a: 'Yes. The approaches on the R21, N12 and the roads around them are mapped, with separate ratings for day, evening and night.',
      },
      {
        q: 'Is the East Rand the same as Ekurhuleni?',
        a: 'Effectively yes. Ekurhuleni is the municipality covering what most people still call the East Rand, so Kempton Park, Benoni, Boksburg, Germiston and Springs.',
      },
    ],
  },
  {
    key: 'west_rand',
    slug: 'west-rand',
    name: 'West Rand',
    region: 'Gauteng',
    blurb:
      'Driving routes around the risky parts of the West Rand: Roodepoort, Krugersdorp, Randfontein and the N14.',
    intro:
      'Roodepoort, Krugersdorp, Randfontein and the mining belt west of Johannesburg. It is a smaller map than the metros to the east and a noticeably different one, because a large share of it has been checked and rated as carrying no penalty rather than simply having nothing recorded.',
    context: [
      'The N14 and the R28 are the two routes most West Rand driving depends on, and both are mapped end to end.',
      'Plenty of the West Rand has been checked and found to carry no penalty. That is different from having no data at all. One means we looked, the other means we have not got there yet.',
      'The run into Johannesburg on the N1 and the M5 is covered the whole way, since both metros are live.',
    ],
    faqs: [
      {
        q: 'Does Tsamaya cover Krugersdorp and Roodepoort?',
        a: 'Yes, both are inside the mapped West Rand area, along with Randfontein and the surrounding routes.',
      },
      {
        q: 'Why does the West Rand have fewer zones than Johannesburg?',
        a: 'It is smaller and less densely populated, so there is genuinely less to map. The lower count reflects the size of the place, not how well we have covered it.',
      },
    ],
  },
  {
    key: 'secunda',
    slug: 'secunda',
    name: 'Secunda',
    region: 'Mpumalanga',
    blurb:
      'Driving routes around Secunda and Evander, covering the N17 and the roads through the petrochemical belt.',
    intro:
      'The smallest place on the map and the only one outside the two big provincial centres. It is here because of the N17, which carries a great deal of shift traffic and freight through the petrochemical belt, much of it driven in the dark at either end of a shift.',
    context: [
      'Shift work means a lot of the driving here happens in the evening and night bands, which is exactly when the ratings differ most from the daytime picture.',
      'The N17 is the spine of this map and is rated along its whole length.',
      'We have kept coverage tight around the town and its approach roads instead of spreading it thin across the wider district.',
    ],
    faqs: [
      {
        q: 'Why is Secunda on the map when much bigger cities are not?',
        a: 'Because of the N17 and the shift patterns around the petrochemical plants. A lot of ordinary driving happens there after dark, which is when this is most use.',
      },
      {
        q: 'Does coverage extend to Evander and Trichardt?',
        a: 'The mapped area covers Secunda and the roads leading into it, including the way toward Evander.',
      },
    ],
  },
  {
    key: 'stellenbosch',
    slug: 'stellenbosch',
    name: 'Stellenbosch',
    region: 'Western Cape',
    blurb:
      'Driving routes around Stellenbosch, covering the R44, R304 and the roads between the town and Cape Town.',
    intro:
      'The newest addition, and a test of whether any of this works in a small town rather than a sprawling metro. It mostly does, with one adjustment: the rated areas here are small and sit close together, so the routing has to think harder about detours that would be trivial anywhere else.',
    context: [
      'The R44 and R304 connect the town to the N1 and N2. Both are mapped.',
      'The Stellenbosch map overlaps the edge of the Cape Town one, so a trip between them is handled as a single drive.',
      'It is a small map because the town is small, not because we stopped halfway.',
    ],
    faqs: [
      {
        q: 'Does Tsamaya work for the drive between Stellenbosch and Cape Town?',
        a: 'Yes. Both are live and the maps join up, so it is treated as one drive rather than two.',
      },
      {
        q: 'Is a small town really worth mapping?',
        a: 'A lot of after-dark driving happens in a small area here, which suits time-of-day ratings well. It was also a deliberate test of whether any of this works outside the big metros.',
      },
    ],
  },
];

// Look up the editorial entry for a metro key from stats.json.
export const metroByKey = (key) => metros.find((m) => m.key === key);
