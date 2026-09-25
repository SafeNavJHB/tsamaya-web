# Tsamaya website: shared content brief for the redesign prototypes

Everything here is true and approved. Build every concept from this. Do not invent features, figures, testimonials, press logos, user counts or ratings.

## Hard rules (brand, legal, editorial)

1. Never say "safe route", "safest", "stay safe", "100% safe", "guaranteed" or promise safety in any form. The product word is "lower-risk". Standing line: "Lower risk is not no risk."
2. Never name a suburb, township or neighbourhood as risky or dangerous. Roads are fine to name (M1, M2, N1, N2, N12, R21, Ben Schoeman). Places people live are not. Illustrative maps must be abstract or unlabelled.
3. No em dashes anywhere (not in copy, not in titles, not in alt text, not in code comments that ship). Use commas, colons, full stops or brackets. En dashes only inside numeric ranges if at all; prefer "05:00 to 17:30".
4. Straight quotes and apostrophes in the HTML source (use ' and "), sentence case headings.
5. Numbers: South African style, space as the thousands separator (4 396, 2 525), 24-hour times (19:30), rands as R 100.
6. Humanized copy: plain words, specific facts, varied sentence length. Banned words and patterns: delve, seamless, unlock, empower, elevate, leverage, robust, crucial, pivotal, vibrant, showcase, journey (as metaphor), "not just X but Y", "it's not X, it's Y", triple-adjective lists, trailing ", ensuring..." clauses, "In summary", emoji.
7. No fake testimonials, no star ratings, no "trusted by" logo walls, no download counts.
8. "Asambe!" is NOT a marketing line (trademark risk). Do not use it.

## The name

- Tsamaya, say: tsa-MAH-ya. Sesotho and Setswana for "go". From the everyday blessing "tsamaya sentle": go well.
- Tagline: "Go well." Lockup: "Tsamaya. Go well."
- Second meaning (from the founder, on the About page): in kasi football, a tsamaya is the move that sends the defender the wrong way.

## What it is, in one breath

A free navigation app for South African drivers. Most maps work out the quickest way there. Tsamaya also works out what you would be driving through, and steers you around the areas where vehicle crime happens. It is in open beta on iPhone (TestFlight) and Android (Google Play open test).

## Real figures (from the live database, 2026/09/24)

- 12 metros mapped: Cape Town 909 zones, Johannesburg 800, Durban 791, Ekurhuleni 732, Pretoria 486, Gqeberha 254, West Rand 130, Rustenburg 98, Secunda 63, Mossel Bay 58, Pilanesberg 43, Stellenbosch 32.
- 4 396 rated risk zones in total.
- 2 180 checked road stretches (roads we have checked and rated as lower-risk cover, called "checked corridors" on the current site).
- 4 874 flagged road stretches.
- 3 time bands: daytime 05:00 to 17:30, evening 17:30 to 19:30, night 19:30 to 05:00. The app reads the clock; there is no manual switch.
- Zones rated red (the top band), nationally: 1 372 in daytime, 1 524 in the evening, 2 525 at night.
- Johannesburg red zones: 315 in daytime, 326 in the evening, 533 at night. Cape Town: 278 day, 581 night. Durban: 211 day, 460 night.
- Risk bands: red (high), orange (elevated), yellow (caution, shown but never forces a detour), none (checked, no penalty).
- Route grades A to E (A is lowest risk). Any red floors a route at D. The route card shows e.g. "Balanced, lower-risk: D, 25 min, 17.4 km, passes 2 high-risk areas, 68% less risk than the fastest route" versus "Fastest: E, 25 min, 18.0 km, passes 4 high-risk areas". (Real screenshot.)
- Typical trade-off used on the current site (illustrative, labelled as such): direct 16 min, lower-risk 19 min, 2 flagged areas avoided.

## How it works (true sequence)

1. Set a destination: search, tap the map, or press and hold to drop a pin.
2. Tsamaya takes the quickest route and tests it against every rated area, using the ratings for this hour.
3. If the route runs through a high-risk area, it moves it onto roads we have checked, and tells you what it went around.
4. A detour only gets offered if it cuts your exposure. One that adds too much distance is thrown out, even when it carries less risk.
5. When there is no good alternative, Tsamaya says so and gives you the normal route with the risky stretches marked. It will not invent a detour to look busy.
6. Drive it in the app (turn-by-turn with voice, CarPlay and Android Auto), or hand it to Google Maps with the detour points already in place.

## Other true features (use sparingly, pick what fits)

- Three route options: Fastest, Balanced, Lower-risk.
- Live overlay: turn it on and see every rated area and road, colour-coded.
- Police and roadblock notices from other drivers, shown for an hour and spoken when they are ahead of you. They never change your route.
- Road closures and protest reports are picked up daily and routed around.
- Speed limit readout and a gentle over-speed chime.
- Share a live trip with someone at home; they follow it on the website.
- Report a corner we got wrong, from inside the app.
- Works as an ordinary map and navigator outside the 12 metros; it just has no risk data there.

## Where the data comes from

Published South African crime statistics, scored against OpenStreetMap road data to find where vehicle crime concentrates. Every metro gets a review pass before anything goes live, and drivers correct it from there. Local knowledge sits inside the routing model on purpose.

## Privacy line for next to the download buttons (true, from the privacy policy)

Your location is used on your phone to show the map and plan routes. Route requests send bare coordinates to the map provider, never your name. There is no account, and we keep no trip history on our servers unless you choose to share a live trip. Short version: "No account. No trip history kept. No ads."

## Who is behind it

Built in Johannesburg by Kyle Kimble, a chartered accountant who taught himself to ship a mobile app because the problem would not leave him alone. Independent and self-funded. No ads, and it sells nothing about you. Company: TSAMAYA (PTY) LTD. Founder quote (real, from the current About page): "Most maps optimise for the fastest line. On South African roads, the fastest line isn't always the one you want to be on. Tsamaya is my attempt to give drivers that choice."

## Ways to help

Free: drive with it; tell one other driver; report a corner we got wrong; tell us when it annoys you. Money (optional, once-off EFT, no tiers): R 100 goes into running costs (map tiles, geocoding, database); R 1 000 and we will ask which metro you want next; R 2 500 sponsors a whole new city. Reference: "Tsamaya + your name". Nedbank, TSAMAYA (PTY) LTD.

## FAQ answers (approved)

- Is it free? Yes. No ads, and we do not sell anything about you.
- Does a lower-risk route take much longer? Usually a few minutes. Anything dramatically longer than the direct route is rejected.
- Does it guarantee I will be safe? No, and we will never tell you otherwise. It cuts your exposure to areas with a history of vehicle crime. Crime is not predictable. Treat it as better information for a choice you were going to make anyway, and stay alert.
- What happens outside the 12 metros? It works as a normal map and navigator, without risk data.

## Johannesburg metro page content (real)

- Region: Gauteng. 800 rated zones. Red zones: 315 daytime, 326 evening, 533 night.
- Intro: Johannesburg is where Tsamaya started and it is still the busiest part of the map. Almost everything funnels through a handful of roads: the M1 and M2, Empire, Louis Botha, Oxford. Those roads run close to the places where vehicle crime concentrates. Plan purely for speed and you will be sent through the worst of it at the worst time of night, without being told.
- Driving context:
  - The M1 and M2 through the inner city carry more flagged stretches than any other road we map. Most of it is smash-and-grab and robbery at off-ramps and traffic lights.
  - Ratings move sharply between day and night here. Several roads that carry no penalty at midday sit in the top band after 19:30.
  - Load-shedding matters. A dark intersection is a different proposition from a lit one, which is why evening and night are rated separately.
- FAQs:
  - Does it cover Soweto and the southern suburbs? Yes. Coverage spans the whole municipal area. (Naming the area as COVERED is fine; never as risky.)
  - Will it route me the long way round? Only within limits. Most lower-risk routes across Johannesburg add a few minutes.
  - Does it work on the highways out of Joburg? Yes. The N1, N3, N12 and N17 are mapped, and the major freeways carry protective ratings, so the app will not push you off a freeway onto side roads to shave a score.

## Site map (current)

Home, How it works, See it (demo), Coverage (+ 12 metro pages), Updates (changelog), Technical, About, Support, Contact, Get the app, Privacy, Terms, and the live-trip tracker page.

## Assets available in ./img/

- jhb-map-600.webp (Sandton area map with the risk overlay, 600x1304 phone screenshot)
- capetown-map-600.webp (Cape Town overlay)
- navigation-600.webp (turn-by-turn at night: "140 m, turn left onto Highveld Road", speed 54 in a 60, "Use caution" chip)
- route-card-600.webp (From/To card, night overlay)
- route-result-600.webp (route comparison with A to E grades)
- favicon.svg (the app icon: navy tile, green swerve arrow bending around red and amber heat rings)
- ../geo.json: South Africa outline as SVG path data in a 1000 x 880 box ("land", "borders"), plus 12 metros each with "x","y" marker point, "d" coverage outline path, zones and per-band counts. Coverage shapes are real (each metro's zones dissolved into one outline) and are safe to show: they reveal where ratings exist, not which areas are risky.

Brand colours from the app: navy #0F172A, emerald #34D399 (the "go" arrow), deep emerald #059669, risk red #DC3C50 / #EF4444, orange #F09632, yellow #EBC846. Concepts may re-tune the palette but the emerald arrow and the red / orange / yellow risk semantics must survive.
