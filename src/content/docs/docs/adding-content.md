---
title: Adding content
description: Step-by-step recipes for a new build log, project, photo, video moment, timeline event, and position.
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
| Photo or film moment | `src/content/photography/<NN-slug>.md` | Auto-packed into the `/photography` archive grid; the home photography card's count updates |
| Timeline event | one object in `src/config/timeline.ts` | A card on the `/timeline` spine, branch side and year handled automatically |
| Position / affiliation | one object in `positions[]` in `src/config/site.ts` | The lines under your name in the home hero |

The Build log is one merged feed of FSAE posts and projects, newest first, with
a filter rail; the grid wraps at three columns, so any number of entries lays
out correctly. **You never touch the filter to add an entry** - the filter reads
its categories and counts from the feed at build time, so a new post or project
joins the right filter automatically. (Adding a whole new *filter* is a separate,
rare task: see [Adding or changing a build-log filter](#adding-or-changing-a-build-log-filter).)
Sorting is automatic: the feed by `date` (newest first), photography by `order`,
timeline by year and date.

## A new FSAE build-log post

1. Create `src/content/fsae/<slug>.mdx`. The slug becomes the URL, so keep it
   short and hyphenated, e.g. `bms-can-integration.mdx` renders at
   `/fsae/bms-can-integration`.
2. Add the frontmatter. Required: `title`, `date`, `subsystem`
   (`firmware` \| `manufacturing` \| `autonomous`), `summary`. Set `subsystem`
   correctly: it color-codes the post everywhere it appears.
3. Write the body in MDX. To use content components, import them at the top:

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

   import Gallery from '../../components/content/Gallery.astro';

   The BMS talks isoSPI internally, but the rest of the car speaks CAN...

   <Gallery labels={['SCOPE · isoSPI', 'BUS · CAN TRACE']} cols={2} />
   ```

4. (Optional) Add a `cover` image (co-locate the file and reference it,
   e.g. `cover: ./can-trace.jpg`). The cover doubles as the entry's **thumbnail
   on the home page card**; without one, an on-brand placeholder frame renders
   instead. A `hero` image or `heroVideo` (`public/` path) sits behind the
   entry page title. Set `draft: true` to keep it out of the build until it is
   ready.

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
   `src/pages/photography/index.astro` manages them); the tile still opens the
   lightbox like any photo.

## How the archive grid places a moment

The `/photography` archive is a modular "Feature Lead" grid: the packer in
`src/components/photography/archiveGrid.ts` reads the whole collection (sorted
by `order`) and fills repeating 2-row bands on a 4-column grid, so there is no
layout file to edit when the collection grows. Two frontmatter fields decide a
moment's shape:

| Frontmatter | Shape in the grid |
| --- | --- |
| vertical `ratio` (`3/4`, `2/3`, `9/16`) | **Tall**: one column wide, the full band height - exactly twice the height of a `3/2` still. |
| `feature: true` (non-vertical ratios) | **Lead**: an oversized 2x2 cell. At most one per band, and leads alternate left/right from band to band. |
| anything else | **Still**: a standard cell; stills stack two per column. |

Practical notes:

- Give each band at most one `feature: true` moment if you care exactly where
  leads land; extra features simply lead later bands.
- The typographic index tile ("12 moments · 2021 - 2026 · ...") is generated
  automatically from whatever cells the final band leaves open. Its counts
  update on their own; never edit it by hand.
- On small screens the same tiles reflow into a 2-column dense grid and the
  index tile hides itself.
- To reorder the archive, change `order` values (and ideally the `NN-` filename
  prefix to match); the packer re-lays everything out at build time.

## A new timeline event

The `/timeline` page renders entirely from `src/config/timeline.ts`. Add an
object to the `events` array of the right year (or add a whole new year block
with a `theme` word) and the spine lays it out: branch side, node color by
`kind`, and the ghost year numeral all derive from the data.

```ts
{
  id: 'first-track-day',            // unique, kebab-case
  date: '2026-08-15',               // ISO date, shown on the card
  title: 'First track day with the DSO stack',
  kind: 'fsae',                     // 'milestone' | 'fsae' | 'project' | 'photo'
  weight: 2,                        // optional: 2 = major event, bigger glowing node
  why: 'A few honest lines on why this moment mattered.',
  media: { type: 'photo', alt: 'The car lined up at the first cone gate.' },
},
```

`media.src` is optional: leave it off and the card shows a "photo pending"
frame with the alt text; point it at a file under `public/` when you have one.

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
