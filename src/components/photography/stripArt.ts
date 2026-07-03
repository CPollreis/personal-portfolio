/**
 * Scenic SVG placeholder art for the hero filmstrip. Each moment gets a tiny
 * hand-drawn scene (data URI) so the strip reads as real photography instead
 * of flat gradients, until actual assets land. Purely decorative: the strip
 * is aria-hidden and non-interactive.
 */

const W = 600;
const H = 400;

/** Deterministic pseudo-random star/spark field. */
function specks(n: number, seed: number, color: string, yMin = 0, yMax = H * 0.7): string {
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = ((seed * 131 + i * 197) % 991) / 991 * W;
    const y = yMin + (((seed * 89 + i * 311) % 613) / 613) * (yMax - yMin);
    const r = 0.6 + (((seed + i) * 37) % 10) / 8;
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${color}"/>`;
  }
  return out;
}

const wrap = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${body}</svg>`;

const SCENES: string[] = [
  // 00 Green Over Superior - aurora over dark water
  wrap(`<rect width="${W}" height="${H}" fill="#04101c"/>
    ${specks(40, 1, '#cfe8ff')}
    <g filter="url(#b)"><path d="M-20 210 C 120 60, 240 190, 380 70 C 470 -10, 560 120, 640 40 L 640 240 C 500 180, 380 260, 240 200 C 140 160, 40 260, -20 230 Z" fill="#2fbf71" opacity="0.5"/>
    <path d="M-20 150 C 140 30, 300 150, 460 40 L 640 90 L 640 160 C 460 120, 300 220, 120 170 Z" fill="#59e3a7" opacity="0.35"/></g>
    <rect y="300" width="${W}" height="100" fill="#020a12"/>
    <rect y="298" width="${W}" height="6" fill="#0e2f2a" opacity="0.8"/>
    <defs><filter id="b"><feGaussianBlur stdDeviation="14"/></filter></defs>`),
  // 01 Apex - panned racetrack streaks
  wrap(`<defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d2a1a"/><stop offset="0.45" stop-color="#1a1410"/><stop offset="1" stop-color="#0a0a0c"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#g1)"/>
    <g opacity="0.75"><rect x="-40" y="150" width="700" height="8" fill="#5a5a60" transform="skewY(-2)"/>
    <rect x="-40" y="196" width="700" height="14" fill="#71716f" transform="skewY(-2)"/>
    <rect x="-40" y="252" width="700" height="20" fill="#3c3c40" transform="skewY(-2)"/>
    <rect x="-40" y="316" width="700" height="30" fill="#2b2b2e" transform="skewY(-2)"/></g>
    <rect x="150" y="180" width="300" height="70" rx="18" fill="#1e3a8a"/>
    <rect x="130" y="196" width="70" height="34" rx="14" fill="#12244f"/>
    <g opacity="0.5"><rect x="0" y="188" width="140" height="5" fill="#e8e8e8"/><rect x="460" y="212" width="150" height="5" fill="#cfcfcf"/></g>`),
  // 02 Bonfire Physics - sparks over a lake fire
  wrap(`<rect width="${W}" height="${H}" fill="#0b0604"/>
    <ellipse cx="300" cy="360" rx="280" ry="120" fill="#2a130a"/>
    <ellipse cx="300" cy="345" rx="120" ry="60" fill="#7a2f10"/>
    <ellipse cx="300" cy="335" rx="60" ry="38" fill="#e06c2a"/>
    <ellipse cx="300" cy="328" rx="26" ry="20" fill="#ffc46b"/>
    ${specks(26, 7, '#ffb35c', 60, 300)}
    <g fill="#050302"><ellipse cx="120" cy="392" rx="70" ry="26"/><ellipse cx="470" cy="396" rx="80" ry="26"/></g>`),
  // 03 Front Row - stage beams and crowd
  wrap(`<rect width="${W}" height="${H}" fill="#0c0512"/>
    <g opacity="0.55"><polygon points="180,0 260,0 90,400 10,400" fill="#a24bd8"/>
    <polygon points="330,0 410,0 590,400 470,400" fill="#d84b98"/>
    <polygon points="270,0 330,0 340,400 240,400" fill="#5b4bd8" opacity="0.8"/></g>
    <circle cx="300" cy="40" r="26" fill="#f5ecff" opacity="0.9"/>
    <g fill="#040108"><ellipse cx="60" cy="410" rx="70" ry="60"/><ellipse cx="180" cy="418" rx="80" ry="66"/><ellipse cx="320" cy="412" rx="76" ry="62"/><ellipse cx="450" cy="418" rx="82" ry="66"/><ellipse cx="560" cy="410" rx="70" ry="58"/></g>`),
  // 04 Golden Hour Laps - sunset over a circuit
  wrap(`<defs><linearGradient id="g4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0a24b"/><stop offset="0.5" stop-color="#c95f2a"/><stop offset="1" stop-color="#3a1a10"/></linearGradient></defs>
    <rect width="${W}" height="260" fill="url(#g4)"/>
    <circle cx="300" cy="230" r="55" fill="#ffdf9e"/>
    <rect y="250" width="${W}" height="150" fill="#170d08"/>
    <path d="M0 330 C 150 300, 250 360, 400 330 S 560 300, 600 320 L 600 400 L 0 400 Z" fill="#26262a"/>
    <path d="M0 336 C 150 306, 250 366, 400 336" stroke="#e8b25c" stroke-width="3" fill="none" stroke-dasharray="16 14" opacity="0.7"/>`),
  // 05 Two Lane Summer - straight road to the horizon
  wrap(`<defs><linearGradient id="g5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb0d8"/><stop offset="0.55" stop-color="#e8c37a"/><stop offset="0.62" stop-color="#b98a4e"/></linearGradient></defs>
    <rect width="${W}" height="248" fill="url(#g5)"/>
    <rect y="248" width="${W}" height="152" fill="#6d5a36"/>
    <polygon points="260,248 340,248 520,400 80,400" fill="#33322f"/>
    <polygon points="297,248 303,248 312,400 288,400" fill="#e8dfc4"/>
    <circle cx="470" cy="70" r="34" fill="#fff3cf" opacity="0.9"/>`),
  // 06 Half the Sky - milky way over a tent
  wrap(`<rect width="${W}" height="${H}" fill="#050a18"/>
    ${specks(90, 3, '#dfe9ff')}
    <g filter="url(#b6)"><path d="M80 400 L 380 -40 L 500 -40 L 200 400 Z" fill="#8fa8d8" opacity="0.22"/></g>
    <rect y="330" width="${W}" height="70" fill="#04060a"/>
    <polygon points="260,392 310,318 360,392" fill="#1c2438"/>
    <polygon points="296,392 310,338 324,392" fill="#e8b25c" opacity="0.85"/>
    <defs><filter id="b6"><feGaussianBlur stdDeviation="10"/></filter></defs>`),
  // 07 Rooftop, Midnight - fireworks over a skyline
  wrap(`<rect width="${W}" height="${H}" fill="#060a16"/>
    <g stroke="#ffd27a" stroke-width="2" opacity="0.9">${[0, 30, 60, 90, 120, 150].map((a) => `<line x1="180" y1="120" x2="${180 + 52 * Math.cos((a * Math.PI) / 180)}" y2="${120 + 52 * Math.sin((a * Math.PI) / 180)}"/><line x1="180" y1="120" x2="${180 - 52 * Math.cos((a * Math.PI) / 180)}" y2="${120 - 52 * Math.sin((a * Math.PI) / 180)}"/>`).join('')}</g>
    <g stroke="#7ab8ff" stroke-width="2" opacity="0.8">${[15, 45, 75, 105, 135, 165].map((a) => `<line x1="430" y1="90" x2="${430 + 40 * Math.cos((a * Math.PI) / 180)}" y2="${90 + 40 * Math.sin((a * Math.PI) / 180)}"/><line x1="430" y1="90" x2="${430 - 40 * Math.cos((a * Math.PI) / 180)}" y2="${90 - 40 * Math.sin((a * Math.PI) / 180)}"/>`).join('')}</g>
    ${specks(16, 11, '#cfe0ff', 40, 200)}
    <g fill="#03050c">${[0, 70, 130, 210, 280, 350, 420, 500, 560].map((x, i) => `<rect x="${x}" y="${250 + ((i * 53) % 70)}" width="${50 + ((i * 29) % 40)}" height="200"/>`).join('')}</g>
    <g fill="#e8c37a" opacity="0.8">${[20, 90, 150, 230, 300, 370, 440, 520].map((x, i) => `<rect x="${x + 8}" y="${290 + ((i * 37) % 60)}" width="5" height="7"/><rect x="${x + 24}" y="${310 + ((i * 61) % 50)}" width="5" height="7"/>`).join('')}</g>`),
  // 08 Cold Start - fogged winter sunrise
  wrap(`<defs><linearGradient id="g8" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#aab8cc"/><stop offset="0.6" stop-color="#e0d5c8"/><stop offset="1" stop-color="#8a9aad"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#g8)"/>
    <circle cx="300" cy="170" r="60" fill="#fff1d6" opacity="0.95"/>
    <g fill="#6f7f92" opacity="0.6"><rect x="60" y="220" width="60" height="180"/><rect x="150" y="190" width="50" height="210"/><rect x="420" y="205" width="70" height="195"/><rect x="520" y="230" width="50" height="170"/></g>
    <g fill="#dfe6ee" opacity="0.7"><ellipse cx="300" cy="300" rx="340" ry="34"/><ellipse cx="180" cy="350" rx="300" ry="30"/></g>`),
  // 09 Gravity Optional - cliff over teal water
  wrap(`<defs><linearGradient id="g9" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ec8e0"/><stop offset="1" stop-color="#5a9ab8"/></linearGradient></defs>
    <rect width="${W}" height="190" fill="url(#g9)"/>
    <rect y="190" width="${W}" height="210" fill="#1e6a78"/>
    <g opacity="0.5" stroke="#bfe8ef" stroke-width="3">${[220, 260, 300, 340].map((y, i) => `<line x1="${40 + i * 30}" y1="${y}" x2="${560 - i * 40}" y2="${y}"/>`).join('')}</g>
    <polygon points="0,80 190,110 230,400 0,400" fill="#2e2a26"/>
    <circle cx="330" cy="120" r="9" fill="#161311"/><rect x="322" y="128" width="16" height="26" rx="7" fill="#161311"/>`),
  // 10 North Shore - gold hour over flat water
  wrap(`<defs><linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8b25c"/><stop offset="0.5" stop-color="#c9713a"/><stop offset="1" stop-color="#7a3a20"/></linearGradient></defs>
    <rect width="${W}" height="220" fill="url(#gA)"/>
    <circle cx="430" cy="185" r="42" fill="#ffe4a8"/>
    <rect y="220" width="${W}" height="180" fill="#3a2a20"/>
    <g fill="#e8b25c" opacity="0.65">${[228, 244, 262, 284, 310, 340].map((y, i) => `<rect x="${380 - i * 26}" y="${y}" width="${100 + i * 52}" height="4" rx="2"/>`).join('')}</g>
    <g fill="#241a12"><ellipse cx="80" cy="238" rx="120" ry="24"/><ellipse cx="560" cy="248" rx="90" ry="18"/></g>`),
  // 11 The Blue Hour - lit skyline over the river
  wrap(`<defs><linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1f4a"/><stop offset="1" stop-color="#274b8a"/></linearGradient></defs>
    <rect width="${W}" height="260" fill="url(#gB)"/>
    <g fill="#0a1226">${[0, 60, 115, 185, 255, 330, 400, 470, 540].map((x, i) => `<rect x="${x}" y="${140 + ((i * 43) % 70)}" width="${44 + ((i * 31) % 34)}" height="160"/>`).join('')}</g>
    <g fill="#ffd98c" opacity="0.85">${Array.from({ length: 26 }, (_, i) => `<rect x="${(i * 83) % 580 + 8}" y="${160 + ((i * 57) % 110)}" width="4" height="6"/>`).join('')}</g>
    <rect y="260" width="${W}" height="140" fill="#081226"/>
    <path d="M40 300 Q 300 250 560 300" stroke="#ffd98c" stroke-width="3" fill="none" opacity="0.7"/>
    <g fill="#e8c37a" opacity="0.4">${[290, 310, 335].map((y, i) => `<rect x="${140 - i * 20}" y="${y}" width="${320 + i * 40}" height="3" rx="1.5"/>`).join('')}</g>`),
];

/** CSS background-image value (data URI) for a moment's strip cell. */
export function stripArt(index: number): string {
  const svg = SCENES[index % SCENES.length];
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
