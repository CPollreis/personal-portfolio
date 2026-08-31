export type ArchiveShape = 'tall' | 'std';

const TALL_RATIOS = new Set(['3/4', '2/3', '9/16']);

/** Vertical ratios span two rows so portraits keep their shape; everything
    else is a single-height still. */
export function archiveShape(ratio: string): ArchiveShape {
  return TALL_RATIOS.has(ratio) ? 'tall' : 'std';
}
