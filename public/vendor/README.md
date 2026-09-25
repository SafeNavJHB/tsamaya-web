# public/vendor

Third-party browser libraries, committed so that `node build.mjs` never needs `npm install`. Written by `npm run vendor` (scripts/vendor.mjs) from the exact versions pinned in package.json. Do not edit these files by hand.

| File | Package | Version | Licence | Used for |
|---|---|---|---|---|
| `gsap.min.js` | gsap | 3.15.0 | GSAP Standard "no charge" licence (https://gsap.com/standard-license). Free for commercial sites since 3.13; the only restriction is on building tools that compete with Webflow's visual animation builder, which does not apply here | Animation engine |
| `ScrollTrigger.min.js` | gsap | 3.15.0 | as above | Scroll-driven chapters and reveals |
| `SplitText.min.js` | gsap | 3.15.0 | as above | Headline line reveals, with screen-reader text kept intact |
| `lenis.min.js` | lenis | 1.3.26 | MIT | Smooth scrolling on mouse wheels only (touch keeps native scrolling) |
| `three.scene.min.js` | three | 0.186.0 (r186) | MIT | The 3D scene. A trimmed ES module holding only the classes listed in `scripts/vendor/three-entry.mjs`: 141 KB gzipped against 184 KB for the whole library |

## Upgrading a library

1. Bump the exact version in package.json and run `npm install`.
2. Run `npm run vendor`.
3. Test every page that uses it:
   - the home page, how it works, coverage and the metro pages for the 3D scene;
   - every page for GSAP and Lenis.
4. Update the table above and commit the rebuilt files together with package.json.

Upgrade one library at a time.
