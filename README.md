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
off-screen; every tile (photo or video) still opens the lightbox. Leftover
cells in the final band are filled by an auto-computed index tile, so the grid
always closes cleanly no matter how many moments exist.

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
`cover: ./front-wing.jpg`. Astro's `astro:assets` then optimizes it
(AVIF/WebP, responsive `srcset`) automatically.

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
