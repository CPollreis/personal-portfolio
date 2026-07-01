/**
 * Single source of truth for site-wide metadata, navigation, and socials.
 * Keep copy edits here rather than scattered across components.
 */

export const site = {
  name: 'Caleb Pollreis',
  role: 'Autonomous Systems Lead · FSAE Electric',
  tagline: 'Computer engineering student building autonomous race systems.',
  description:
    'Portfolio of Caleb Pollreis — computer engineering student and FSAE Electric autonomous systems lead. Firmware, manufacturing, autonomy, personal projects, and photography.',
  url: 'https://calebpollreis.com',
  locale: 'en',
  email: 'calebpollreis@gmail.com',
} as const;

export interface NavItem {
  label: string;
  href: string;
  /** Short mono index shown in the HUD (e.g. 01). */
  index: string;
}

export const nav: NavItem[] = [
  { label: 'Home', href: '/', index: '00' },
  { label: 'FSAE', href: '/fsae', index: '01' },
  { label: 'Projects', href: '/projects', index: '02' },
  { label: 'Photography', href: '/photography', index: '03' },
  { label: 'About', href: '/about', index: '04' },
];

export interface SocialLink {
  label: string;
  href: string;
}

export const socials: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
  { label: 'Email', href: `mailto:${site.email}` },
];

/**
 * Returns true when `href` is the active top-level route for `pathname`.
 * Home only matches exactly; other routes match their prefix.
 */
export function isActive(href: string, pathname: string): boolean {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (href === '/') return clean === '/';
  return clean === href || clean.startsWith(href + '/');
}
