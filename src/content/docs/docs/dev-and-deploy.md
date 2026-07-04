---
title: Local dev and deploy
description: The dev and build commands, the GitHub Actions pipeline, and the custom-domain setup.
---

## Local development

```bash
npm install        # once, to install dependencies
npm run dev        # dev server at http://localhost:4321
npm run build      # astro check + static build into dist/
npm run preview    # serve the production build locally
```

- `npm run dev` gives you hot reload while editing content or components.
- `npm run build` runs `astro check` (type-checking and content-schema
  validation) before `astro build`. A failing build usually means a content file
  has a bad frontmatter field: read the error, it names the file and the field.
- `npm run preview` serves the built `dist/` exactly as it will be deployed, which
  is the best final check before pushing.

## How deploys happen

Deployment is automatic through GitHub Actions. The workflow lives at
`.github/workflows/deploy.yml`:

- It triggers on every push to the `main` branch (and can be run manually via
  `workflow_dispatch`).
- The `build` job uses the official `withastro/action` to install, build, and
  upload the static site as a Pages artifact.
- The `deploy` job publishes that artifact to GitHub Pages with
  `actions/deploy-pages`.

So the publish flow is: commit your content change, push (or merge a PR) to
`main`, and the site rebuilds and redeploys on its own. Watch the run in the
repository's Actions tab if you want to confirm it succeeded.

## Custom domain

The site is served from `calebpollreis.com`:

- `public/CNAME` carries the custom domain so GitHub Pages keeps it configured on
  each deploy. Do not delete it.
- `site: 'https://calebpollreis.com'` in `astro.config.mjs` makes the generated
  sitemap and the canonical/OG URLs use the real domain. Keep the two in sync if
  the domain ever changes.
- There is no configured `base`, so the site serves from the domain root. In-site
  links still pass through `withBase()` (`src/config/paths.ts`), so the site would
  keep working if it were ever moved to a subpath.

## These docs

The documentation you are reading is built by the `@astrojs/starlight`
integration and served under `/docs`. The pages live in
`src/content/docs/docs/` and the sidebar is configured in `astro.config.mjs`. They
build and deploy together with the rest of the site, so editing a doc is just
another content change: edit, push to `main`, done.
