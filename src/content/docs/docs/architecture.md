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

The site is a one-pager with satellite pages. Routes come from files in
`src/pages/`:

- `index.astro` (`/`): the whole site in one scroll. A compact bio hero
  (positions and links from `src/config/site.ts`) over the stabilized car
  footage, then anchor sections `#fsae` (the **Build log**: FSAE posts and
  personal projects merged into one filterable feed) and `#photography` (the
  full photography gallery: a dense mosaic archive grid plus the lightbox
  island). Both the feed and the grid render straight from the content
  collections, so they grow automatically as entries are added. See
  [The build log and its filter](#the-build-log-and-its-filter) and
  [The photography archive grid](#the-photography-archive-grid) below.
- `fsae/[...slug].astro` and `projects/[...slug].astro`: one dynamic route per
  build-log entry / project writeup. See
  [Entry pages: the held-frame body](#entry-pages-the-held-frame-body).
- `colophon.astro`, `404.astro`: one file per route.
- The old tab URLs redirect: `/fsae` → `/#fsae`, `/projects` → `/#projects`,
  `/photography` → `/#photography`, `/about` → `/`, and the retired
  `/timeline` → `/` (see `redirects` in `astro.config.mjs`).

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
component is the photography lightbox, mounted in the home page's
`#photography` section (`src/pages/index.astro`):

```astro
<MomentLightbox client:load moments={moments} />
```

`client:load` hydrates it as soon as the page loads. There are no other client
islands; everything else is static markup plus the shared scripts below. When you
do need interactivity, prefer an island with the narrowest hydration directive
that works (`client:visible` or `client:idle` before `client:load`).

## The build log and its filter

The `#fsae` section on the home page is one unified feed rather than two grids.
`index.astro` reads the `fsae` and `projects` collections, maps every entry to a
common shape with a `cat` (category) tag, and sorts the merged list newest
first. The newest entry leads as a wide feature card; the rest follow as a
thumbnail grid. Each card carries `data-log-entry` and `data-cat` so the filter
can show or hide it without a rebuild.

**Categories.** Every entry gets one `LogCat`: projects are `prj`, and FSAE
posts inherit a code from their `subsystem` via the `subsystemCat` map
(`firmware → fw`, `manufacturing → mfg`, `autonomous → av`). These four codes,
plus the `all` and `fsae` group filters, are the filter vocabulary.

**The filter controls.** The `logFilters` array in `index.astro` defines the
rail rows. It is two-tier: `All entries`, `Projects`, and `FSAE` sit at the top
level (`level: 0`); the three subsystems (`Autonomy`, `Firmware`,
`Manufacturing`) are indented children (`level: 1`). `FSAE` is a *group* filter
that matches all three subsystem cats at once. Each row's `count` is computed
from the feed at build time (never hand-maintained), and its `fc` / `ftc`
colors paint the active state (the FSAE family keeps the blue-cyan-indigo
triad; `All` and `Projects` stay neutral). Desktop renders this as a sticky
index rail with a `Reset` button; below `md` the same rows collapse into
notched filter chips.

**The client script.** A small inline `<script>` at the bottom of `index.astro`
runs `initLogFilter()`. It wires the `[data-log-filter]` buttons (shared by the
rail and the chips) to toggle `display` on the `[data-log-entry]` cards via
`showsEntry()`, tracks the active filter with `aria-pressed`, and clicking the
active filter again clears back to `All`. Two deep-link paths preselect a
filter through the `HASH_FILTER` map: `#projects` lands on the Projects filter
(used by the nav breadcrumb, the 404 page, and post pages) and `#buildlog`
lands on `All` (the hero "Work" button). Because a same-page hero click is
intercepted by `ClientRouter` (it updates the hash with no `hashchange` event),
the script binds the filter onto those anchors' `click` directly as well as
listening for `hashchange`. Everything re-initializes on `astro:page-load`, so
the filter survives client-side navigation. Adding a filter or a subsystem is a
content/config task, covered in
[Adding or changing a build-log filter](/docs/adding-content/#adding-or-changing-a-build-log-filter).

## The photography archive grid

The `#photography` section is the full gallery, not a teaser. `index.astro`
reads the `photography` collection, sorts it by `order` then `date`, and lays
every moment out in one CSS grid: four columns on desktop, two below `md`, with
`grid-auto-flow: dense`. There is no layout file and no per-row markup to
maintain, so the grid grows with the collection.

`src/components/photography/archiveGrid.ts` is the only placement logic. Its
`archiveShape(ratio)` maps a moment's `ratio` to one of two cell shapes:

- a **vertical** ratio (`3/4`, `2/3`, `9/16`) becomes a `tall` cell: one column
  wide, two row-heights, so portraits keep their shape.
- everything else becomes a `std` cell: a single row-height holding a `3/2`
  face; other landscape/square ratios cover-crop to fit.

Dense flow then backfills every gap left to right, so the last row always
closes flush no matter how many moments exist. Aspect ratio is the only lever
on a tile's footprint: there is no oversized or "feature" cell.

Each tile is a `MomentFrame.astro` button carrying `data-moment-index`. The
`MomentLightbox` island (see [React islands](#react-islands)) delegates clicks
from those buttons and runs the shared-element zoom into the detail view.
`kind: video` tiles autoplay muted while scrolled into view and pause
off-screen: a second inline `<script>` in `index.astro` (`initScrollPlay()`)
owns those `[data-scrollplay]` videos with its own IntersectionObserver, so
they stay out of `footage.ts`'s always-on management (which owns the hero
footage).

## Entry pages: the held-frame body

`fsae/[...slug].astro` and `projects/[...slug].astro` are near-identical. Each
calls `getStaticPaths()` over its collection (drafts excluded, newest first),
and renders one page per entry:

1. A full-bleed **header**: `HeaderMedia.astro` paints the `heroVideo`, else
   `hero`, else `cover` behind the title, with a subsystem badge (FSAE) or a
   "Project" tag, the date, and `tags` / `stack`. With no media it falls back
   to a plain padded header.
2. An optional lead **`<VideoEmbed>`** when the entry sets a `video` URL.
3. The **MDX body**, rendered by `<Content />` inside
   `<div class="prose-hud entry-body">`.
4. **Prev / next** links to the adjacent entries and a "Back to all entries"
   link to `/#fsae` (or `/#projects`).

Inside the body, loose Markdown prose renders as a normal measured column
(`68ch`, centered). The rhythm comes from **`<Step>`**
(`src/components/content/Step.astro`), which has three modes:

| Usage | Renders as |
| --- | --- |
| `<Step figure={img} caption="...">` with body text | A two-column band. The figure is `position: sticky` and holds its half of the screen while the words beside it scroll past, then the next Step's figure takes over on the **opposite** side. |
| `<Step figure={img} />` with no body | A centered plate (`entry-plate`), caption beneath. Not sticky. |
| `<Step>` with body text and no `figure` | A full-width measured band of text (`entry-step--solo`), for a decision or trade-off with nothing to photograph. |

Sides alternate on their own: the CSS flips every second `.entry-step` with
`:nth-of-type(even)`, which works only because `<Step>` is the sole `<section>`
an entry body emits. You never pass `left` or `right`. Portrait figures
(`height > width`) are narrowed rather than cropped. Images are `import`ed at
the top of the `.mdx` file (from `src/assets/buildlog/` or a co-located file)
and passed to `figure={...}`.

## Content components

`src/components/content/` holds the three components an MDX body can import:

- **`Step.astro`** - the held-frame body rhythm above.
- **`Gallery.astro`** - a 2- or 3-column grid of optimized images
  (`images={[{ src, alt }]}`) or on-brand placeholder frames
  (`labels={[...]}`) for shots you have not taken yet.
- **`VideoEmbed.astro`** - a lazy, responsive YouTube/Vimeo embed framed in HUD
  brackets. Also used directly by the entry pages for the `video` field.

Everything else under `src/components/` is layout and decoration: `hud/`
(registration marks, reticles, spec labels), `layout/` (`Nav`, `Footer`,
`Section`, `HeaderMedia`), `motion/` (`Reveal`, `Stagger` wrappers over the
motion engine), `media/Placeholder.astro`, and `ui/` (`Button`, `SocialIcon`).

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

`src/styles/moments.css` holds the extra styling for the photography archive
(the `.moments` scope; `#photography` adds `.moments-inline` so the grid keeps
the gallery's type without repainting the page ground pure black).
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
- `data-draw[="scroll"]`: draw inline SVG strokes on enter or synced to scroll.
- `data-parallax="0.15"`: slow scroll drift for decorative layers.

Helper components in `src/components/motion/` (`Reveal.astro`, `Stagger.astro`)
wrap these attributes so you rarely write them by hand. The home page uses none
of them on purpose: it stays static so nothing distracts from navigation. Everything degrades gracefully: with no JavaScript, content is fully
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
