// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://calebpollreis.com',
  integrations: [
    react(),
    // Starlight injects astro-expressive-code, which must be registered before
    // mdx(), so it is listed ahead of mdx() here.
    // Docs live under /docs (every entry sits in src/content/docs/docs/, so its
    // Starlight slug starts with `docs/` and never collides with the portfolio
    // pages). The portfolio keeps its own 404, so Starlight's is disabled.
    starlight({
      title: 'calebpollreis.com docs',
      description: 'How this portfolio is built and how to add content to it.',
      disable404Route: true,
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/CPollreis' },
      ],
      sidebar: [
        { label: 'Overview', slug: 'docs' },
        { label: 'Architecture', slug: 'docs/architecture' },
        { label: 'Content collections', slug: 'docs/content-collections' },
        { label: 'Adding content', slug: 'docs/adding-content' },
        { label: 'Media guidelines', slug: 'docs/media' },
        { label: 'Local dev and deploy', slug: 'docs/dev-and-deploy' },
      ],
    }),
    mdx(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
