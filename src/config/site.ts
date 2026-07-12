/**
 * Single source of truth for site-wide metadata, navigation, socials, and
 * the "current positions" list on the home page. When something about you
 * changes (new role, new availability window, new link), edit it here and
 * nowhere else.
 */
import { withBase } from './paths';

export const site = {
  name: 'Caleb Pollreis',
  role: 'Autonomous Systems Lead · FSAE Electric',
  tagline: 'Building the systems to make a race car drive itself.',
  /** Plain-English one-liner for people who don't know what FSAE is. */
  intro:
    'Computer engineering student at the University of Manitoba, leading a 10-person team building the driverless system for our Formula SAE electric race car. Target: autonomous by 2028.',
  availability: 'Open to internships · Jan to Aug 2027',
  description:
    'Caleb Pollreis, computer engineering student at the University of Manitoba and FSAE Electric autonomous systems lead. Firmware, HV accumulator work, driverless autonomy, personal projects, and photography.',
  url: 'https://calebpollreis.com',
  locale: 'en',
  email: 'calebpollreis@gmail.com',
  resume: '/resume.pdf',
} as const;

/**
 * Current positions, newest first. These render verbatim at the top of the
 * home page; append or edit rows here as things change.
 */
export interface Position {
  role: string;
  org: string;
  /** Short qualifier shown after the org (dates, class year, target). */
  note?: string;
  /** Where the row links (in-page anchor or external URL). */
  href?: string;
}

export const positions: Position[] = [
  {
    role: 'Autonomous Systems Lead',
    org: 'UMSAE Formula Electric',
    href: '#fsae',
  },
  {
    role: 'B.Sc. Computer Engineering, Co-op',
    org: 'University of Manitoba',
    note: 'Class of 2028',
  },
];

export interface NavItem {
  label: string;
  href: string;
  /** Short mono index shown in the HUD (e.g. 01). */
  index: string;
}

/** Top bar: wordmark only. Every section is reachable from the one-page home
   (hero buttons + the photography preview card) and the footer index. */
export const nav: NavItem[] = [];

/** Full section index, used by the footer. */
export const sections: NavItem[] = [
  { label: 'Home', href: '/', index: '00' },
  { label: 'About', href: '/#about', index: '01' },
  { label: 'FSAE', href: '/#fsae', index: '02' },
  { label: 'Photography', href: '/photography', index: '03' },
  { label: 'Timeline', href: '/timeline', index: '04' },
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
 * Home only matches exactly; other routes match their prefix. Anchor hrefs
 * (/#section) never report active; section highlighting is not tracked.
 */
export function isActive(href: string, pathname: string): boolean {
  if (href.includes('#')) return false;
  // pathname includes the base at build time, so compare against base-prefixed hrefs.
  const clean = pathname.replace(/\/+$/, '') || '/';
  const target = withBase(href).replace(/\/+$/, '') || '/';
  const home = withBase('/').replace(/\/+$/, '') || '/';
  if (target === home) return clean === home;
  return clean === target || clean.startsWith(target + '/');
}
