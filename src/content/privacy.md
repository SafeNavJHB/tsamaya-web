# Tsamaya Privacy Policy

**Status: v1.0 — prepared 2026-08-25 (enabled crash reporting and disclosed it before switching it on, as v0.9 undertook to do: §4 now describes what a crash report contains, that the event trail is filtered on-device to remove coordinates, place names and destinations, and that the data is stored in the EU; §5 adds Sentry as a processor). Earlier revisions: v0.9 — prepared 2026-08-09 (added §4a disclosing optional push notifications: the device push token, platform and coarse metro stored per device, the two independent opt-in switches, and Expo/APNs/FCM as delivery processors; v0.8 moved the responsible party from Kyle Guy Kimble personally to Tsamaya (Pty) Ltd, unified contact on info@tsamayaapp.co.za, added Google Play as an Android distribution processor, and generalised iOS-only wording — all ahead of the Google Play listing under the company's developer account; v0.7 corrected live-trip link expiry to match implementation — active trips 12 h rolling, ended/arrived trips ~30 min, SOS links 24 h, §3a/§6; v0.6 disclosed optional live trip sharing, §3a/§2/§5/§6; v0.5 added Google Places API as the place-search processor, §1/§5). This text is not legal advice and remains subject to review by a South African attorney. Items still open for that review are tracked as notes in the source document.**

**Effective date:** 25 August 2026
**Responsible party (POPIA):** Tsamaya (Pty) Ltd (reg. K2023990736), South Africa ("we", "us")
**Contact:** info@tsamayaapp.co.za

Tsamaya is a navigation app for South African metros that suggests driving routes which avoid areas and roads with elevated, statistically derived risk. This policy explains what personal information we process, why, and your rights under the Protection of Personal Information Act, 2013 (POPIA).

## The short version

- Your location is used **on your device** to show the map and calculate routes. Route requests send **coordinates only** to our mapping provider — never your name or an account identity.
- We run **no user accounts** for drivers, **no advertising**, **no sale of personal information**, and **no tracking across other apps**.
- Saved places (like Home and Work) are stored **only on your device**. We cannot see them.
- We keep **no server-side history of where you are or where you go** — with one exception you control: an optional **live trip you choose to share**, visible only via a private link (see §3a).
- During the beta we collect **anonymous, aggregate usage events** (such as the app being opened, or a route requested/accepted/completed) tied only to a random installation id — never your location history, name, or account. See section 4.
- If you choose to **send a report or feedback**, we store what you submit (and your email only if you choose to provide it) — see "User reports and feedback" below.
- Notifications are **optional**. If you switch them on, we store a delivery token for your device and the metro you are in (such as "Cape Town") so that a closure alert reaches the right city, **never your coordinates**. There are two separate switches and you can turn either off at any time. See section 4a.

## 1. Information we process, and why

| Information | Where it goes | Purpose | Lawful basis (POPIA s11) |
|---|---|---|---|
| Precise device location (while using the app) | Processed on-device; sent as bare coordinates to Mapbox (our mapping provider) when you request a route, search, or reverse-geocode | Show your position; calculate routes from where you are | Consent (the location permission you grant) and our legitimate interest in providing the service you request |
| Destination searches | Search text + approximate location bias sent to Google (Places API) to find places; Mapbox Directions builds the route from chosen coordinates | Find places; build the route | Performance of the service you request |
| Saved places (Home, Work, favourites), settings, onboarding state | Your device only (local app storage) | Convenience features | Consent |
| Technical request metadata (IP address, basic device info) | Our service providers (Mapbox; Supabase, which hosts our public zone/corridor dataset) receive standard network metadata when the app calls them | Operating and securing the services | Legitimate interest |
| Reviewer account email (admin/editor users only — not drivers) | Supabase authentication | Restricting data-editing tools to authorised reviewers | Performance of contract |
| Reports and feedback you choose to submit (see section 3) | Supabase (our hosted database) | Reviewing and improving the risk dataset and the app | Consent (you tap Send) |

We do **not** process: names, contact lists, payment details, advertising identifiers, or background location when the app is closed.

## 2. What we deliberately do not do

- No server-side storage of your location or trip history — **except an optional live trip you choose to share** (see §3a).
- No advertising or ad-tech SDKs.
- No sale or sharing of personal information for marketing.
- No profiling or automated decision-making about you.

## 3. User reports and feedback

The beta lets you suggest updates to risk areas, rate trips, and send feedback or bug reports — all **without an account**. When you submit a report we store:

- your selections — the risk tier you suggest, the kinds of incident you select, and the timing you choose;
- whatever you type in the note or message field — **please do not include personal information about yourself or others**;
- the area or road the report concerns, the time band, and the app version;
- a **random installation identifier** generated on your device — used only to spot duplicate or abusive submissions; it is not an account and identifies the installation, not you;
- your **email address only if you choose to provide it**, used only to reply to that report.

Post-trip ratings store only coarse trip statistics (such as a distance bucket, the time band, and whether a reroute happened) — **never your start or end locations**.

Reports are suggestions for human review; they never change the live dataset automatically. They are retained until reviewed and actioned, and are deletable on request via the contact address above.

## 3a. Live trip sharing (optional)

Tsamaya lets you **optionally** share a live trip so someone you choose can follow your progress on a private web link and see when you arrive safely. This is **off** unless you tap **Share** during a drive.

While a share is active we store, on our server (Supabase): your **current location and heading**, your **destination and estimated arrival time**, and the **random installation identifier** — never your **starting point**, your name, or an account. The trip is readable **only by someone who holds the private link** you send (a random, unguessable token).

When you end the trip or arrive, live updates stop and the private link **expires about 30 minutes later**. While a trip is still active, the link stays viewable for **up to 12 hours after your last update** (emergency **SOS links last up to 24 hours**, so a helper can keep checking on you). A shared trip is **deletable on request** via the contact address. This is the one case where your live location is processed on our server; everywhere else, routing and search use transient coordinates we do not store.

## 4. Usage analytics and crash reporting

During the beta, the app records **anonymous, aggregate usage events** to help us understand whether people find Tsamaya useful and to decide its future — for example: the app being opened, a route being requested, accepted, or completed, a reroute, or a report being sent. These events carry only **coarse, non-identifying** details (such as the metro you are in, a rounded distance or duration, and whether the lower-risk route was chosen), together with the random installation identifier described in section 3 and the app version. They **never** include your name, an account, your start or end locations, place names, or precise coordinates. We use them **only in aggregate** — never to profile you — and you can ask us to stop.

**Crash reporting is enabled.** When the app crashes or hits an unexpected error, it sends a technical report to Sentry so that we can find and fix it. During a beta this matters more than usual: without it, a crash you hit is simply a crash we never learn about.

A crash report contains the error and its stack trace, your device model and operating system version, the app and update version, and the random installation identifier described in section 3. It also carries a short trail of recent app events — a reroute, a change in risk level, connecting to a car screen — so that we can see what led up to the failure.

That trail is **filtered on your phone before anything is sent**: place names, your starting point and destination, and all coordinates are stripped out, and only simple values are allowed through. A crash report never contains your name, an account, where you were, or where you were going. Sentry stores this data in the **European Union**.

We use crash reports only to fix faults. They are not used to profile you and are not shared for any other purpose.

## 4a. Push notifications (optional)

If you allow notifications, Tsamaya can tell you about road closures, protests and race-day disruption in your city. A second, separate switch covers news about new app features. Both are off unless you allow them, and either can be switched off on its own at any time under Settings › General › Notifications. Switch both off and we delete this device's registration.

To deliver a notification we store, for each device:

- the push token that Expo, Apple or Google issues for that installation (a delivery address for the device, not a name, an account or a contact detail);
- the random installation identifier described in section 3, so that a device which re-registers is recognised instead of duplicated;
- the platform (iOS or Android) and the app version;
- the metro you are in: a city name such as "Cape Town", chosen from the six areas we cover, so that a Cape Town closure alert does not go to drivers in Johannesburg. **Not coordinates, not a street, not a trip.**

We do not use notifications for advertising, and we do not send them for anyone else. A person writes and approves every notification before it goes out. Nothing is sent automatically because of where you are or where you drive. If the delivery service tells us a token no longer works, for example after you uninstall the app, we stop using it.

## 5. Third-party processors

| Provider | Role | Data touched |
|---|---|---|
| Mapbox, Inc. (USA) | Map tiles, routing, reverse-geocoding | Coordinates, IP, device metadata — see Mapbox's privacy policy |
| Google LLC (USA) | Place search / autocomplete (Google Maps Platform, Places API) | Destination search text + approximate location bias — see Google's privacy policy |
| Supabase (cloud hosting) | Hosts our public risk-zone dataset, user reports, reviewer authentication, anonymous usage events, and any live trip you choose to share (while active) | IP/request metadata; report contents (incl. optional emails); reviewer emails (admins only); anonymous usage events; shared-trip location while active |
| Apple Inc. (USA) | App distribution (App Store, TestFlight) | Per Apple's terms |
| Google LLC (USA) | App distribution on Android (Google Play) | Per Google Play's terms |
| Functional Software, Inc. dba Sentry (EU data region — Germany) | Crash and error reporting | The error and its stack trace, device model, OS version, app and update version, the random installation identifier, and a filtered trail of recent app events. Never coordinates, place names, start/end points or other personal information |
| Expo (650 Industries, Inc., USA) | Push-notification delivery, if you opt in (§4a) | Device push token, notification title/text |
| Apple Inc. (USA) / Google LLC (USA) | Push delivery to the device itself (APNs / Firebase Cloud Messaging) | Device push token, notification title/text |

These providers process data outside South Africa. POPIA s72 permits cross-border transfers where the recipient is bound by adequate protection; our providers are bound by their published data-protection terms. [ATTORNEY: confirm s72 position.]

## 6. Retention

- Location, searches, routes: not retained by us server-side. Transient processing only.
- Shared live trips: visible via the private link while the trip is active (up to 12 hours after the last update; SOS links up to 24 hours); once you arrive or end the trip the link expires about 30 minutes later. Deletable on request.
- On-device data (saved places, settings): retained until you delete it or uninstall the app.
- User reports and feedback: retained until reviewed and actioned; deletable on request via the contact address.
- Push registrations (§4a): retained while notifications are switched on. Deleted immediately when you turn both notification switches off, and retired when the delivery service reports the app has been uninstalled.
- Reviewer accounts: retained while the reviewer is authorised.

## 7. Security

Transport encryption (HTTPS/TLS) on all network calls; row-level security on our hosted dataset. The only personal information drivers can send us is what they choose to put in a report (an optional note and email); reports are stored under insert-only access rules — the app's public key cannot read them back. No system is perfectly secure, and we cannot guarantee absolute security.

## 8. Your rights (POPIA)

You may request access to, correction of, or deletion of personal information we hold; object to processing; or complain to the Information Regulator (South Africa) — inforegulator.org.za, complaints.IR@inforegulator.org.za. Because we hold almost no personal information about drivers, most requests will be satisfiable by confirming we hold nothing beyond what is on your device.

To exercise any right: info@tsamayaapp.co.za. We respond within a reasonable time and at most within the periods POPIA prescribes.

## 9. Children

Tsamaya is a driving app and is not directed at children under 18. We do not knowingly process children's personal information.

## 10. Safety-data is not personal data — but a note on it

The risk zones and road classifications shown in the app are derived from public, aggregated sources (including SAPS crime statistics and OpenStreetMap) plus curated review. They describe **areas**, never individuals, and contain no personal information.

## 11. Changes

We will post changes here and update the effective date. Material changes will be flagged in the app.
