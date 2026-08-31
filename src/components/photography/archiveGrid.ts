/**
 * archiveGrid.ts - cell-shape helper for the #photography mosaic on the home
 * page.
 *
 * The archive renders as a fixed-column CSS grid (4 columns on desktop, 2 on
 * small screens) with `grid-auto-flow: dense`. Every frame keeps its aspect
 * ratio: landscape and square stills take one row-height ('std'), portrait
 * ratios take two ('tall'), and dense flow backfills the gaps left to right so
 * the last row always closes flush.
 *
 * Extending the archive is pure content work: drop a new entry in
 * src/content/photography/ and it flows into the grid in `order` then `date`
 * sequence. A vertical `ratio` (3/4, 2/3, 9/16) makes it a full-height tall;
 * `kind: video` makes it a film (autoplays in view).
 */

export type ArchiveShape = 'tall' | 'std';

const TALL_RATIOS = new Set(['3/4', '2/3', '9/16']);

/** Vertical ratios span two rows so portraits keep their shape; everything
    else is a single-height still. */
export function archiveShape(ratio: string): ArchiveShape {
  return TALL_RATIOS.has(ratio) ? 'tall' : 'std';
}
