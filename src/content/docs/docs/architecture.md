---
title: Architecture
description: How pages, layouts, React islands, design tokens, motion, and the video keeper fit together.
---

## Static Astro output

The site builds to plain static files. `npm run build` runs `astro check`
(type-checking) then `astro build`, and the result lands in `dist/`. There is no
runtime server: every route is prerendered HTML plus a little shared JavaScript.

`astro.config.mjs` wires up the integrations: `react`, `mdx`, `sitemap`,
`starlight` (these docs), and Tailwind v4 through the `@tailwindcss/vite` plugin.
`site` is set to `https://calebpollreis.com` so the sitemap and canonical/OG URLs
are correct.

## Pages and routing

Routes come from files in `src/pages/`:

- `index.astro` (`/`), `about.astro`, `timeline.astro`, `colophon.astro`,
  `404.astro`: one file per route.
- `fsae/index.astro` plus `fsae/[...slug].astro`: the FSAE index and one dynamic
  route per build-log entry.
- `projects/index.astro` plus `projects/[...slug].astro`: same pattern for projects.
- `photography/index.astro`: the gallery (a single page that mounts the lightbox
  island).

The dynamic `[...slug]` pages read their collection with `getStaticPaths()` and
render each entry, so adding a Markdown file is all it takes to publish a new
page. The docs you are reading are injected by Starlight under `/docs/` and do not
touch `src/pages/`.

## The Base layout

Every portfolio page wraps its content in `src/layouts/Base.astro`. It owns:

- the `<head>`: charset, viewport, theme color, favicon, sitemap link, and SEO
  tags via `src/components/Seo.astro` (accepts `title`, `description`, `image`,
  `noindex`).
- `<ClientRouter />` from `astro:transitions` for smooth, SPA-like navigation
  between pages.
- the shared chrome: skip link, scroll-progress bar (persisted across swaps with
  `transition:persist`), `Nav`, `Footer`.
- a single `<script>` block that imports the three shared scripts:
  `motion.ts`, `chrome.ts`, and `footage.ts`.

Props of note: `padTop` (default `true`) adds top padding under the fixed nav;
full-bleed pages set it to `false` and manage their own spacing.

## React islands

The site is almost entirely Astro-rendered HTML. The one interactive React
component is the photography lightbox, mounted in `src/pages/photography/index.astro`:

```astro
<MomentLightbox client:load moments={moments} />
```

`client:load` hydrates it as soon as the page loads. There are no other client
islands; everything else is static markup plus the shared scripts below. When you
do need interactivity, prefer an island with the narrowest hydration directive
that works (`client:visible` or `client:idle` before `client:load`).

## Design tokens and Tailwind v4

Styling is Tailwind v4 configured entirely in CSS (no `tailwind.config.js`).
`src/styles/global.css` opens with `@import "tailwindcss"`, imports the
self-hosted variable fonts, and defines the design tokens inside an `@theme`
block. Those tokens become both CSS variables and Tailwind utilities at once, for
example:

- `--color-bg`, `--color-surface`, `--color-raised`, `--color-line`: the
  OLED-black surface ramp.
- `--color-ink`, `--color-muted`, `--color-faint`: the text tiers.
- `--color-accent` (blue), `--color-cyan`, `--color-indigo`: the accent triad,
  used sparingly.
- `--font-display` (Space Grotesk), `--font-sans` (Inter), `--font-mono`
  (JetBrains Mono): the type families, all self-hosted so there are no external
  font requests.

`src/styles/moments.css` holds the extra styling for the photography gallery.
Editing a token in `global.css` re-themes the whole site.

## The motion engine

`src/scripts/motion.ts` is one shared, declarative anime.js runtime for the whole
site. Markup opts in with data-attributes and the script wires up an
IntersectionObserver plus anime.js, so pages ship zero per-effect JavaScript.
Supported attributes include:

- `data-reveal[="up|left|right|clip"]` with optional `data-reveal-delay`: fade
  and slide (or clip-wipe) an element in on scroll.
- `data-stagger` on a container (with optional `data-stagger-gap`): staggers its
  `[data-stagger-item]` children.
- `data-counter="1240"` (plus `data-counter-prefix` / `data-counter-suffix`):
  count up to a number.
- `data-scramble`: scramble-reveal the element's text.
- `data-draw[="scroll"]`: draw inline SVG strokes on enter or synced to scroll.
- `data-parallax="0.15"`: slow scroll drift for decorative layers.

Helper components in `src/components/motion/` (`Reveal.astro`, `Stagger.astro`,
`Counter.astro`, `ScrambleText.astro`) wrap these attributes so you rarely write
them by hand. Everything degrades gracefully: with no JavaScript, content is fully
visible (the initial-hidden CSS is scoped to `html.motion`, a class only this
script adds); with `prefers-reduced-motion`, final states are applied instantly.
The engine re-initializes after every `ClientRouter` swap (`astro:page-load`), and
marks nodes with `data-mo-bound` so repeat passes never double-bind.

`src/scripts/chrome.ts` handles the rest of the persistent chrome (for example the
scroll-progress bar).

## footage.ts: keeping background videos alive

`src/scripts/footage.ts` exists to keep full-bleed background and title videos
playing across `ClientRouter` navigations, which is trickier than it sounds. It
finds every `video[data-header-video]` and manages playback. The hard parts it
handles:

- After a `ClientRouter` swap, the adopted `<video>` may never run source
  selection or may carry a candidate list already marked failed. So on every swap
  it rebuilds the element from scratch (same attributes and `<source>` children),
  which makes the arrival behave like a real page parse.
- Firefox on macOS can fail its H.264 decoder after a swap, leaving
  `NETWORK_NO_SOURCE`. A fresh element re-tries the `.webm` source first, which
  Firefox decodes in software. This is why background videos are provided as
  webm plus mp4 pairs with the same basename: the `.webm` is listed first and
  tried first. See [Media guidelines](/docs/media) for the pairing rule.
- Autoplay only fires on a real page parse, so playback is restarted explicitly
  and muted (muting is required for programmatic autoplay).
- Browsers pause media in hidden tabs and on back/forward-cache restores without
  reliably resuming, so playback resyncs on `visibilitychange` and `pageshow`.

It respects `prefers-reduced-motion` by holding videos still. The takeaway for
content authors: mark full-bleed clips with `data-header-video` and ship a
`.webm` next to the `.mp4`, and this script does the rest.
