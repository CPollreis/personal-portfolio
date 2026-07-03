/**
 * Single source of truth for site-wide metadata, navigation, and socials.
 * Keep copy edits here rather than scattered across components.
 */

export const site = {
  name: 'Caleb Pollreis',
  role: 'Autonomous Systems Lead · FSAE Electric',
  tagline: 'Building the systems to make a race car drive itself.',
  /** Plain-English one-liner for people who don't know what FSAE is. */
  intro:
    'Computer engineering student at the University of Manitoba, leading a 10-person team building the driverless system for our Formula SAE electric race car. Target: autonomous by 2028.',
  availability: 'Open to internships · Jan to Aug 2027',
  description:
    'Portfolio of Caleb Pollreis, computer engineering student at the University of Manitoba and FSAE Electric autonomous systems lead. Firmware, HV accumulator work, driverless autonomy, personal projects, and photography.',
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
  { label: 'Timeline', href: '/timeline', index: '05' },
];

export interface SocialLink {
  label: string;
  href: string;
}

export const socials: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/CPollreis' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/caleb-pollreis-b815642a6' },
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
