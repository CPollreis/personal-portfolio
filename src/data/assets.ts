import manifest from './asset-manifest.json';

export { wsrv, wsrvSrcSet } from './wsrv';
export type { WsrvOptions } from './wsrv';

export interface AssetExif {
  takenAt: string | null;
  iso: string | null;
  aperture: string | null;
  shutter: string | null;
  camera: string | null;
  lens: string | null;
  focal: string | null;
}

export interface AssetRecord {
  url: string;
  w: number;
  h: number;
  hash: string;
  tag: string;
  file: string;
  exif: AssetExif | null;
}

type Manifest = {
  release: { active: string; rollAt: number };
  assets: Record<string, AssetRecord>;
};

const data = manifest as Manifest;

export function assetRecord(key: string): AssetRecord | undefined {
  return data.assets[key];
}

export function assetUrl(key: string): string | undefined {
  return data.assets[key]?.url;
}
