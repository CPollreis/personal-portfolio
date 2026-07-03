/**
 * Film-toned placeholder backdrops for moments without a real asset yet.
 * Deterministic per seed so the Astro tile and the React lightbox render the
 * identical "frame", which keeps the shared-element zoom seamless.
 * Palette leans warm (orange, crimson, gold) with a few cool and silver
 * frames mixed in, matching the reference's colour rhythm.
 */

interface Variant {
  /** Primary glow colour */
  glow: string;
  /** Secondary, dimmer wash from the opposite corner */
  wash: string;
  /** Deep base tone */
  base: string;
}

const VARIANTS: Variant[] = [
  { glow: 'rgba(224, 108, 42, 0.62)', wash: 'rgba(122, 38, 16, 0.45)', base: '#140b06' }, // ember
  { glow: 'rgba(96, 116, 134, 0.5)', wash: 'rgba(28, 34, 44, 0.6)', base: '#0a0c0f' },    // silver / bw
  { glow: 'rgba(179, 44, 43, 0.55)', wash: 'rgba(70, 14, 24, 0.5)', base: '#10060a' },    // crimson
  { glow: 'rgba(214, 158, 62, 0.55)', wash: 'rgba(110, 66, 20, 0.42)', base: '#120c05' }, // gold
  { glow: 'rgba(46, 108, 116, 0.5)', wash: 'rgba(16, 42, 52, 0.55)', base: '#060c0e' },   // teal night
  { glow: 'rgba(146, 84, 128, 0.48)', wash: 'rgba(52, 26, 60, 0.5)', base: '#0d070f' },   // dusk violet
];

/** CSS `background` shorthand value for a given seed. */
export function momentBackdrop(seed: number): string {
  const v = VARIANTS[seed % VARIANTS.length];
  // Drift the light source around per seed so a grid never repeats exactly.
  const gx = 18 + ((seed * 37) % 55);
  const gy = 16 + ((seed * 53) % 42);
  return [
    `radial-gradient(120% 95% at ${gx}% ${gy}%, ${v.glow}, transparent 62%)`,
    `radial-gradient(110% 90% at ${100 - gx}% ${100 - gy}%, ${v.wash}, transparent 68%)`,
    `radial-gradient(140% 130% at 50% 50%, transparent 52%, rgba(0, 0, 0, 0.6) 100%)`,
    `linear-gradient(180deg, ${v.base}, #060505)`,
  ].join(', ');
}
