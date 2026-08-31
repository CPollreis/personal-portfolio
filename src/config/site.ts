import { withBase } from './paths';

export const site = {
  name: 'Caleb Pollreis',
  /** Title suffix on the home page. LinkedIn's Featured slot clips the title
     near 42 characters, so keep `name · role` under that. */
  role: 'Autonomous Systems Lead',
  tagline: 'Building the systems to make a race car drive itself.',
  /** Plain-English one-liner for people who don't know what FSAE is. */
  intro:
    'Computer engineering student at the University of Manitoba, leading a 10-person team building the driverless system for our Formula SAE electric race car. Target: autonomous by 2028.',
  availability: 'Open to internships · Jan to Aug 2027',
  /** Link-preview blurb. Front-loaded, because Featured and Discord both cut
     it off around 160 characters. */
  description:
    'Autonomous systems lead on a Formula SAE electric race car, perception intern at PTx Trimble. Firmware, driverless autonomy, and the photos from the paddock.',
  url: 'https://calebpollreis.com',
  locale: 'en',
  email: 'calebpollreis@gmail.com',
  resume: '/resume.pdf',
} as const;

/** Current positions, newest first. Rendered at the top of the home page; edit rows here. */
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
    org: 'FSAE Electric',
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

/** Top bar: wordmark only; every section is reachable from the home page and footer. */
export const nav: NavItem[] = [];

/** Full section index, used by the footer. */
export const sections: NavItem[] = [
  { label: 'Home', href: '/', index: '00' },
  { label: 'FSAE', href: '/#fsae', index: '01' },
  { label: 'Photography', href: '/#photography', index: '02' },
];

export interface SocialLink {
  label: string;
  href: string;
}

export const socials: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/CPollreis' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/caleb-pollreis/' },
  { label: 'Email', href: `mailto:${site.email}` },
];

/** True when `href` is the active top-level route for `pathname` (home matches exactly, others by prefix; anchors never match). */
export function isActive(href: string, pathname: string): boolean {
  if (href.includes('#')) return false;
  // pathname includes the base at build time, so compare against base-prefixed hrefs.
  const clean = pathname.replace(/\/+$/, '') || '/';
  const target = withBase(href).replace(/\/+$/, '') || '/';
  const home = withBase('/').replace(/\/+$/, '') || '/';
  if (target === home) return clean === home;
  return clean === target || clean.startsWith(target + '/');
}
