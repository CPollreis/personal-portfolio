/**
 * Media entries in the FSAE build log: the photo and clip posts that carry a
 * frame rather than a written article.
 *
 * This list is the numbering. Position here decides an entry's URL
 * (`/fsae/raw-007`) and the `number` its MDX body receives, so reordering or
 * removing one is an edit in this file, never a rename. Drafts stay in the list
 * and keep their place, but only published entries consume a number, so the
 * numbers a reader sees are always 1..n with no gaps. Add a new entry by
 * dropping its `.mdx` in `src/content/fsae/` and putting its id here.
 */
export const mediaOrder = [
  'stm32-node-on-the-breadboard',
  'altium-layout-controller-board',
  'layout-review-on-the-big-screen',
  'bare-controller-pcb-top-side',
  'bare-controller-pcb-duplicate-frame',
  'bench-test-rig-with-the-dev-board',
  'car-from-above-packaging-check',
  'test-session-in-the-lot',
  'driver-in-the-car-during-testing',
  'sensor-breadboard-test-first-pass',
  'sensor-module-on-the-breadboard',
  'encoder-test-rig-with-the-toothed-wheel',
  'controller-board-in-the-printed-fixture',
  'drive-belt-stock',
  'dev-board-and-controller-on-the-desk',
  'controller-board-with-heatsink',
  'board-powered-status-led-lit',
  'team-thread-screenshot',
  'bench-test-rig-against-the-whiteboard',
  'board-under-test-led-indication',
  'bench-supply-driving-the-test-setup',
  'can-bus-setup-diagram-on-the-dash-tablet',
  'shop-footage-captured-on-the-phone',
  'software-system-architecture-poster',
  'can-interface-adapter-on-the-bench',
  'inverter-state-machine-firmware',
  'umsae-controller-board-populated',
  'controller-board-solder-side',
  'cad-render-of-the-chassis',
  'filament-and-print-stock-delivery',
  'control-board-wired-into-the-loom',
  'sensor-housings-first-batch',
  'sensor-units-with-mounting-hardware',
  'front-suspension-and-frame-tubes',
  'harness-routing-through-the-chassis',
  'loom-build-on-the-bench',
  'chassis-on-stands-front-view',
  'chassis-assembly-in-progress',
  'accumulator-segment-cell-stack',
  'cell-segment-wiring-detail'
] as const;

const position = (id: string) => (mediaOrder as readonly string[]).indexOf(id);
const pad = (n: number) => String(n).padStart(3, '0');

export function isMediaEntry(id: string): boolean {
  return position(id) !== -1;
}

export interface EntryRef {
  /** URL slug: `raw-0NN` for a media entry, the id itself for a written one. */
  slug: string;
  /** 1-based number among published media entries, or null for a written one. */
  number: number | null;
}

/**
 * Resolve slugs and numbers for one set of published entry ids. Pass the whole
 * live set (both pages do) so the numbering is the same everywhere.
 */
export function fsaeRefs(ids: readonly string[]): Map<string, EntryRef> {
  const refs = new Map<string, EntryRef>(ids.map((id) => [id, { slug: id, number: null }]));
  ids
    .filter(isMediaEntry)
    .sort((a, b) => position(a) - position(b))
    .forEach((id, i) => refs.set(id, { slug: `raw-${pad(i + 1)}`, number: i + 1 }));
  return refs;
}
