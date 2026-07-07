---
title: Overview
description: How this portfolio is built and how to add content to it.
---

This is the maintenance manual for [calebpollreis.com](https://calebpollreis.com),
a static personal portfolio built with Astro and a few React islands. It exists
so that adding a build log, a project, or a new photo is a quick, repeatable
edit instead of an archaeology session.

## What the site is

- A statically generated Astro site (no server at runtime, just files in `dist/`).
- A one-pager: `/` carries the bio and the FSAE / Projects / Photography /
  Timeline sections; writeups, the gallery, and the timeline are satellite
  pages linked from their sections.
- Content lives in Markdown and MDX under `src/content/`, validated by typed
  schemas in `src/content.config.ts`.
- The visual language is an engineering-HUD look: OLED-black base, a
  blue to cyan to indigo accent triad, self-hosted variable fonts, and motion
  driven by a single shared anime.js engine.
- One React island (the photography lightbox). Everything else is Astro and plain
  HTML shipped with zero per-page JavaScript beyond the shared scripts.
- Deployed by GitHub Actions to GitHub Pages, served from the custom domain
  `calebpollreis.com`.

## Where to go next

- [Architecture](/docs/architecture): how pages, layouts, islands, tokens,
  motion, and the background-video keeper (`footage.ts`) fit together.
- [Content collections](/docs/content-collections): every frontmatter field for
  FSAE posts, projects, and photography moments, with worked examples.
- [Adding content](/docs/adding-content): the one-file rule, plus step-by-step
  recipes for a new build log, project, photo, video moment, timeline event,
  and position.
- [Media guidelines](/docs/media): where images and videos live, the webm plus
  mp4 pairing rule, and how to swap the resume, favicon, and OG image.
- [Local dev and deploy](/docs/dev-and-deploy): the dev and build commands, the
  GitHub Actions pipeline, and the custom-domain setup.

## Conventions

- No em dashes anywhere in site copy. Use commas, colons, or parentheses instead.
- Root-absolute in-site links pass through `withBase()` (`src/config/paths.ts`)
  so they keep working if the site ever moves to a subpath.
- Copy that appears in more than one place (name, role, tagline, socials, email)
  lives once in `src/config/site.ts`.
