/**
 * archiveGrid.ts - "Feature Lead" packer for the /photography archive.
 *
 * The archive renders as a 4-column grid (2 columns on small screens) built
 * from repeating 2-row "bands". Each band leads with at most one oversized
 * 2x2 moment (frontmatter `feature: true`), leads alternate sides band to
 * band, vertical frames run the full band height (exactly twice a 3:2
 * still), and stills stack two per column.
 *
 * Extending the archive is pure content work: drop a new entry in
 * src/content/photography/ and it flows into the next band automatically.
 * Set `feature: true` for a 2x2 lead, a vertical `ratio` (3/4, 2/3, 9/16)
 * for a full-height tall, `kind: video` for a film (autoplays in view).
 * Leftover cells in the final band come back as `fillers` for the
 * typographic index tile, so the grid always closes cleanly.
 */

export type ArchiveShape = 'lead' | 'tall' | 'std';

export interface ArchiveItem {
  /** Index into the sorted frames/moments arrays. */
  index: number;
  shape: ArchiveShape;
}

export interface ArchiveRect {
  /** 1-based CSS grid lines on the 4-column desktop grid. */
  row: number;
  col: number;
  rowSpan: number;
  colSpan: number;
}

export type ArchivePlacement = ArchiveItem & ArchiveRect;

export interface ArchiveLayout {
  placements: ArchivePlacement[];
  /** Empty rect(s) in the final band, for the index tile. */
  fillers: ArchiveRect[];
}

const COLS = 4;

/** Vertical ratios span two rows. `feature` entries lead a band at 2x2,
    except verticals (a 2x2 cell is a landscape crop, which would butcher
    a portrait), which stay tall. */
export function archiveShape(ratio: string, feature: boolean): ArchiveShape {
  const tall = ratio === '3/4' || ratio === '2/3' || ratio === '9/16';
  if (feature && !tall) return 'lead';
  return tall ? 'tall' : 'std';
}

/** Column units an item occupies within one 2-row band. */
const units = (s: ArchiveShape) => (s === 'lead' ? 2 : s === 'tall' ? 1 : 0.5);

export function packArchive(items: ArchiveItem[]): ArchiveLayout {
  const queue = [...items];
  const placements: ArchivePlacement[] = [];
  const fillers: ArchiveRect[] = [];
  let row = 1;
  let leadLeft = true;

  while (queue.length) {
    /* Fill one band greedily in reading order, scanning past items that no
       longer fit (a second lead, a tall against a half-free band) so a big
       item never strands half a band mid-grid. */
    const band: ArchiveItem[] = [];
    let used = 0;
    let hasLead = false;
    for (let i = 0; i < queue.length && used < COLS; ) {
      const it = queue[i];
      const u = it.shape === 'lead' && hasLead ? Infinity : units(it.shape);
      if (used + u <= COLS) {
        band.push(queue.splice(i, 1)[0]);
        used += u;
        if (it.shape === 'lead') hasLead = true;
      } else {
        i += 1;
      }
    }

    /* The lead pins to one side, alternating with each led band. */
    const lead = band.find((b) => b.shape === 'lead');
    let free = [1, 2, 3, 4];
    if (lead) {
      const col = leadLeft ? 1 : 3;
      placements.push({ ...lead, row, col, rowSpan: 2, colSpan: 2 });
      free = leadLeft ? [3, 4] : [1, 2];
      leadLeft = !leadLeft;
    }

    /* Talls take the next whole column; stills fill columns top then bottom. */
    let openCol: number | null = null;
    for (const it of band) {
      if (it.shape === 'lead') continue;
      if (it.shape === 'tall') {
        placements.push({ ...it, row, col: free.shift()!, rowSpan: 2, colSpan: 1 });
      } else if (openCol !== null) {
        placements.push({ ...it, row: row + 1, col: openCol, rowSpan: 1, colSpan: 1 });
        openCol = null;
      } else {
        const col = free.shift()!;
        placements.push({ ...it, row, col, rowSpan: 1, colSpan: 1 });
        openCol = col;
      }
    }

    /* Whatever the final band leaves open becomes index-tile space: a
       dangling half column first, then any whole columns (contiguous, since
       columns are consumed left to right). */
    if (openCol !== null) fillers.push({ row: row + 1, col: openCol, rowSpan: 1, colSpan: 1 });
    if (free.length) fillers.push({ row, col: free[0], rowSpan: 2, colSpan: free.length });

    row += 2;
  }

  return { placements, fillers };
}
