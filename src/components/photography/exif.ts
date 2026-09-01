import exifr from 'exifr';

export interface PhotoExif {
  takenAt: Date | null;
  iso: string | null;
  aperture: string | null;
  shutter: string | null;
  camera: string | null;
}

const EMPTY: PhotoExif = { takenAt: null, iso: null, aperture: null, shutter: null, camera: null };

const cache = new Map<string, Promise<PhotoExif>>();

export function readPhotoExif(absImagePath: string): Promise<PhotoExif> {
  let hit = cache.get(absImagePath);
  if (!hit) {
    hit = parse(absImagePath);
    cache.set(absImagePath, hit);
  }
  return hit;
}

async function parse(absImagePath: string): Promise<PhotoExif> {
  let raw: Record<string, unknown> | undefined;
  try {
    raw = await exifr.parse(absImagePath, {
      pick: [
        'DateTimeOriginal',
        'CreateDate',
        'ISO',
        'ISOSpeedRatings',
        'PhotographicSensitivity',
        'FNumber',
        'ExposureTime',
        'Make',
        'Model',
      ],
    });
  } catch {
    return EMPTY;
  }
  if (!raw) return EMPTY;

  return {
    takenAt: wallClockToUtc(raw.DateTimeOriginal ?? raw.CreateDate),
    iso: fmtIso(raw.ISO ?? raw.ISOSpeedRatings ?? raw.PhotographicSensitivity),
    aperture: fmtAperture(raw.FNumber),
    shutter: fmtShutter(raw.ExposureTime),
    camera: fmtCamera(raw.Make, raw.Model),
  };
}

function wallClockToUtc(value: unknown): Date | null {
  let d: Date | null = null;
  if (value instanceof Date) {
    d = value;
  } else if (typeof value === 'string') {
    const m = value.match(/(\d{4})\D(\d{2})\D(\d{2})\D(\d{2})\D(\d{2})\D(\d{2})/);
    if (m) {
      const [y, mo, day, h, mi, s] = m.slice(1).map(Number);
      return new Date(Date.UTC(y, mo - 1, day, h, mi, s));
    }
    const t = new Date(value);
    d = Number.isNaN(t.getTime()) ? null : t;
  }
  if (!d || Number.isNaN(d.getTime())) return null;
  return new Date(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()),
  );
}

function fmtIso(value: unknown): string | null {
  const n = Array.isArray(value) ? Number(value[0]) : Number(value);
  return Number.isFinite(n) && n > 0 ? String(Math.round(n)) : null;
}

function trimNum(n: number): string {
  return n.toFixed(2).replace(/\.?0+$/, '');
}

function fmtAperture(value: unknown): string | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? `f/${trimNum(n)}` : null;
}

function fmtShutter(value: unknown): string | null {
  const t = Number(value);
  if (!Number.isFinite(t) || t <= 0) return null;
  if (t >= 1) return `${trimNum(t)}s`;
  return `1/${Math.round(1 / t)}`;
}

function fmtCamera(make: unknown, model: unknown): string | null {
  const brandRaw = typeof make === 'string' ? make.trim() : '';
  const body = typeof model === 'string' ? model.trim() : '';
  if (!body || body === '----') return null;

  const brand = brandRaw
    .replace(/\bCORPORATION\b/i, '')
    .replace(/\bIMAGING\b/i, '')
    .replace(/\bCO\.?,?\s*LTD\.?\b/i, '')
    .trim()
    .replace(/\S+/g, (w) => (w.length <= 3 ? w : w[0] + w.slice(1).toLowerCase()));

  if (brand && new RegExp(`^${brand}\\b`, 'i').test(body)) return body;
  return brand ? `${brand} ${body}` : body;
}
