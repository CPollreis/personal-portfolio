# Caleb Pollreis - Portfolio

A fast, static personal portfolio with a high-tech engineering-HUD aesthetic:
OLED-monochrome base, a blue→cyan→indigo accent triad, animated micrographics,
and anime.js motion. Built with **Astro + React islands**.

## Stack

- **Astro** (static output) · **React** islands (photography lightbox only)
- **Tailwind CSS v4** + CSS-variable design tokens (`src/styles/global.css`)
- **anime.js v4** via a single shared motion engine (`src/scripts/motion.ts`)
- **MDX content collections** (`src/content.config.ts`)
- Self-hosted variable fonts: Space Grotesk / Inter / JetBrains Mono

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # astro check + static build → dist/
npm run preview    # serve the production build
```

## Adding content

All content is git-tracked MDX/Markdown under `src/content/`.

- **FSAE build log** - add `src/content/fsae/<slug>.mdx`. Frontmatter:
  `title, date, subsystem (firmware|manufacturing|autonomous), season, summary,
  tags, cover?, video?`. Body is MDX; use `<Gallery>` / `<VideoEmbed>`.
- **Projects** - add `src/content/projects/<slug>.mdx`. Frontmatter:
  `title, date, kind, stack[], summary, order, featured, links{repo,demo}, cover?, video?`.
- **Photography** - add `src/content/photography/<slug>.md` with EXIF frontmatter
  (`title, date, location, camera, lens, settings, coords?, ratio, order`).

### Real images

`cover` / `image` are optional - until set, on-brand placeholders render. To add
a real image, drop it next to the content file and reference it, e.g.
`cover: ./front-wing.jpg`. Astro's `astro:assets` then optimizes it
(AVIF/WebP, responsive `srcset`) automatically.

## Things to personalize

- `src/config/site.ts` - name, role, tagline, **social links**, email.
- `public/videos/hero-loop.mp4` - drop in the looping clip of the car for the
  home hero background (H.264 MP4, muted; ~10-30s, compressed for web). Until
  it exists the hero background is simply black.
- `public/resume.pdf` - replace the placeholder with your real résumé.
- `public/og-default.png` - regenerate if branding changes.
- `astro.config.mjs` - set `site` to your real production domain.
- Portrait on the About page (`src/pages/about.astro`) - swap the placeholder.

## Deploy

Static output in `dist/` - deploys anywhere. Zero-config on **Vercel** or
**Netlify** (both auto-detect Astro): connect the repo and deploy. Set the
production domain in `astro.config.mjs` first so the sitemap and canonical/OG
URLs are correct.
