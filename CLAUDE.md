# personal_portfolio

Astro 7 + React 19 + Tailwind 4 + anime.js portfolio, deployed to GitHub Pages at https://calebpollreis.com. Starlight docs live under /docs.

## Commands
- Dev server: `npm run dev` (port 4321). Check `lsof -iTCP:4321 -sTCP:LISTEN` before starting — a server is often already running. Never leave orphan preview servers; kill what you start.
- Build: `npm run build` (runs `astro check` first).
- Screenshots: `node scripts/screenshot.mjs [path ...]` — screenshots pages against a preview server it manages itself. Do NOT write ad-hoc puppeteer/playwright scripts in scratchpad dirs; they fail with ERR_MODULE_NOT_FOUND because the packages only resolve from this project root.
- Smoke test: `node scripts/smoke.mjs` — replays navigation (Home → /fsae → Home) in Chromium AND Firefox and asserts background videos resume playing. Run it after any change touching video, navigation, page transitions, or the hero.

## Verification rules
- Static screenshots are not enough. Bugs here have repeatedly been interaction bugs: video not resuming on client-side nav back, click-blocked elements, clipped text. Exercise the flow.
- Caleb browses in Zen (Firefox engine). Firefox results are the source of truth; a Chromium-only pass has shipped broken behavior before. Background videos need .webm-first sources (see auto-memory firefox-video-gotcha).

## Conventions
- Never commit — Caleb reviews locally and commits manually.
- No em dashes anywhere in site copy.
- The site name is calebpollreis.com (not .dev). After any rename-type change, verify with `grep -r` over `src/` AND the built `dist/`.
- Media: videos in public/videos/, encode web variants with ffmpeg (H.264 + faststart, plus VP9 .webm).
