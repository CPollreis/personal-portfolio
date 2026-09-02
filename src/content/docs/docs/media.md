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

## Full-resolution originals (photography lightbox)

Grid and mosaic thumbnails use the co-located `image` and go through
`astro:assets` as above. The lightbox "large view" and "Download original" link
are served from a **GitHub Release** instead, so multi-megabyte originals never
enter `dist/` or git history. See `research-image-hosting/` for why.

Adding a photo with a full-res original:

1. Co-locate the small version next to the entry and set `image: ./frame.jpg` as
   usual. Keep it reasonably sized; the build caps rendered widths anyway.
2. Put the original in a local folder and run:

   ```sh
   node scripts/publish-assets.mjs --dir ~/path/to/originals
   ```

   This uploads each file to the `photo-assets` Release and records its URL,
   pixel size, and EXIF (date, ISO, aperture, shutter, camera, lens, focal
   length) in `src/data/asset-manifest.json`, rolling to `photo-assets-2` when a
   release fills up. Re-runs skip files whose contents are unchanged. Add
   `--dry-run` to preview.
3. Set `full:` on the entry to the manifest key the script printed, for example:

   ```yaml
   image: ./frame.jpg
   full: photography/DSC07080
   ```

4. Commit the `asset-manifest.json` change together with the entry. The build
   fails loudly if a `full:` key is missing from the manifest.

Notes:

- The exposure readout (date, ISO, aperture, shutter, camera, lens, focal
  length) comes from the manifest EXIF for entries that set `full:`, otherwise
  from the co-located `image` file's EXIF, read at build time. Any value written
  explicitly in frontmatter still wins over both. So the readout no longer
  depends on the small co-located export keeping its EXIF.
- `astro:assets` strips EXIF and the ICC profile from the built grid thumbnails.
  That is cosmetic here: nothing reads EXIF off the delivered thumbnail, and the
  "Download original" link serves the untouched Release asset with everything
  intact. Convert Display-P3 / Adobe RGB exports to sRGB before import so the
  thumbnail colour matches.
- The large view is delivered through [wsrv.nl](https://wsrv.nl) for on-the-fly
  resize, `output=webp` only (wsrv returns 400 for `output=avif`). No AVIF on
  this path; the in-repo grid still gets AVIF.
- wsrv strips ICC/EXIF but auto-rotates, matching the current `astro:assets`
  behaviour, so it is colour-neutral, not a regression.
- Release deep links break if the repo or account is renamed. The manifest makes
  that a find-and-replace, but it is a manual step.

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

The home hero uses the stabilized pair `public/videos/hero-loop-stab-web.webm`
and `.mp4` (referenced directly in `index.astro`, not through frontmatter);
`hero-loop-web.*` is the unstabilized source. Until a hero clip exists the home
background is simply black.

## Swapping the standalone assets

These live at the root of `public/` and are replaced by overwriting the file
(keep the same filename so references keep resolving):

- **Resume**: `public/resume.pdf`. Drop a new PDF at that exact path to swap it; the link is `site.resume` in `src/config/site.ts`.
- **Favicon**: `public/favicon.svg`, linked from `src/layouts/Base.astro`
  (`<link rel="icon" type="image/svg+xml" ...>`). Keep it an SVG or update the
  link tag if you change formats.
- **Open Graph image**: `public/og-victory.png`, the default social-share image
  used by `src/components/Seo.astro`. Regenerate it if the branding changes; keep
  it around 1200x630. If you replace it, give the file a new name and update the
  `image` default in `Seo.astro` so caches on Discord, Slack, and iMessage are
  forced to refetch.
- **robots.txt**: `public/robots.txt` if crawl rules need to change.

## Site copy and config

Text shown across pages (name, role, tagline, intro, availability, email, social
links, nav) lives once in `src/config/site.ts`. Edit it there rather than in
individual components. `astro.config.mjs` holds `site` (the production domain used
for the sitemap and canonical/OG URLs).
