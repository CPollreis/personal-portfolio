---
name: verify
description: Verify a change to the portfolio site by screenshotting pages and replaying navigation/interaction in Chromium and Firefox. Use after any visual, animation, video, or navigation change, before telling Caleb it works.
---

# Verifying portfolio changes

Never write ad-hoc puppeteer/playwright scripts (especially not in scratchpad or jobs directories — the packages only resolve from the project root, and this caused repeated ERR_MODULE_NOT_FOUND failures). Use the checked-in scripts, run from the project root:

## 1. Interaction smoke test (always run this)

```
node scripts/smoke.mjs
```

Replays the historically broken flows in Chromium AND Firefox: hero video plays on load, video resumes after Home → /fsae → Home navigation, and nav links are not click-blocked by overlays on any core page. Exit 0 = pass. Firefox matters most: Caleb browses in Zen (Firefox engine), and Chromium-only checks have shipped broken behavior before.

Both scripts reuse a dev server already running on :4321, otherwise they start `astro preview` on :4331 from the existing `dist/` and kill it when done. If neither exists, run `npm run build` first.

## 2. Screenshots (for visual changes)

```
node scripts/screenshot.mjs                  # default page set, Chromium
node scripts/screenshot.mjs /photography     # specific paths
node scripts/screenshot.mjs --firefox /      # Firefox rendering
node scripts/screenshot.mjs --full /         # full-page capture
```

Output lands in `.screenshots/` (gitignored); Read the printed PNG paths to inspect. Look specifically for: clipped text (footer POLLREIS-style bugs), broken button outlines, wrong accent glyphs, missing media.

## 3. Extend, don't fork

If a change needs a new check (a new interactive element, a new page), add it to `scripts/smoke.mjs` so it runs forever after — don't verify it with a one-off script.

## 4. Rename/config changes

For site-wide text or URL changes, grep both `src/` and the built `dist/` — a rename that passes in src has shipped stale in dist before.
