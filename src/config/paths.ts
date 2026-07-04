/**
 * withBase - prefix a root-absolute in-site path with Astro's configured
 * `base` so links and assets resolve when the site is served from a subpath
 * (e.g. GitHub Pages at /personal-portfolio/). External URLs, anchors,
 * mailto:, and data: URIs are passed through untouched.
 *
 * import.meta.env.BASE_URL is the base with a trailing slash ('/' when no
 * base is configured), so we trim it before joining to avoid a double slash.
 */
export function withBase(path: string): string {
  if (!path.startsWith('/')) return path;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
}
