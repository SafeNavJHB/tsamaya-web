# Build notes & app bugs (website demo capture)

Notes from building the site's demo assets against the **current Tsamaya build**
(bundle `com.tsamaya.app`, June 2026), so a future session can reproduce it — and
a running list of app issues spotted along the way.

## How the screenshots were captured

Real device screenshots on the demo page come from the iOS Simulator:

1. Boot a simulator: `xcrun simctl boot "iPhone 16 Pro"` then `open -a Simulator`.
2. Build & install **(see the bug below — you must use Release)**:
   `LANG=en_US.UTF-8 npx expo run:ios --configuration Release`
3. Put the simulator inside a service area so live zones/map load, e.g. Johannesburg:
   `xcrun simctl location <UDID> set -26.1076,28.0567`
4. (Re)launch and screenshot at device resolution:
   `xcrun simctl launch booted com.tsamaya.app`
   `xcrun simctl io booted screenshot home.png`

Captured views (all real): Johannesburg suburban (`home.png`), JHB inner-city
high-risk overlay (`risk-innercity.png`), Cape Town (`capetown.png`). Changing the
GPS with `simctl location` and relaunching is the quick way to get different metros.

The **route flow** screens (From/To card, route comparison result) need on-screen
interaction (search → select → Go), which needs Simulator remote-control approval;
that wasn't granted in the capture session, so the demo page uses faithful SVG
mock-ups for those two screens (built from the real UI copy and brand colours).
To replace them with real captures later: drive the flow, screenshot, drop the PNGs
in `public/img/screens/`, and add entries to `src/shots.mjs`.

---

## 🐞 Bug 1 — Debug simulator build fails to link (SwiftUICore)

**Severity:** build-blocking for the default `expo run:ios` (Debug). Release is fine.

`npx expo run:ios` (Debug configuration) fails at the final link step with:

```
ld: Undefined symbols for architecture arm64:
  Could not parse or use implicit file '.../SwiftUICore.framework/SwiftUICore.tbd':
  cannot link directly with 'SwiftUICore' because product being built is not an
  allowed client of it
xcodebuild exited with error code 65
```

This is the known **Xcode 16 + React Native New Architecture "debug dylib"** issue:
the debug build links a SwiftUI-previews helper (`__preview.dylib` / `Tsamaya.debug.dylib`)
that pulls in the private `SwiftUICore`, which the simulator SDK refuses to link.
It is **not** caused by app code.

**Workaround used:** build the Release configuration, which doesn't produce the
debug dylib and links cleanly:

```bash
npx expo run:ios --configuration Release
```

**Suggested fixes for a future build (any one of these):**
- Update Xcode to the latest point release (the linker rule was relaxed in newer SDKs).
- Add a Podfile `post_install` step that disables the debug dylib / SwiftUI previews
  for the app target (set `ENABLE_PREVIEWS = NO`, or the RN "debug dylib" flag), or
  raise the iOS deployment target if it's currently below the SDK's expectation.
- Confirm whether the issue reproduces on a physical device / EAS cloud build (EAS
  builds Release, so TestFlight builds are unaffected — this only bites local Debug runs).

## UI observations

- Home, inner-city and Cape Town screens all render cleanly — live risk zones, safe
  corridors, the GPS dot, time-band label and the "Where to?" bar all display correctly.
- No visual glitches noted in the captured screens. The route-flow screens were not
  exercised live this session (see above), so they're untested here.
