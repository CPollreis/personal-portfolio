# Caleb Pollreis - Portfolio

Personal portfolio built with Astro. Live at **https://calebpollreis.com**.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:4321
```

Other commands: `npm run build` (type-check + static build to `dist/`),
`npm run preview` (serve the build).

## Add content

Every kind of entry is **one file** dropped into `src/content/`. The home
Build log feed and the photography grid re-pack themselves at build time, so
there is nothing else to wire up. Restart `npm run dev` after adding a new
file or image (the content collections do not always hot-reload).

| To add a... | Create | Shows up in |
| --- | --- | --- |
| FSAE build-log post | `src/content/fsae/<slug>.mdx` | Home Build log feed + `/fsae/<slug>` |
| Project | `src/content/projects/<slug>.mdx` | Home Build log feed + `/projects/<slug>` |
| Photo / film moment | `src/content/photography/<NN-slug>.md` | `/photography` grid |
| Position / affiliation | a row in `positions[]` in `src/config/site.ts` | Under the name in the hero |

Each file's frontmatter fields (and which are required) are defined in
`src/content.config.ts`. For real images, drop the file next to the entry and
reference it (`cover: ./front-wing.jpg` or `image: ./frame.jpg`); Astro
optimizes it automatically. For videos, put a matching `clip.webm` + `clip.mp4`
pair in `public/videos/` and reference the `.mp4` path.

**Full recipes** (image prep, EXIF orientation fixes, the photography grid,
adding a build-log filter, the deploy pipeline) live in the site's own docs:
`npm run dev` then open http://localhost:4321/docs, or read
https://calebpollreis.com/docs on the live site. Source is in
`src/content/docs/`.

## Personalize

- `src/config/site.ts` - name, tagline, positions, socials, email
- `public/resume.pdf` - overwrite to publish a new resume
- `astro.config.mjs` - `site` must match the production domain (also set in
  the repo's GitHub Pages settings)

## Deploy

Every push to `main` rebuilds and redeploys via GitHub Actions to GitHub Pages
(`.github/workflows/deploy.yml`).
