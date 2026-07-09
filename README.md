# Caleb Pollreis - Portfolio

A fast, static personal portfolio with a high-tech engineering-HUD aesthetic:
OLED-monochrome base, a blue→cyan→indigo accent triad, animated micrographics,
and anime.js motion. Built with **Astro + React islands**.

## Stack

- **Astro** (static output) · **React** islands (photography lightbox only)
- **Tailwind CSS v4** + CSS-variable design tokens (`src/styles/global.css`)
- **anime.js v4** via a single shared motion engine (`src/scripts/motion.ts`)
- **MDX content collections** (`src/content.config.ts`)
- **Starlight** docs at `/docs` (`src/content/docs/`)
- Self-hosted variable fonts: Space Grotesk / Inter / JetBrains Mono

## Docs

Full build-and-maintain documentation lives on the site itself at **`/docs`**
(source in `src/content/docs/`): architecture, every content-collection field,
step-by-step content recipes, media rules, and the deploy pipeline. The sections
below are the short version.

To read the docs:

- **Locally** - run `npm run dev`, then open http://localhost:4321/docs.
- **In production** - open https://calebpollreis.com/docs on the live site.

The pages are Markdown/MDX files in `src/content/docs/`. Edit one while
`npm run dev` is running and the docs site hot-reloads with your changes.

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # astro check + static build → dist/
npm run preview    # serve the production build
```

## Project structure

The site is a **one-pager with satellite pages**: `/` holds the bio hero and
the FSAE / Projects / Photography / Timeline sections; entry writeups, the
gallery, and the timeline live on their own pages linked from those sections.

```
src/
  pages/          # routes: index (the one-page site), timeline, colophon, 404,
                  #   fsae/[...slug], projects/[...slug], photography/
  layouts/        # Base.astro wraps every portfolio page
  components/     # UI + content components (Gallery, VideoEmbed, motion, ...)
  content/        # git-tracked content: fsae/ projects/ photography/ docs/
  content.config.ts  # typed frontmatter schemas (source of truth)
  scripts/        # shared client scripts: motion.ts, chrome.ts, footage.ts
  styles/         # global.css (design tokens via @theme), moments.css
  config/         # site.ts (positions/socials), paths.ts, fsae.ts, timeline.ts
public/           # served as-is: videos/, resume.pdf, favicon.svg, og-default.png, CNAME
```

## Adding content: the one-file rule

**Every kind of entry is exactly one file (or one config row).** No layout
files, no page files, no counts to update; the home page grids and the
photography archive re-pack themselves at build time. Full worked recipes live
in the [Starlight docs](https://calebpollreis.com/docs/adding-content).

| To add a... | Touch only | It appears |
| --- | --- | --- |
| FSAE build-log post | `src/content/fsae/<slug>.mdx` | Home `#fsae` thumbnail grid + `/fsae/<slug>` |
| Project | `src/content/projects/<slug>.mdx` | Home `#projects` thumbnail grid + `/projects/<slug>` |
| Photo / film moment | `src/content/photography/<NN-slug>.md` | Auto-packed `/photography` archive |
| Timeline event | one object in `src/config/timeline.ts` | A card on the `/timeline` spine |
| Position / affiliation | one row in `positions[]` in `src/config/site.ts` | Under your name in the hero |

The `cover` image in an FSAE/project entry doubles as its home page thumbnail
(light grey outlined card); until one is set, an on-brand placeholder renders.

- **FSAE build log** - add `src/content/fsae/<slug>.mdx`. Frontmatter:
  `title, date, subsystem (firmware|manufacturing|autonomous), season, summary,
  tags, cover?, hero?, heroVideo?, video?, draft?`. Body is MDX; use `<Gallery>`
  / `<VideoEmbed>`.
- **Projects** - add `src/content/projects/<slug>.mdx`. Frontmatter:
  `title, date, kind, stack[], summary, order, featured, links{repo,demo},
  cover?, hero?, heroVideo?, video?, draft?`.
- **Photography** - add `src/content/photography/<NN-slug>.md`. Frontmatter:
  `title, kind (photo|video), date, story?, location?, camera?, lens?, iso?,
  aperture?, focal?, fps?, quality?, image?, video?, ratio, feature?, order`.

### The photography archive grid

The archive on `/photography` is a modular "Feature Lead" grid
(`src/components/photography/archiveGrid.ts`): it packs moments into repeating
2-row bands from the content collection alone, so **adding a Markdown entry is
all it takes to extend it**. Placement is driven by two frontmatter fields:

- `ratio` - vertical ratios (`3/4`, `2/3`, `9/16`) render as full-band talls,
  exactly twice the height of a `3/2` still; everything else is a standard cell.
- `feature: true` - renders as an oversized 2x2 band lead. Leads alternate
  sides band to band; the flag is ignored on vertical ratios, which stay tall.

`kind: video` moments autoplay muted while scrolled into view and pause
off-screen; every tile (photo or video) still opens the lightbox. Any leftover
cells in the final band are simply left open, so the grid ends cleanly no matter
how many moments exist.

### Adding a photo to the gallery, step by step

A gallery moment is one Markdown file plus, optionally, one co-located image.
The archive re-packs itself at build time, so there is nothing else to wire up.

