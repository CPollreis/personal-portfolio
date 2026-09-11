---
title: Adding content
description: Step-by-step recipes for a new build log, project, photo, video moment, and position.
---

Every recipe below is a git-tracked file edit. Run `npm run dev` while you work
so you see the result live, then commit and push to publish (see
[Local dev and deploy](/docs/dev-and-deploy)). Full field reference lives in
[Content collections](/docs/content-collections).

## The one-file rule

Every kind of entry is exactly one file (or one config row). Nothing else needs
editing: no layout files, no page files, no counts.

| To add a... | Touch only | It appears |
| --- | --- | --- |
| FSAE build-log post | `src/content/fsae/<slug>.mdx` | Card in the home **Build log** feed (its subsystem filter count bumps too) + its own page at `/fsae/<slug>` |
| Project | `src/content/projects/<slug>.mdx` | Card in the home **Build log** feed (the Projects filter count bumps too) + its own page at `/projects/<slug>` |
| Photo or film moment | `src/content/photography/<NN-slug>.md` | Auto-packed into the `#photography` archive grid on the home page; its count updates |
| Position / affiliation | one object in `positions[]` in `src/config/site.ts` | The lines under your name in the home hero |

The Build log is one merged feed of FSAE posts and projects, newest first, with
a filter rail; the grid wraps at three columns, so any number of entries lays
out correctly. **You never touch the filter to add an entry** - the filter reads
its categories and counts from the feed at build time, so a new post or project
joins the right filter automatically. (Adding a whole new *filter* is a separate,
rare task: see [Adding or changing a build-log filter](#adding-or-changing-a-build-log-filter).)
Sorting is automatic: the feed by `date` (newest first) and photography by
`order`.

## A new FSAE build-log post

1. Create `src/content/fsae/<slug>.mdx`. The slug becomes the URL, so keep it
   short and hyphenated, e.g. `bms-can-integration.mdx` renders at
   `/fsae/bms-can-integration`.
2. Add the frontmatter. Required: `title`, `date`, `subsystem`
   (`firmware` \| `manufacturing` \| `autonomous`), `summary`. Set `subsystem`
   correctly: it color-codes the post everywhere it appears.
3. Write the body in MDX. Import any images and components at the top, then
   lay the article out with `<Step>` (the held-frame rhythm) and drop into
   loose prose or a `<Gallery>` where a Step is not needed:

   ```mdx
   ---
   title: BMS to CAN Integration
   date: 2025-03-02
   subsystem: firmware
   season: 2025 Season
   summary: "Bringing the battery-management data onto the car's CAN bus."
   tags: [BMS, CAN, Firmware]
   draft: false
   ---

   import Step from '../../components/content/Step.astro';
   import Gallery from '../../components/content/Gallery.astro';
   import topology from '../../assets/buildlog/IMG_1878.jpg';

   The BMS talks isoSPI internally, but the rest of the car speaks CAN...

   <Step figure={topology} caption="First topology sketch, sensor bus above the firewall">

   The interesting part of vehicle networking is not sending frames, it is
   agreeing on what they mean...

   </Step>

   <Gallery labels={['SCOPE · isoSPI', 'BUS · CAN TRACE']} cols={2} />
   ```

   `<Step figure={img} caption="...">words</Step>` gives a two-column band whose
   figure sticks while the words scroll; successive Steps auto-alternate sides.
   `<Step figure={img} />` alone is a centered plate; `<Step>words</Step>` with
   no figure is a full-width text band. Full rules:
   [Entry pages: the held-frame body](/docs/architecture/#entry-pages-the-held-frame-body).

   For a schematic or a long document, two wider components sit between Steps:

   ```mdx
   import DiagramViewer from '../../components/content/DiagramViewer.astro';
   import DocEmbed from '../../components/content/DocEmbed.astro';
   import pipeline from '../../assets/diagrams/dv/software-pipeline.svg?raw';

   <DiagramViewer svg={pipeline} title="ROS 2 workspace graph" caption="..." />
   <DocEmbed src="/dv/driverless-systems-review.pdf" title="Design review" meta="46 slides · PDF" />
   ```

   `<DiagramViewer>` inlines an SVG into a pan/zoom stage: drag to pan, pinch or
   Cmd/Ctrl + scroll to zoom, double-click to zoom in, plus zoom/fit/fullscreen
   buttons. Plain scrolling is never trapped. Import the SVG with `?raw`.
   `<DocEmbed>` frames a PDF from `public/` with open and download links, and
   falls back to a link card on phones, where browsers refuse inline PDFs. Both
   sit in the same 68ch column as the prose, so their edges line up with the
   words above and below them.

   **Exporting a draw.io page for `<DiagramViewer>`:**

   ```sh
   /Applications/draw.io.app/Contents/MacOS/draw.io --export --format svg \
     --page-index 1 --border 24 --theme light -o diagram.svg source.drawio
   node scripts/drawio-svg.mjs diagram.svg
   ```

   Export light (it keeps the author's colour coding; `--theme dark` swaps in
   draw.io's own garish dark variants), then let the script do three things the
   SVG needs before it can be inlined:

   - Drop the `<image>` raster fallback beside every `<foreignObject>`. No
     browser uses it and it is ~97% of the file (4.6 MB becomes 45 KB).
   - Strip the `html:` namespace prefix. The HTML parser ignores prefixed tags,
     so `<html:br />` stops breaking lines and labels render run-together.
   - Re-tone the palette for the dark stage: hue and role are preserved and
     only lightness moves, so a blue box stays blue and a green box stays
     green, on a dark panel with light text.

4. (Optional) Add a `cover` image (co-locate the file and reference it,
   e.g. `cover: ./can-trace.jpg`). The cover doubles as the entry's **thumbnail
   on the home page card**; without one, an on-brand placeholder frame renders
   instead. A `hero` image or `heroVideo` (`public/` path) sits behind the
   entry page title. Set `draft: true` to keep it out of the build until it is
   ready.

## A new media entry (the numbered ones)

Some build-log entries are a frame or a clip rather than an article. They render
without the hero, tags and summary chrome, and they carry a number instead of a
written title: `/fsae/raw-003`.

The number is not in the filename. `src/config/media.ts` holds an ordered list
of media entry ids, and position in that list decides both the URL and the
`number` prop the MDX body receives (`{props.number}`). So:

1. Add `src/content/fsae/<descriptive-slug>.mdx` as usual.
2. Add `'<descriptive-slug>'` to `mediaOrder` in `src/config/media.ts`, in the
   position you want it to appear.

Reordering or removing one is an edit to that list, never a file rename. Drafts
keep their place in the list but do not consume a number, so the numbers a
reader sees are always 1..n with no gaps; publishing a draft slots it in and
renumbers the rest automatically.

## A new project

1. Create `src/content/projects/<slug>.mdx`, e.g. `spectrum-analyzer.mdx`
   renders at `/projects/spectrum-analyzer`.
2. Add the frontmatter. Required: `title`, `date`, `kind`, `summary`. Common
   optional fields: `stack[]`, `links.repo`, `links.demo`. (The Build log feed
   sorts by `date`, so `order`/`featured` do not change its position; `date` is
   what places a project in the feed.)

   ```mdx
   ---
   title: Music Spectrum Analyzer
   date: 2025-02-10
   kind: Embedded · DSP
   stack: [STM32, C, FFT, Altium, SolidWorks]
   summary: "A 28-band acrylic spectrum analyzer driven by FFT DSP on an STM32."
   order: 1
   featured: true
   links:
     repo: https://github.com/CPollreis/spectrum-analyzer
   draft: false
   ---

   import Gallery from '../../components/content/Gallery.astro';

   I wanted to actually see music on the wall...
   ```

3. Write the MDX body. Add a `video` (YouTube/Vimeo URL) for a lead demo video,
   or a `cover`/`hero` image for the header. As with FSAE posts, `cover` is also
   the thumbnail on the home page card; leave it out and the placeholder frame
   renders until you have a real shot.

## Adding or changing a build-log filter

You almost never need this. The Build log filter (see
[The build log and its filter](/docs/architecture/#the-build-log-and-its-filter))
derives its rows and counts from the feed, so adding a post or project needs no
filter edit. You only touch the filter to add a whole new category. There are two
cases.

### Add a new FSAE subsystem (a new sub-filter under FSAE)

The subsystems are a fixed enum, so a new one is a three-file change:

1. **`src/config/fsae.ts`** - add the id to the `Subsystem` union, add its entry
   to the `subsystems` map (`label`, `code`, `color`, `text`, `blurb`, `focus`),
   and add it to `subsystemOrder`. Pick a `color` from the token triad
   (`--color-accent` / `--color-cyan` / `--color-indigo`) so it fits the palette.
2. **`src/content.config.ts`** - add the id to the `subsystem` enum in the `fsae`
   collection schema, or `astro check` will reject any post using it.
3. **`src/pages/index.astro`** - add the id to the `LogCat` type and to the
   `subsystemCat` map (which turns a subsystem into its short filter code), then
   add a row to `logFilters` at `level: 1` with its `fc`/`ftc` colors. Its
   `count` uses `catCount('<code>')`, and it is already covered by the `fsae`
   group filter and the `fsaeCount` total.

After that, any post with the new `subsystem` joins the feed and its new
sub-filter automatically.

### Add a new top-level filter (a sibling of Projects and FSAE)

This is rarer and only makes sense if you add a new *kind* of content to the feed
(not a new subsystem). In `src/pages/index.astro`: give the new content a
`LogCat`, tag its feed entries with that `cat`, add a `level: 0` row to
`logFilters`, and - if it should be reachable by deep link - add a `#hash → id`
pair to the `HASH_FILTER` map in the page's `<script>`. The `showsEntry()` helper
already handles any plain (non-group) category, so no other script change is
needed.

## A new photography moment: photo

1. Create `src/content/photography/<NN-slug>.md`. The numeric prefix keeps the
   files ordered on disk; the `order` field controls actual display order.
2. Add photo frontmatter (no MDX body needed). `story` is the caption shown in
   the lightbox.

   ```yaml
   ---
   title: Cold Start
   kind: photo
   date: 2025-01-12
   story: First frost test of the season, breath fogging the viewfinder.
   location: Winnipeg, MB
   camera: Sony α7 III
   lens: 35mm f/1.8
   iso: "400"
   aperture: f/2.0
   focal: 35mm
   image: ./cold-start.jpg
   ratio: 3/2
   order: 9
   ---
   ```

3. Drop the image next to the Markdown file and reference it with a relative
   path (`image: ./cold-start.jpg`). `astro:assets` optimizes it automatically.
   Leave `image` out to render an on-brand placeholder for now.

## A new photography moment: video

1. Create `src/content/photography/<NN-slug>.md` with `kind: video`.
2. Point `video` at a `public/` path, and provide `fps`/`quality` for the tech
   readout. Optionally add an `image` to use as the poster frame.

   ```yaml
   ---
   title: Green Over Superior
   kind: video
   date: 2024-05-11
   story: The G5 aurora storm. The whole sky moved like curtains.
   location: Lake Superior, MN
   camera: Sony α7 III
   fps: "24"
   quality: 4K UHD
   video: /videos/green-over-superior.mp4
   image: ./green-over-superior-poster.jpg
   ratio: 16/9
   order: 1
   ---
   ```

3. Export the clip as **two files with the same basename** and put both in
   `public/videos/`:

   - `public/videos/green-over-superior.webm` (VP9/AV1)
   - `public/videos/green-over-superior.mp4` (H.264)

   Reference the `.mp4` in frontmatter (`video: /videos/green-over-superior.mp4`).
   The gallery derives the `.webm` sibling and lists it first, so Firefox decodes
   the webm in software while other browsers use the mp4. Shipping only the mp4
   works everywhere except it can stutter or fail to decode on Firefox/macOS, so
   always ship the pair. More detail in [Media guidelines](/docs/media) and the
   `footage.ts` section of [Architecture](/docs/architecture).

   In the archive grid, video moments autoplay muted while scrolled into view
   and pause off-screen (an IntersectionObserver in
   the home page's `#photography` script manages them); the tile still opens the
   lightbox like any photo.

## How the archive grid places a moment

The `#photography` archive is a mosaic grid: a fixed-column CSS grid (4 columns
on desktop, 2 on mobile) with `grid-auto-flow: dense`, so there is no layout
file to edit when the collection grows. Frames flow in `order` sequence and
dense flow backfills every gap left to right, so the last row always closes
flush. `src/components/photography/archiveGrid.ts` maps each `ratio` to a cell
shape:

| Frontmatter | Shape in the grid |
| --- | --- |
| vertical `ratio` (`3/4`, `2/3`, `9/16`) | **Tall**: one column wide, two row-heights - exactly twice the height of a `3/2` still, so portraits keep their shape. |
| anything else | **Still**: a standard cell holding a `3/2` face. Other landscape/square ratios cover-crop to fit. |

Practical notes:

- Aspect ratio is the only lever on a tile's footprint; there is no oversized
  or feature cell.
- On small screens the same tiles reflow into a 2-column dense grid.
- To reorder the archive, change `order` values (and ideally the `NN-` filename
  prefix to match); the grid re-lays everything out at build time.

## A new position or affiliation

The lines under your name in the home hero come from `positions[]` in
`src/config/site.ts`. Each row is `{ role, org, note?, href? }`; edit or append
and the hero updates. The availability line is `site.availability` in the same
file, and the socials/resume links are `socials[]` / `site.resume`.

## Verifying before you publish

- `npm run dev` and open the relevant page to confirm it renders.
- `npm run build` runs `astro check`, which fails loudly on a bad enum, a missing
  required field, or a broken image reference. A green build means the content is
  valid.
