---
title: Media guidelines
description: Where images and videos live, the webm plus mp4 pairing rule, and how to swap the resume, favicon, and OG image.
---

## Two kinds of asset

The site treats images and videos differently on purpose:

- **Images that belong to a content entry** are co-located with the Markdown/MDX
  file and referenced through an `image()` field (`cover`, `hero`, `image`).
  These go through `astro:assets`, which optimizes them at build time (AVIF/WebP,
  responsive `srcset`, hashed filenames).
- **Videos and any file referenced by a `public/` path** live under `public/`
  and are served as-is (no optimization, no hashing). This is where background
  clips, title videos, and the resume live.

## Content images

Drop the file next to the content file and reference it with a relative path:

```yaml
cover: ./front-wing.jpg
image: ./apex.jpg
```

Astro fingerprints and optimizes it automatically. Prefer wide, darker shots for
`hero`/`cover`, since the entry title is drawn over them. Leaving the field out
renders an on-brand placeholder, so partial content still looks intentional.

## Videos: the webm plus mp4 pairing rule

All videos live in `public/videos/`. Every clip must be shipped as **two files
with the same basename**:

- `name.webm` (VP9 or AV1)
- `name.mp4` (H.264)

The `.webm` is listed first in the `<source>` order and tried first. This is not
cosmetic: Firefox on macOS can fail its hardware H.264 decoder (especially after
a `ClientRouter` navigation), and the software webm path is what keeps background
video playing. `src/scripts/footage.ts` rebuilds the video element on each
navigation so the webm source is re-selected. See the `footage.ts` section of
[Architecture](/docs/architecture) for the full story.

Practical rules:

- Always ship the pair, even though the mp4 alone plays in most browsers.
- Keep the basenames identical (`clip.webm` and `clip.mp4`), because the webm
  path is derived from the mp4 path by swapping the extension.
- Reference the `.mp4` path in frontmatter (for example
  `video: /videos/clip.mp4`, `heroVideo: /videos/clip.mp4`).
- Keep clips muted, short (roughly 10 to 30 seconds for loops), and compressed
  for web. Full-bleed background/title clips should carry the
  `data-header-video` attribute so `footage.ts` manages them.

The existing home-hero clip is a good template for naming:
`public/videos/hero-loop-web.webm` and `public/videos/hero-loop-web.mp4`. Until a
hero clip exists the home background is simply black.

## Swapping the standalone assets

These live at the root of `public/` and are replaced by overwriting the file
(keep the same filename so references keep resolving):

- **Resume**: `public/resume.pdf`. Replace the placeholder with the real PDF.
- **Favicon**: `public/favicon.svg`, linked from `src/layouts/Base.astro`
  (`<link rel="icon" type="image/svg+xml" ...>`). Keep it an SVG or update the
  link tag if you change formats.
- **Open Graph image**: `public/og-default.png`, the default social-share image
  used by `src/components/Seo.astro`. Regenerate it if the branding changes; keep
  it around 1200x630.
- **robots.txt**: `public/robots.txt` if crawl rules need to change.

## Site copy and config

Text shown across pages (name, role, tagline, intro, availability, email, social
links, nav) lives once in `src/config/site.ts`. Edit it there rather than in
individual components. `astro.config.mjs` holds `site` (the production domain used
for the sitemap and canonical/OG URLs).
