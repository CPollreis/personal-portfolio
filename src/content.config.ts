import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

/** Starlight documentation (src/content/docs/), served under /docs. */
const docs = defineCollection({ loader: docsLoader(), schema: docsSchema() });

/**
 * FSAE build-log posts. subsystem drives color-coding across the site
 * (firmware → blue, manufacturing → cyan, autonomous → indigo).
 */
const fsae = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/fsae' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      subsystem: z.enum(['firmware', 'manufacturing', 'autonomous']),
      season: z.string().optional(),
      summary: z.string(),
      cover: image().optional(),
      /** Full-bleed image behind the entry title (falls back to `cover`). */
      hero: image().optional(),
      /** Full-bleed looping clip behind the entry title (public/ path, e.g. '/videos/clip.mp4'); wins over `hero`/`cover`. */
      heroVideo: z.string().optional(),
      tags: z.array(z.string()).default([]),
      /** Optional YouTube/Vimeo URL rendered as an embed in the post header. */
      video: z.url().optional(),
      draft: z.boolean().default(false),
    }),
});

/** Personal projects. */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      kind: z.string(),
      stack: z.array(z.string()).default([]),
      summary: z.string(),
      cover: image().optional(),
      /** Full-bleed image behind the entry title (falls back to `cover`). */
      hero: image().optional(),
      /** Full-bleed looping clip behind the entry title (public/ path, e.g. '/videos/clip.mp4'); wins over `hero`/`cover`. */
      heroVideo: z.string().optional(),
      /** Optional demo video (YouTube/Vimeo) shown as the lead media. */
      video: z.url().optional(),
      links: z
        .object({
          repo: z.url().optional(),
          demo: z.url().optional(),
        })
        .default({}),
      order: z.number().default(99),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

/**
 * Photography - one markdown entry per moment (photo or video). `image` stays
 * optional so the gallery renders film-toned placeholders until real assets
 * (co-located, then referenced via `image: ./frame.jpg`) are dropped in and
 * optimized by astro:assets. The markdown body is unused; `story` carries the
 * personal caption shown in the lightbox.
 */
const photography = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/photography' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      kind: z.enum(['photo', 'video']).default('photo'),
      date: z.coerce.date(),
      /** Why this moment matters. Shown in the lightbox detail panel. */
      story: z.string().optional(),
      location: z.string().optional(),
      camera: z.string().optional(),
      lens: z.string().optional(),
      /* Photo tech readout */
      iso: z.string().optional(),
      aperture: z.string().optional(),
      focal: z.string().optional(),
      /* Video tech readout */
      fps: z.string().optional(),
      quality: z.string().optional(),
      image: image().optional(),
      /** Looping clip for `kind: video` moments (public/ path, e.g. '/videos/clip.mp4'). A co-hosted .webm sibling is tried first for Firefox. */
      video: z.string().optional(),
      ratio: z.enum(['1/1', '4/3', '3/4', '3/2', '2/3', '16/9', '9/16']).default('3/2'),
      /** Renders as an oversized 2x2 lead in the archive grid (landscape
          crop, so it has no effect on vertical ratios). */
      feature: z.boolean().default(false),
      order: z.number().default(99),
    }),
});

export const collections = { fsae, projects, photography, docs };
