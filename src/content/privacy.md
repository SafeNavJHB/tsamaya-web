# Tsamaya Privacy Policy

**Status: v1.6, prepared 2026-09-28 (§4a: Premium's fuel price alert, a third notification switch, is the one notification sent automatically, once per price change, and for it we store your fuel type and until when you have Premium; §6 and the short version to match, and a note that your phone's own backup may include what is kept on it). v1.5, prepared 2026-09-28 (trip history, the search usage meter and the fuel settings are kept only on your device, §1, §6 and the short version; Arrive by sends Mapbox the departure time it checks, and a leave reminder is set on your device, §1; fuel prices for Premium's fuel cost come from our public price list, which holds nothing about you, §1 and §4b). v1.4, prepared 2026-09-28 (added §4b on Tsamaya Premium, the optional subscription: Apple or Google take the payment, RevenueCat checks subscriptions using a random id it creates and the store's purchase records, on iPhone RevenueCat also sends Apple's identifier for vendor, and our server keeps each subscription's status; RevenueCat added to §5, Premium to §1 and §6). v1.3, prepared 2026-09-27 (added HERE as a backup place-search provider in §1 and §5: when Google's search cannot answer, for example because it is over its daily limit, your search text and an approximate area are sent to HERE through our server, and HERE's own End User Terms and Privacy Policy apply to that search). v1.2, prepared 2026-09-26 (added §3b on voice reports: the microphone and speech recognition are used only when you tap Speak or ask Siri to make a report, and no audio is kept; §3 now describes the two report types that carry a position, live police and roadblock notices and speed camera reports; §1, §2 and §5 updated to match). v1.1, prepared 2026-09-09 (corrected §4a, which said the stored metro is chosen from six areas when the service covers twelve, and aligned the §1 description and §3a wording with the definition of "lower-risk" in the Terms of Use). v1.0, prepared 2026-08-25 (enabled crash reporting and disclosed it before switching it on, as v0.9 undertook to do: §4 now describes what a crash report contains, that the event trail is filtered on-device to remove coordinates, place names and destinations, and that the data is stored in the EU; §5 adds Sentry as a processor). Earlier revisions: v0.9, prepared 2026-08-09 (added §4a disclosing optional push notifications: the device push token, platform and coarse metro stored per device, the two independent opt-in switches, and Expo/APNs/FCM as delivery processors); v0.8 moved the responsible party from Kyle Guy Kimble personally to Tsamaya (Pty) Ltd, unified contact on info@tsamayaapp.co.za, added Google Play as an Android distribution processor, and generalised iOS-only wording, all ahead of the Google Play listing under the company's developer account; v0.7 corrected live-trip link expiry to match implementation (active trips 12 h rolling, ended/arrived trips ~30 min, SOS links 24 h), §3a/§6; v0.6 disclosed optional live trip sharing, §3a/§2/§5/§6; v0.5 added Google Places API as the place-search processor, §1/§5. This text is not legal advice and remains subject to review by a South African attorney. Items still open for that review are tracked as notes in the source document.**

**Effective date:** 28 September 2026
**Responsible party (POPIA):** Tsamaya (Pty) Ltd (reg. K2023990736), South Africa ("we", "us")
**Contact:** info@tsamayaapp.co.za

Tsamaya is a navigation app for South African metros that suggests driving routes with lower statistical exposure to areas and roads carrying elevated, statistically derived risk. This policy explains what personal information we process, why, and your rights under the Protection of Personal Information Act, 2013 (POPIA).

## The short version

