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

export const collections = { fsae, projects };
