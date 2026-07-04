// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages project site. When the custom domain lands, set `site` to the
  // domain (e.g. 'https://calebpollreis.com') and remove `base` entirely.
  site: 'https://cpollreis.github.io',
  base: '/personal-portfolio',
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