- Your location is used **on your device** to show the map and calculate routes. Route requests send **coordinates only** to our mapping provider, never your name or an account identity.
- We run **no user accounts** for drivers, **no advertising**, **no sale of personal information**, and **no tracking across other apps**.
- Saved places (like Home and Work) and your trip history are stored **only on your device**. We cannot see them. (Your phone's own backup, such as iCloud or Google, may include them, in your own account.)
- We keep **no server-side history of where you are or where you go**, with one exception you control: an optional **live trip you choose to share**, visible only via a private link (see §3a).
- During the beta we collect **anonymous, aggregate usage events** (such as the app being opened, or a route requested/accepted/completed) tied only to a random installation id, never your location history, name, or account. See section 4.
- If you choose to **send a report or feedback**, we store what you submit (and your email only if you choose to provide it). See "User reports and feedback" below.
- **Voice reports are optional.** When you tap **Speak** (or ask Siri) to report something on the road, your phone's own speech service turns what you say into text so the app can choose the report. Tsamaya **never records or keeps audio**; only the report itself is sent. See §3b.
- **Tsamaya Premium is optional.** If you subscribe, Apple or Google takes the payment and **we never see your card**. RevenueCat, the service that checks subscriptions for us, receives your store purchase records and a random id it creates, so Premium stays on the account that paid. See section 4b.
- Notifications are **optional**. If you switch them on, we store a delivery token for your device and the metro you are in (such as "Cape Town") so that a closure alert reaches the right city, **never your coordinates**. With Tsamaya Premium's fuel price alert on, we also store your fuel type and roughly until when you have Premium. There are separate switches and you can turn any of them off at any time. See section 4a.

## 1. Information we process, and why

| Information | Where it goes | Purpose | Lawful basis (POPIA s11) |
|---|---|---|---|
| Precise device location (while using the app) | Processed on-device; sent as bare coordinates to Mapbox (our mapping provider) when you request a route, search, or reverse-geocode, and for Arrive by with the departure time being checked | Show your position; calculate routes from where you are | Consent (the location permission you grant) and our legitimate interest in providing the service you request |
| Destination searches | Search text + approximate location bias sent to Google (Places API) to find places. When Google cannot answer, the same search text and an area rounded to about 100 m are sent to HERE (our backup search provider) through our server, which keeps neither. Mapbox Directions builds the route from chosen coordinates | Find places; build the route | Performance of the service you request |
| Saved places (Home, Work, favourites), settings, onboarding state, trip history (each guided drive's destination name, when, how far, the route option and its grade), your daily search counts, your fuel settings, and any Arrive by reminder | Your device only (local app storage and its own notification service); never sent to us, except that with Premium's fuel price alert on, your fuel type is stored with this device's notification registration (section 4a) | Convenience features, the search usage meter, and Premium's trip history, fuel cost and Arrive by | Consent |
| Technical request metadata (IP address, basic device info) | Our service providers (Mapbox; Supabase, which hosts our public zone/corridor dataset and, for Premium's fuel cost, the public list of official fuel prices) receive standard network metadata when the app calls them | Operating and securing the services | Legitimate interest |
| Reviewer account email (admin/editor users only, not drivers) | Supabase authentication | Restricting data-editing tools to authorised reviewers | Performance of contract |
| Reports and feedback you choose to submit (see section 3) | Supabase (our hosted database) | Reviewing and improving the risk dataset and the app | Consent (you tap Send) |
| Premium check, on every install (see section 4b) | The app asks RevenueCat whether this device has Premium, which sends a random RevenueCat id and basic device details. On an iPhone, the first check after installing also sends Apple's record of the app's download (not a payment) | Showing whether this device has Premium, and bringing back a subscription the store account already has | Legitimate interest (knowing whether this device has Premium) |
| Premium purchases, only if you subscribe (see section 4b) | Apple or Google take the payment. RevenueCat receives the store's purchase and renewal records, a random RevenueCat id and basic device details. Our server (Supabase) keeps the subscription's status against that id | Selling Premium and keeping it on the store account that paid for it | Performance of contract (the subscription you buy) |
| Your voice, only while you make a voice report (see section 3b) | Your phone's speech service (Apple on iPhone; usually Google on Android) turns it into text; the audio is not recorded, kept or sent to us | Choosing the report type you said | Consent (the microphone and speech permissions, and your tap on Speak) |

We do **not** process: names, contact lists, payment details (Apple and Google take payment for Premium; we never see card or bank details), advertising identifiers, or background location when the app is closed.

## 2. What we deliberately do not do

- No server-side storage of your location or trip history, **except an optional live trip you choose to share** (see §3a).
- No advertising or ad-tech SDKs.
- No sale or sharing of personal information for marketing.
- No profiling or automated decision-making about you.
- No audio recording. The microphone is used only while you are making a voice report (§3b), and nothing it hears is kept.

## 3. User reports and feedback

The beta lets you suggest updates to risk areas, rate trips, and send feedback or bug reports, all **without an account**. When you submit a report we store:

- your selections: the risk tier you suggest, the kinds of incident you select, and the timing you choose;
- whatever you type in the note or message field (**please do not include personal information about yourself or others**);
- the area or road the report concerns, the time band, and the app version;
- a **random installation identifier** generated on your device, used only to spot duplicate or abusive submissions; it is not an account and identifies the installation, not you;
- your **email address only if you choose to provide it**, used only to reply to that report.

Post-trip ratings store only coarse trip statistics (such as a distance bucket, the time band, and whether a reroute happened), **never your start or end locations**.

Reports are suggestions for human review; they never change the live dataset automatically. They are retained until reviewed and actioned, and are deletable on request via the contact address above.

Two kinds of report carry a position, because the position is the report:

- **Police and roadblock notices** are public: other drivers nearby see "Police reported ahead" for about an hour. We store the spot where your car was when you reported, its direction of travel and the time. Your random installation identifier is kept apart from the notice, only to merge repeat reports and to limit abuse, and is never shown to anyone. Notices are deleted about a day after they expire.
- **Speed camera reports** store the spot you reported, the speed limit if you gave one, and the random installation identifier, until the review team confirms or rejects the camera.

## 3b. Voice reports (optional)

If you tap **Speak** in the report screen (on your phone, CarPlay or Android Auto), Tsamaya asks for microphone and speech recognition access, then listens for a few seconds for what you say, such as "police" or "speed camera". Your phone's own speech service turns the words into text: Apple's speech recognition on an iPhone, and the speech recognition service on an Android phone (usually Google's). Depending on the phone and the language, that service may process the audio on the phone or on the provider's servers, under the provider's own privacy terms.

Tsamaya uses the text only to choose the report type, and then files exactly the report a tap would (see section 3). **We do not record, store or send the audio, and we do not keep the text.** If you ask Siri instead ("report police in Tsamaya"), Siri does the listening and passes Tsamaya only the report type.

You can refuse or withdraw microphone and speech access at any time in your phone's settings. Every report can still be made by tapping.

## 3a. Live trip sharing (optional)

Tsamaya lets you **optionally** share a live trip so someone you choose can follow your progress on a private web link and see when you arrive. This is **off** unless you tap **Share** during a drive.

While a share is active we store, on our server (Supabase): your **current location and heading**, your **destination and estimated arrival time**, and the **random installation identifier**, but never your **starting point**, your name, or an account. The trip is readable **only by someone who holds the private link** you send (a random, unguessable token).

When you end the trip or arrive, live updates stop and the private link **expires about 30 minutes later**. While a trip is still active, the link stays viewable for **up to 12 hours after your last update** (emergency **SOS links last up to 24 hours**, so a helper can keep checking on you). A shared trip is **deletable on request** via the contact address. This is the one case where your live location is processed on our server; everywhere else, routing and search use transient coordinates we do not store.

## 4. Usage analytics and crash reporting

During the beta, the app records **anonymous, aggregate usage events** to help us understand whether people find Tsamaya useful and to decide its future. Examples include the app being opened, a route being requested, accepted, or completed, a reroute, and a report being sent. These events carry only **coarse, non-identifying** details (such as the metro you are in, a rounded distance or duration, and whether the lower-risk route was chosen), together with the random installation identifier described in section 3 and the app version. They **never** include your name, an account, your start or end locations, place names, or precise coordinates. We use them **only in aggregate**, never to profile you, and you can ask us to stop.

**Crash reporting is enabled.** When the app crashes or hits an unexpected error, it sends a technical report to Sentry so that we can find and fix it. During a beta this matters more than usual: without it, a crash you hit is simply a crash we never learn about.

A crash report contains the error and its stack trace, your device model and operating system version, the app and update version, and the random installation identifier described in section 3. It also carries a short trail of recent app events (a reroute, a change in risk level, connecting to a car screen) so that we can see what led up to the failure.

That trail is **filtered on your phone before anything is sent**: place names, your starting point and destination, and all coordinates are stripped out, and only simple values are allowed through. A crash report never contains your name, an account, where you were, or where you were going. Sentry stores this data in the **European Union**.

We use crash reports only to fix faults. They are not used to profile you and are not shared for any other purpose.

## 4a. Push notifications (optional)

If you allow notifications, Tsamaya can tell you about road closures, protests and race-day disruption in your city. A second, separate switch covers news about new app features, and with Tsamaya Premium a third tells you, the day before fuel prices change, whether to fill up or wait. Nothing arrives unless your phone lets Tsamaya send notifications (you are asked first; older Android versions allow it when the app is installed). Each switch can be turned off on its own at any time under Settings › Alerts › Notifications (the fuel price alert is on for a Premium device until you turn it off). Turn all of them off and we delete this device's registration.

To deliver a notification we store, for each device:

- the push token that Expo, Apple or Google issues for that installation (a delivery address for the device, not a name, an account or a contact detail);
- the random installation identifier described in section 3, so that a device which re-registers is recognised instead of duplicated;
- the platform (iOS or Android) and the app version;
- the metro you are in: a city name such as "Cape Town", chosen from the metros we cover, so that a Cape Town closure alert does not go to drivers in Johannesburg. **Not coordinates, not a street, not a trip.**
- with the fuel price alert on (Premium): the fuel you chose, such as petrol 95, and a date shortly after this device's current Premium period ends, so that the alert names your fuel and reaches only Premium devices. The app sends that date again each time it starts. With the alert off, neither is stored.

We do not use notifications for advertising, and we do not send them for anyone else. A person writes and approves every notification before it goes out, with one exception you choose: the fuel price alert, which is sent automatically, once per price change, from the official announcement of the new prices. Nothing is sent because of where you are or where you drive. If the delivery service tells us a token no longer works, for example after you uninstall the app, we stop using it.

## 4b. Tsamaya Premium (optional subscription)

Tsamaya Premium is an optional subscription (Terms of Use section 6). If you never subscribe, the only part of this section that applies to you is that the app asks RevenueCat whether this device has Premium, which sends RevenueCat the random id and device details described below. On an iPhone, the first such check after installing also sends Apple's record of the app's own download (not a payment), so that a subscription already on the same Apple ID comes back without a tap.

When you subscribe, you pay Apple (App Store) or Google (Google Play) under their own terms. **We never see your card or bank details, your name or your email address.**

To check that a subscription is real, and to keep Premium on the right account, the app uses **RevenueCat**, a subscription service. RevenueCat receives:

- a random **RevenueCat id** that the app creates on your device. It is not an account, and it is not the installation identifier in section 3;
- the store's **purchase and renewal records** for Tsamaya Premium: which plan, when it started, when it renews or ends, and whether a free trial or a billing problem applies;
- basic **device details** sent with each request: the device model, operating system and app version, language and store country. On an iPhone, RevenueCat's software also sends Apple's **identifier for vendor**, an id that is the same for every app from one developer on that phone. Tsamaya does not give RevenueCat any advertising identifier.

On Android, Google's backup service may keep a paying subscriber's RevenueCat id so that Premium comes back after a reinstall.

RevenueCat tells our server (Supabase) when a subscription starts, renews, ends or moves to another phone. We keep that status (the RevenueCat id, the plan, the store and the dates) so that we can count subscribers and answer billing questions. It contains no name, email or location.

We use this information only to provide Premium. It is not used for advertising or profiling.

Premium's other features work on your device. Trip history, your fuel settings and any Arrive by reminder are kept only on your phone (with the fuel price alert on, your fuel type is also stored with this device's notification registration, section 4a). Fuel cost reads the official fuel prices from our public price list on our server, which contains no information about you, and Arrive by asks Mapbox how long the route takes at the time you would leave.

## 5. Third-party processors

| Provider | Role | Data touched |
|---|---|---|
| Mapbox, Inc. (USA) | Map tiles, routing, reverse-geocoding | Coordinates, IP, device metadata (see Mapbox's privacy policy) |
| Google LLC (USA) | Place search / autocomplete (Google Maps Platform, Places API) | Destination search text + approximate location bias (see Google's privacy policy) |
| HERE Europe B.V. (Netherlands) | Backup place search, only when Google's search cannot answer (for example when it is over its daily limit) | Destination search text + an approximate location rounded to about 100 m, sent through our server (Supabase), which keeps neither. HERE's End User Terms (www.here.com/en-gb/terms/here-end-user-terms) and Privacy Policy (legal.here.com/en-gb/privacy) apply to those searches. Places found this way are kept on your device for at most 30 days unless refreshed, as HERE's terms require |
| Supabase (cloud hosting) | Hosts our public risk-zone dataset, user reports, reviewer authentication, anonymous usage events, and any live trip you choose to share (while active) | IP/request metadata; report contents (incl. optional emails); reviewer emails (admins only); anonymous usage events; shared-trip location while active |
| Apple Inc. (USA) | App distribution (App Store, TestFlight), and payment for Premium on iPhone | Per Apple's terms |
| RevenueCat, Inc. (USA) | Checks Premium subscriptions with Apple and Google (section 4b) | A random RevenueCat id, the store's purchase and renewal records, device model, OS and app version, language and store country; on iPhone, Apple's identifier for vendor |
| Apple Inc. (USA) / Google LLC (USA) | Speech to text for voice reports, only while you make one (§3b) | The few seconds of speech while the app listens, under the provider's own terms. Tsamaya receives only the recognised text and keeps none of it |
| Google LLC (USA) | App distribution on Android (Google Play), and payment for Premium on Android | Per Google Play's terms |
| Functional Software, Inc. dba Sentry (EU data region, Germany) | Crash and error reporting | The error and its stack trace, device model, OS version, app and update version, the random installation identifier, and a filtered trail of recent app events. Never coordinates, place names, start/end points or other personal information |
| Expo (650 Industries, Inc., USA) | Push-notification delivery, if you opt in (§4a) | Device push token, notification title/text |
| Apple Inc. (USA) / Google LLC (USA) | Push delivery to the device itself (APNs / Firebase Cloud Messaging) | Device push token, notification title/text |

These providers process data outside South Africa. POPIA s72 permits cross-border transfers where the recipient is bound by adequate protection; our providers are bound by their published data-protection terms. [ATTORNEY: confirm s72 position.]

## 6. Retention

- Location, searches, routes: not retained by us server-side. Transient processing only.
- Shared live trips: visible via the private link while the trip is active (up to 12 hours after the last update; SOS links up to 24 hours); once you arrive or end the trip the link expires about 30 minutes later. Deletable on request.
- On-device data (saved places, settings, trip history, search counts): retained until you delete it or uninstall the app. Trip history keeps at most the last 12 months, and you can delete it at any time in the app (Trip history, Delete trip history); search counts keep the last 14 days. Your phone's own backup (iCloud or Google) may include this data; it stays in your own account and we cannot see it.
- User reports and feedback: retained until reviewed and actioned; deletable on request via the contact address.
- Push registrations (§4a): retained while notifications are switched on. Deleted immediately when you turn all the notification switches off, and retired when the delivery service reports the app has been uninstalled.
- Premium records (section 4b): kept by RevenueCat and on our server while they are needed to provide Premium and answer billing questions, and deleted on request where the law allows.
- Reviewer accounts: retained while the reviewer is authorised.

## 7. Security

Transport encryption (HTTPS/TLS) on all network calls; row-level security on our hosted dataset. The only personal information drivers can send us is what they choose to put in a report (an optional note and email); reports are stored under insert-only access rules: the app's public key cannot read them back. No system is perfectly secure, and we cannot guarantee absolute security.

## 8. Your rights (POPIA)

You may request access to, correction of, or deletion of personal information we hold; object to processing; or complain to the Information Regulator (South Africa): inforegulator.org.za, complaints.IR@inforegulator.org.za. Because we hold almost no personal information about drivers, most requests will be satisfiable by confirming we hold nothing beyond what is on your device.

To exercise any right: info@tsamayaapp.co.za. We respond within a reasonable time and at most within the periods POPIA prescribes.

## 9. Children

Tsamaya is a driving app and is not directed at children under 18. We do not knowingly process children's personal information.

## 10. Risk data is not personal data

The risk zones and road classifications shown in the app are derived from public, aggregated sources (including SAPS crime statistics and OpenStreetMap) plus curated review. They describe **areas**, never individuals, and contain no personal information.

## 11. Changes

We will post changes here and update the effective date. Material changes will be flagged in the app.
