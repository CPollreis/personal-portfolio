---
title: Content collections
description: Every frontmatter field for FSAE posts, projects, and photography moments, with worked examples.
---

All content is git-tracked Markdown and MDX, validated at build time by the typed
schemas in `src/content.config.ts`. A missing required field or a wrong enum value
fails the build with a clear message, so the schema is the source of truth. There
are three content collections (plus the `docs` collection that powers these pages).

## FSAE build log

- Location: `src/content/fsae/<slug>.mdx` (or `.md`).
- Renders at `/fsae/<slug>`, listed as a thumbnail card in the home page FSAE section.
- `subsystem` drives color-coding across the site (firmware is blue,
  manufacturing is cyan, autonomous is indigo).

| Field | Type | Meaning |
| --- | --- | --- |
| `title` | string, required | Post title. |
| `date` | date, required | Publish/authoring date (`YYYY-MM-DD`). |
| `subsystem` | `firmware` \| `manufacturing` \| `autonomous`, required | Drives site-wide color-coding. |
| `season` | string, optional | Free-text season label, e.g. `2024 Season`. |
| `summary` | string, required | One or two sentence blurb for cards and the post header. |
| `cover` | image, optional | Card/lead image. Reference a co-located file, e.g. `./front-wing.jpg`; optimized by `astro:assets`. |
| `hero` | image, optional | Full-bleed image behind the entry title. Falls back to `cover`. |
| `heroVideo` | string, optional | Full-bleed looping clip behind the title. A `public/` path like `/videos/clip.mp4`. Wins over `hero`/`cover`. |
| `tags` | string array, default `[]` | Freeform tags. |
| `video` | URL, optional | A YouTube/Vimeo URL rendered as an embed in the post header. |
| `draft` | boolean, default `false` | When `true`, excluded from the built site. |

The MDX body is the article. It can import and use content components such as
`Gallery` and `VideoEmbed` from `src/components/content/`.

### Example frontmatter

```yaml
---
title: Building the Accumulator, Safely
date: 2024-07-14
subsystem: manufacturing
season: 2024 Season
summary: "Manufacturing the HV accumulator: qualifying every cell through tab testing, assembling segments, and the harnessing and safety discipline that a 400V pack demands."
tags: [Accumulator, HV safety, Tab testing, Harnessing]
draft: false
---
```

## Projects

- Location: `src/content/projects/<slug>.mdx` (or `.md`).
- Renders at `/projects/<slug>`, listed as a thumbnail card in the home page Projects section.

| Field | Type | Meaning |
| --- | --- | --- |
| `title` | string, required | Project title. |
| `date` | date, required | Project date (`YYYY-MM-DD`). |
| `kind` | string, required | Short category label, e.g. `Embedded · DSP`. |
| `stack` | string array, default `[]` | Tech stack chips. |
| `summary` | string, required | One or two sentence blurb for cards and the header. |
| `cover` | image, optional | Card/lead image (co-located file reference). |
| `hero` | image, optional | Full-bleed image behind the entry title. Falls back to `cover`. |
| `heroVideo` | string, optional | Full-bleed looping clip behind the title. A `public/` path. Wins over `hero`/`cover`. |
| `video` | URL, optional | Demo video (YouTube/Vimeo) shown as the lead media. |
| `links.repo` | URL, optional | Source repository. |
| `links.demo` | URL, optional | Live demo. |
| `order` | number, default `99` | Sort order on the index (lower shows first). |
| `featured` | boolean, default `false` | Highlights the project. |
| `draft` | boolean, default `false` | When `true`, excluded from the built site. |

### Example frontmatter

```yaml
---
title: Music Spectrum Analyzer
date: 2025-02-10
kind: Embedded · DSP
stack: [STM32, C, FFT, Altium, SolidWorks]
summary: "A 28-band acrylic spectrum analyzer: FFT-based DSP on an STM32 driving WS2812B LED strips over DMA, on a custom Altium-designed PCB."
order: 1
featured: true
links:
  repo: https://github.com/CPollreis/spectrum-analyzer
draft: false
---
```

## Photography moments

- Location: `src/content/photography/<NN-slug>.md` (one Markdown entry per moment).
- Rendered in the archive grid at `/photography` (numeric filename prefixes keep
  the files ordered on disk; `order` controls display order).
- The archive lays itself out from this collection alone (the "Feature Lead"
  packer in `src/components/photography/archiveGrid.ts`): adding a file extends
  the grid, and `ratio` + `feature` decide the tile's shape. See
  [the archive grid](/docs/adding-content/#how-the-archive-grid-places-a-moment)
  for the placement rules.
- The Markdown body is unused: `story` carries the caption shown in the lightbox.
- `image` is optional. Until a real asset is dropped in, the gallery renders
  on-brand film-toned placeholders.

| Field | Type | Meaning |
| --- | --- | --- |
| `title` | string, required | Moment title. |
| `kind` | `photo` \| `video`, default `photo` | Whether this moment is a still or a looping clip. |
| `date` | date, required | When it was captured (`YYYY-MM-DD`). |
| `story` | string, optional | Why the moment matters. Shown in the lightbox detail panel. |
| `location` | string, optional | Where it was shot. |
| `camera` | string, optional | Camera body. |
| `lens` | string, optional | Lens (photos). |
| `iso` | string, optional | ISO readout (photos). Quote it so YAML keeps it a string. |
| `aperture` | string, optional | Aperture readout (photos), e.g. `f/8`. |
| `focal` | string, optional | Focal length (photos), e.g. `200mm`. |
| `fps` | string, optional | Frame rate readout (videos). |
| `quality` | string, optional | Quality readout (videos), e.g. `4K UHD`. |
| `image` | image, optional | Co-located still, e.g. `./frame.jpg`; optimized by `astro:assets`. Used as the poster for video moments too. |
| `video` | string, optional | Looping clip for `kind: video` moments. A `public/` path like `/videos/clip.mp4`. A co-hosted `.webm` sibling is tried first for Firefox. |
| `ratio` | one of `1/1`, `4/3`, `3/4`, `3/2`, `2/3`, `16/9`, `9/16`; default `3/2` | Aspect ratio of the tile. Also drives grid shape: vertical ratios (`3/4`, `2/3`, `9/16`) render as full-band talls, twice the height of a still. |
| `feature` | boolean, default `false` | Renders as an oversized 2x2 lead in the archive grid. Leads alternate sides band to band. Ignored on vertical ratios (a 2x2 cell is a landscape crop). |
| `order` | number, default `99` | Display order in the gallery (lower shows first). |

### Example frontmatter: a photo

```yaml
---
title: Apex
kind: photo
date: 2025-06-08
story: Brainerd, turn three, the first time our car looked fast instead of just finished. I panned with it at 1/60 until one frame came back sharp.
location: Brainerd International Raceway, MN
camera: Sony α7 III
lens: 70–200mm f/2.8 GM
iso: "100"
aperture: f/8
focal: 200mm
ratio: 3/2
order: 2
---
```

### Example frontmatter: a video

```yaml
---
title: Green Over Superior
kind: video
date: 2024-05-11
story: The G5 storm in May 2024. The whole sky moved like curtains, and I kept the camera rolling.
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

For a video moment, ship both `/videos/green-over-superior.webm` and
`/videos/green-over-superior.mp4` (same basename): the gallery tries the `.webm`
first for Firefox. See [Adding content](/docs/adding-content) and
[Media guidelines](/docs/media).