1. **Get a web-ready image.** Astro's image pipeline cannot read camera RAW
   (`.ARW`, `.NEF`, `.CR2`, ...), and you don't want a 24 MB original in the
   repo. Convert to a JPG about 2400 px on the long edge (the grid never renders
   wider than ~960 px, and Astro emits the responsive `srcset` from your source):

   ```bash
   # macOS: sips reads Sony/Nikon/Canon RAW via the system decoder
   sips -s format jpeg -s formatOptions 82 -Z 2400 IMG_1234.ARW --out bougainvillea.jpg
   ```

2. **Fix the orientation tag.** RAW-to-JPG conversion often leaves an EXIF
   orientation tag that Astro (libvips) honors, which can silently rotate a
   landscape shot into a sideways portrait once it lands in the grid. Check it,
   then correct:

   ```bash
   magick identify -format '%wx%h  orientation=%[orientation]\n' bougainvillea.jpg
   ```

   - If the image looks correct in Preview but orientation is not `TopLeft` /
     `Undefined`, the tag is bogus: drop it without rotating pixels with
     `magick bougainvillea.jpg -strip bougainvillea.jpg`.
   - If the image itself looks rotated, rotate then strip with
     `magick bougainvillea.jpg -auto-orient -strip bougainvillea.jpg`.

   Re-run `identify` and confirm the dimensions read upright (e.g. `2400x1600`
   for a landscape frame).

3. **Drop the image into the collection folder**, next to the entries:
   `src/content/photography/bougainvillea.jpg`. Keep the RAW/original out of the
   repo (it is large and unused).

4. **Add the Markdown entry** `src/content/photography/<NN-slug>.md` (the `NN`
   prefix just keeps the folder tidy; real ordering comes from `order`). Point
   `image:` at the file and set `ratio:` to the frame's real aspect so it is not
   cropped:

   ```markdown
   ---
   title: Bougainvillea
   kind: photo            # photo | video
   date: 2025-06-08
   story: The one line shown in the lightbox detail panel.
   location: Brainerd, MN
   camera: Sony a6400
   lens: 70-200mm f/2.8
   iso: "100"
   aperture: f/8
   focal: 200mm
   image: ./bougainvillea.jpg
   ratio: 3/2             # must match the image; 3/4, 2/3, 9/16 render as talls
   feature: false         # true = oversized 2x2 lead (landscape only)
   order: 2               # lower = earlier in the archive
   ---
   ```

   Only `title`, `date`, `ratio`, and `order` really matter; the rest is
   optional (omit `image` entirely and an on-brand placeholder renders). Every
   field and its type is defined in `src/content.config.ts`.

5. **Restart `npm run dev`.** Adding a new image or a new `image:` field is a
   content-collection change the dev server does not reliably hot-reload: if a
   photo doesn't appear, stop and restart the server (a stale dev server keeps
   serving the old content). `npm run build` always reflects the current files.

For a `kind: video` moment, skip the image steps: put a `clip.webm` + `clip.mp4`
pair in `public/videos/` and set `video: /videos/clip.mp4` instead of `image`
(see **Videos** below).

### Videos: ship webm + mp4 pairs

Every clip in `public/videos/` must be provided as **two files with the same
basename**, e.g. `clip.webm` and `clip.mp4`. The `.webm` is listed first and
tried first: Firefox on macOS can fail its H.264 decoder (especially after a
`ClientRouter` navigation), and `src/scripts/footage.ts` rebuilds the video
element on each swap so the software-decoded webm keeps background/title clips
playing. Reference the `.mp4` path in frontmatter (`video: /videos/clip.mp4`,
`heroVideo: /videos/clip.mp4`); the webm sibling is derived automatically.

### Real images

`cover` / `image` are optional - until set, on-brand placeholders render. To add
a real image, drop it next to the content file and reference it, e.g.
`cover: ./front-wing.jpg`. Astro's `astro:assets` then optimizes it (WebP,
responsive `srcset`) automatically. Same prep as the gallery steps above applies
to any real image: convert RAW / oversized originals to a ~2400 px JPG and strip
a stray EXIF orientation tag first, or the entry-title image can render rotated.

On entry pages the title is drawn over a full-bleed image (home-hero style,
minus the video). It uses `hero:` if set, otherwise falls back to `cover:`;
when only `cover` exists it moves up into the header instead of repeating as
the lead figure. Wide, darker shots work best.

## Things to personalize

- `src/config/site.ts` - name, tagline, **positions**, social links, email.
- `public/resume.pdf` - replace the placeholder with your real resume.
- `public/og-default.png` - regenerate if branding changes.
- `astro.config.mjs` - set `site` to your real production domain.
- `src/config/timeline.ts` - **every moment on /timeline is a realistic
  placeholder.** Edit titles, dates, and `why` blurbs to your real history, and
  point each `media.src` at real photos/videos under `public/` (e.g.
  `/timeline/first-drive.jpg`). The spine layout adapts automatically.

## Deploy

Automatic via **GitHub Actions to GitHub Pages** (`.github/workflows/deploy.yml`):
every push to `main` rebuilds and redeploys. Served from the custom domain
**calebpollreis.com** (`public/CNAME`); `site` in `astro.config.mjs` must match so
the sitemap and canonical/OG URLs are correct. The static `dist/` output also
deploys anywhere else (Vercel, Netlify, any static host) if needed.
