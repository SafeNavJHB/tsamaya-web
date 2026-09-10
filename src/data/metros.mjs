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
      'Driving routes around the risky parts of Johannesburg: the CBD, the northern suburbs, and the M1 and M2.',
    // The opening paragraph. Written for a driver, not a search engine, because
    // pages written for search engines now rank worse than pages written for people.
    intro:
      'Johannesburg is where Tsamaya started and it is still the busiest part of the map. Almost everything funnels through a handful of roads: the M1 and M2, Empire, Louis Botha, Oxford. Those roads run close to the places where vehicle crime concentrates. Plan purely for speed and you will be sent through the worst of it at the worst time of night, without being told.',
    // Genuinely useful local driving context. Roads and behaviour, never suburbs.
    context: [
      'The M1 and M2 through the inner city carry more flagged stretches than any other road we map. Most of it is smash-and-grab and robbery at off-ramps and traffic lights.',
      'Ratings move sharply between day and night here. Several roads that carry no penalty at midday sit in the top band after 19:30.',
      'Load-shedding matters. A dark intersection is a different proposition from a lit one, which is why evening and night are rated separately instead of lumped together as "after dark".',
    ],
    faqs: [
      {
        q: 'Does Tsamaya cover Soweto and the southern suburbs?',
        a: 'Yes. Coverage spans the whole municipal area: Soweto, the southern suburbs and the inner city, as well as the northern suburbs.',
      },
      {
        q: 'Will it route me the long way round?',
        a: 'Only within limits. A detour has to actually cut your exposure to be offered, and anything dramatically longer than the direct route gets rejected even when it carries less risk. In practice most lower-risk routes across Johannesburg add a few minutes.',
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
      'Risk here sits in specific pockets rather than spreading along the main roads. A bigger share of the metro has been checked and rated as carrying no penalty than in Johannesburg, so more of the map is green rather than blank.',
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
        a: 'Because the risk here clusters tightly rather than smearing across the metro. A blank map is real information: it means nothing was flagged, not that we never looked.',
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
      'Most of Pretoria’s flagged areas sit in the middle and caution bands rather than the top one, so a lot of what you see on the map is marked without changing your route.',
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
      'Ekurhuleni is the East Rand: Kempton Park, Benoni, Boksburg, Germiston, Springs, and the belt around OR Tambo. Most drivers pass through it without thinking, because the airport run and the N12 and N17 freight routes cut straight across. Its share of top-band areas is among the highest on the map, level with Johannesburg and well clear of Pretoria.',
    context: [
      'The R21 and N12 around OR Tambo carry a lot of drivers who do not know the area. That is exactly who this is for.',
      'Freight is a big part of why. Truck hijacking shows up in the crime data along the N12 and N17, and those roads carry the ratings to match.',
    ],
    faqs: [
      {
        q: 'Does Tsamaya cover the drive to OR Tambo?',
        a: 'Yes. The approaches on the R21, N12 and the roads around them are mapped, with separate ratings for day, evening and night.',
      },
      {
        q: 'Is the East Rand the same as Ekurhuleni?',
        a: 'Effectively yes. Ekurhuleni is the municipality covering what most people still call the East Rand: Kempton Park, Benoni, Boksburg, Germiston and Springs.',
      },
    ],
  },
  {
    key: 'west_rand',
    slug: 'west-rand',
    name: 'West Rand',
    region: 'Gauteng',
    blurb:
      'Driving routes around the West Rand: the N14, the R28, and the roads through Roodepoort, Krugersdorp and Randfontein.',
    intro:
      'Roodepoort, Krugersdorp, Randfontein and the mining belt west of Johannesburg. It is a smaller map than those for the metros to the east and a noticeably different one, because a large share of it has been checked and rated as carrying no penalty rather than simply having nothing recorded.',
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
      'Driving routes around Secunda, covering the N17 and the roads through the petrochemical belt.',
    intro:
      'One of the smallest places on the map, and the first that was mapped outside the two big provincial centres. It is here because of the N17, which carries a great deal of shift traffic and freight through the petrochemical belt, much of it driven in the dark at either end of a shift.',
    context: [
      'Shift work puts a lot of the driving here in the evening and night bands, which is when the ratings look least like the daytime picture.',
      'The N17 is the spine of this map and is rated along its whole length.',
      'We have kept coverage tight around the town and its approach roads instead of spreading it thin across the wider district.',
    ],
    faqs: [
      {
        q: 'Why is Secunda on the map when much bigger cities are not?',
        a: 'Because of the N17 and the shift patterns around the petrochemical plants. A lot of ordinary driving happens there after dark, which is when this is most useful.',
      },
      {
        q: 'Does coverage extend to Evander and Trichardt?',
        a: 'The mapped area covers Secunda and the roads leading into it, including the way toward Evander. Trichardt sits just outside it.',
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
      'The smallest map we run, and a test of whether any of this works somewhere that is not a sprawling metro. It mostly does, with one adjustment: the rated areas here are small and sit close together, so the routing has to think harder about detours that would be trivial anywhere else.',
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
  {
    key: 'rustenburg',
    slug: 'rustenburg',
    name: 'Rustenburg',
    region: 'North West',
    blurb:
      'Driving routes around Rustenburg, covering the N4 through town, the R24 and the R565 north toward Sun City.',
    intro:
      'Rustenburg sits on the N4 between Pretoria and the Botswana border, with the platinum belt on either side of it. A lot of the driving here is commuting to and from the mines at shift change, plus through-traffic on the N4 and the weekend run up the R565 to Sun City. The map covers the town and the roads that feed it.',
    context: [
      'The N4 is mapped through the town and out both sides. It carries the freight and most of the long-distance traffic, and it is rated separately for day, evening and night.',
      'The R565 to Sun City and the R24 toward Johannesburg are the two roads most visitors use, and both are on the map from end to end.',
      'Shift traffic around the mines means a lot of the local driving happens before dawn and after dark, which is when the ratings differ most from the daytime picture.',
    ],
    faqs: [
      {
        q: 'Does the Rustenburg map join up with Pilanesberg?',
        a: 'Yes. The two maps meet along the R565, so a trip from town to Sun City or the park gates is handled as one drive.',
      },
      {
        q: 'Is the N4 covered outside the town?',
        a: 'The N4 is mapped through Rustenburg and the approaches on both sides of it. Beyond the mapped area the app still navigates normally; it simply has no risk data to apply.',
      },
    ],
  },
  {
    key: 'pilanesberg',
    slug: 'pilanesberg',
    name: 'Pilanesberg',
    region: 'North West',
    blurb:
      'Driving routes around Sun City and the Pilanesberg National Park, covering the R565, the R510 and the roads through Ledig, Mogwase and Moruleng.',
    intro:
      'Pilanesberg is on the map for the visitors. Sun City, the park gates and the resorts around them draw a steady flow of people who do not know the roads and arrive at odd hours. The map covers the park, Sun City and the towns around the edge of it, along with the roads in from Rustenburg and from the north.',
    context: [
      'Almost everyone arrives on the R565 from Rustenburg or the R510 from the north, often at dusk on the way to a gate that closes. Both are mapped all the way in.',
      'The roads between the park gates and the resorts are short, but they carry a lot of unfamiliar drivers late in the day. Ratings here change more between day and night than the distances suggest.',
      'Inside the park the app works as a normal map. The risk data is for the public roads outside the gates.',
    ],
    faqs: [
      {
        q: 'Does Tsamaya cover the drive from Johannesburg to Sun City?',
        a: 'The Johannesburg, Rustenburg and Pilanesberg maps cover the start and the end of that trip and the roads on either side of the N4. The open stretches between mapped areas are driven as normal navigation.',
      },
      {
        q: 'Why is a game reserve on the map at all?',
        a: 'Because of the number of visitors who drive in and out of it, many of them at dusk or after dark, on roads they have never used. That is the situation the time-of-day ratings exist for.',
      },
    ],
  },
  {
    key: 'mossel_bay',
    slug: 'mossel-bay',
    name: 'Mossel Bay',
    region: 'Western Cape',
    blurb:
      'Driving routes around Mossel Bay, covering the N2 and the whole municipality from Gouritsmond to Great Brak River.',
    intro:
      'Mossel Bay is the first Garden Route town on the map. Coverage is the whole municipality rather than just the town: from Gouritsmond in the west, through Mossel Bay itself and the N2, to Great Brak River in the east and Herbertsdale inland. Every part of it has been rated against the police stations that actually serve it.',
    context: [
      'The N2 runs across the top of the town and carries most of the through-traffic on the Garden Route. It is rated along its whole length here, separately for each time of day.',
      'The R328 toward Oudtshoorn and the coastal roads to the Point, Hartenbos and Great Brak River are all mapped.',
      'Holiday traffic changes the picture. A road that is quiet in winter is busy and full of unfamiliar drivers in December, so the map covers the roads visitors use as well as the ones locals do.',
    ],
    faqs: [
      {
        q: 'Does coverage include Hartenbos and Great Brak River?',
        a: 'Yes. The mapped area is the full municipality, so Hartenbos, Little Brak, Great Brak River and Gouritsmond are all inside it.',
      },
      {
        q: 'Is the N2 through Mossel Bay treated as a freeway?',
        a: 'It is mapped end to end and rated for each time of day. It is not given a blanket protective rating the way the big-city freeways are, because it passes close to town for part of its length.',
      },
    ],
  },
  {
    key: 'durban',
    slug: 'durban',
    name: 'Durban',
    region: 'KwaZulu-Natal',
    blurb:
      'Driving routes around Durban and the whole of eThekwini, covering the N2, N3, M4 and M7 and the roads between the city, Pinetown, Umlazi and Umhlanga.',
    intro:
      'Durban is the biggest addition since Cape Town and the first metro on the east coast. Coverage is the whole of eThekwini: the city and the beachfront, Pinetown and the Upper Highway, the south coast down to Umkomaas, and the north through Umhlanga and Tongaat to King Shaka airport. The N2 and the N3 tie all of it together, and they are what most trips here depend on.',
    context: [
      'The N3 climb through Pinetown and Mariannhill and the N2 along the coast are both mapped end to end and rated for each time of day. Neither is waved through as a protected route, because both pass close to areas that carry a real penalty.',
      'The M4 along the northern beachfront, the M7 and the M13 through Westville are the everyday roads for most of the metro, and all three are on the map.',
      'The beachfront changes character after dark. Several stretches that carry a modest rating at midday sit in the top band in the evening and at night, which is why the three time bands are rated separately.',
    ],
    faqs: [
      {
        q: 'Does Tsamaya cover the drive from King Shaka airport into the city?',
        a: 'Yes. The airport, the N2 and the M4 are all inside the mapped area, so the whole trip is planned with risk data whichever time of day you land.',
      },
      {
        q: 'How far south and inland does coverage go?',
        a: 'South to Umkomaas and inland to Cato Ridge, which is the municipal boundary. Beyond that the app still navigates normally; it simply has no risk data to apply.',
      },
    ],
  },
  {
    key: 'gqeberha',
    slug: 'gqeberha',
    name: 'Gqeberha',
    region: 'Eastern Cape',
    blurb:
      'Driving routes around Gqeberha and the whole of Nelson Mandela Bay, covering the N2, the M4 Settlers Freeway, the R75 to Kariega and the beachfront roads.',
    intro:
      'Gqeberha is the first Eastern Cape metro on the map, and coverage is the whole of Nelson Mandela Bay rather than the old Port Elizabeth town limits: the beachfront and the city centre, the Northern Areas, Motherwell and the northern townships, and Kariega and Despatch in the west. The N2 and the M4 tie it together, and the R75 out to Kariega carries most of the commuting.',
    context: [
      'The N2 is mapped end to end from Colchester in the north-east through to the western edge of the metro, and so is the M4 Settlers Freeway between the centre and the beachfront. Neither gets a blanket protective rating; both pass close to areas that carry a real penalty, so each stretch is rated on its own.',
      'The R75 and the old R102 are the everyday commuter roads for the west of the metro, out toward Kariega and Despatch. Both are mapped.',
      'The beachfront from Kings Beach to Summerstrand is rated separately for each time of day. It carries a modest rating in daylight and a higher one after dark, which is when most visitors are driving between the hotels and the Boardwalk.',
    ],
    faqs: [
      {
        q: 'Does Tsamaya cover Kariega and Uitenhage?',
        a: 'Yes. Kariega, Despatch and KwaNobuhle are all inside the mapped area, along with the R75 and the N2 that connect them to the city.',
      },
      {
        q: 'Does it cover the drive from the airport?',
        a: 'Yes. Chief Dawid Stuurman International Airport sits inside the mapped area, so the trip from the terminal to the beachfront or the city is planned with risk data from the first turn.',
      },
    ],
  },
];

// Look up the editorial entry for a metro key from stats.json.
export const metroByKey = (key) => metros.find((m) => m.key === key);
