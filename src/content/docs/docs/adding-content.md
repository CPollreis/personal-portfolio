---
title: Adding content
description: Step-by-step recipes for a new build log, project, photo, and video moment.
---

Every recipe below is a git-tracked file edit. Run `npm run dev` while you work
so you see the result live, then commit and push to publish (see
[Local dev and deploy](/docs/dev-and-deploy)). Full field reference lives in
[Content collections](/docs/content-collections).

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

4. (Optional) Add a `hero`/`cover` image (co-locate the file and reference it,
   e.g. `cover: ./can-trace.jpg`) or a `heroVideo` (`public/` path). Set
   `draft: true` to keep it out of the build until it is ready.

## A new project

1. Create `src/content/projects/<slug>.mdx`, e.g. `spectrum-analyzer.mdx`
   renders at `/projects/spectrum-analyzer`.
2. Add the frontmatter. Required: `title`, `date`, `kind`, `summary`. Common
   optional fields: `stack[]`, `links.repo`, `links.demo`, `order` (lower sorts
   first on the index), `featured`.

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
   or a `cover`/`hero` image for the header.

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

## Verifying before you publish

- `npm run dev` and open the relevant page to confirm it renders.
- `npm run build` runs `astro check`, which fails loudly on a bad enum, a missing
  required field, or a broken image reference. A green build means the content is
  valid.
