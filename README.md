# Caleb Pollreis - Portfolio

Personal portfolio built with Astro. Live at **https://calebpollreis.com**.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:4321
```

Other commands: `npm run build` (type-check + static build to `dist/`),
`npm run preview` (serve the build).

## Adding Content

Every kind of entry is **one file** inside `src/content/`. The home
Build log feed and the photography grid rearrange themselves at build time. Restart `npm run dev` after adding a new
file or image (the content collections do not always reload automatically).

| To add a... | Create | Appears in |
| --- | --- | --- |
| FSAE build-log post | `src/content/fsae/<slug>.mdx` | Home Build log feed + `/fsae/<slug>` |
| Project | `src/content/projects/<slug>.mdx` | Home Build log feed + `/projects/<slug>` |
| Photo / film moment | `src/content/photography/<NN-slug>.md` | `/photography` grid |
| Position / affiliation | a row in `positions[]` in `src/config/site.ts` | Under the name in the hero |

Each file's frontmatter fields (and which are required) are defined in
`src/content.config.ts`. For images, add the file next to the entry and
reference it (`cover: ./front-wing.jpg` or `image: ./frame.jpg`); Astro
optimizes it automatically. For videos, put a matching `clip.webm` + `clip.mp4`
pair in `public/videos/` and reference the `.mp4` path.

## Implementation Details
Refer to the startlight documentation here https://calebpollreis.com/docs or the source for the documentation page under
`src/content/docs/`.

## Deploy

Every push to `main` rebuilds and redeploys via GitHub Actions to GitHub Pages
(`.github/workflows/deploy.yml`).
