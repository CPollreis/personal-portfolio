import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

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
 * Photography — one markdown entry per frame. `image` stays optional so the
 * gallery renders on-brand placeholders until real photos (co-located, then
 * referenced via `image: ./frame.jpg`) are dropped in and optimized by
 * astro:assets.
 */
const photography = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/photography' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      location: z.string().optional(),
      camera: z.string().optional(),
      lens: z.string().optional(),
      /** e.g. "35mm · f/1.8 · 1/500s · ISO 200" */
      settings: z.string().optional(),
      /** e.g. "44.97°N 93.23°W" */
      coords: z.string().optional(),
      image: image().optional(),
      ratio: z.enum(['1/1', '4/3', '3/4', '3/2', '2/3', '16/9']).default('3/2'),
      order: z.number().default(99),
    }),
});

export const collections = { fsae, projects, photography };
