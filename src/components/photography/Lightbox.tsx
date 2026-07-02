import { useCallback, useEffect, useRef, useState } from 'react';

export interface Photo {
  title: string;
  date?: string;
  location?: string;
  camera?: string;
  lens?: string;
  settings?: string;
  coords?: string;
  ratio: string;
  /** Optimized image URL, if a real photo exists. */
  src?: string;
  /** Full-res/original source for the enlarged view. */
  full?: string;
}

interface Props {
  photos: Photo[];
}

/**
 * Lightbox - the site's one interactive island. Delegates clicks from the
 * Astro-rendered [data-photo-index] tiles, then owns overlay + keyboard nav.
 */
export default function Lightbox({ photos }: Props) {
  const [index, setIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const open = index !== null;

  const show = useCallback((i: number) => {
    lastFocused.current = document.activeElement as HTMLElement;
    setIndex(((i % photos.length) + photos.length) % photos.length);
  }, [photos.length]);

  const close = useCallback(() => {
    setIndex(null);
    lastFocused.current?.focus?.();
  }, []);

  const step = useCallback((d: number) => {
    setIndex((cur) => (cur === null ? cur : ((cur + d) % photos.length + photos.length) % photos.length));
  }, [photos.length]);

  // Delegate clicks from the static grid tiles.
  useEffect(() => {
    const tiles = Array.from(document.querySelectorAll<HTMLElement>('[data-photo-index]'));
    const handlers = tiles.map((tile) => {
      const h = () => show(Number(tile.dataset.photoIndex));
      tile.addEventListener('click', h);
      return [tile, h] as const;
    });
    return () => handlers.forEach(([t, h]) => t.removeEventListener('click', h));
  }, [show]);

  // Keyboard + scroll lock while open.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close, step]);

  if (!open || index === null) return null;
  const photo = photos[index];

  const exif: [string, string | undefined][] = [
    ['CAMERA', photo.camera],
    ['LENS', photo.lens],
    ['EXPOSURE', photo.settings],
    ['LOCATION', photo.location],
    ['COORD', photo.coords],
    ['DATE', photo.date],
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo: ${photo.title}`}
      className="fixed inset-0 z-[80] flex flex-col bg-bg/97 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      {/* top bar */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-6">
        <span className="font-mono text-[0.7rem] uppercase tracking-widest text-faint">
          <span className="text-cyan">{String(index + 1).padStart(3, '0')}</span> / {String(photos.length).padStart(3, '0')}
        </span>
        <button
          ref={closeRef}
          onClick={close}
          className="grid h-9 w-9 place-items-center border border-line text-ink transition-colors hover:border-cyan hover:text-cyan"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>

      {/* stage */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8">
        <button
          onClick={() => step(-1)}
          className="absolute left-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center border border-line bg-bg/60 text-ink transition-colors hover:border-cyan hover:text-cyan sm:left-5"
          aria-label="Previous"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M11 3L5 9l6 6" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>

        <figure className="flex max-h-full max-w-5xl flex-col items-center">
          {photo.src ? (
            <img
              src={photo.full ?? photo.src}
              alt={photo.title}
              className="max-h-[70vh] w-auto border border-line object-contain"
            />
          ) : (
            <PlaceholderPanel ratio={photo.ratio} label={`IMG · ${photo.title.toUpperCase()}`} />
          )}
          <figcaption className="mt-4 flex items-center gap-3">
            <span className="font-display text-lg text-ink">{photo.title}</span>
            {photo.settings && (
              <span className="font-mono text-[0.65rem] tracking-wider text-cyan">{photo.settings}</span>
            )}
          </figcaption>
        </figure>

        <button
          onClick={() => step(1)}
          className="absolute right-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center border border-line bg-bg/60 text-ink transition-colors hover:border-cyan hover:text-cyan sm:right-5"
          aria-label="Next"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M7 3l6 6-6 6" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>

      {/* EXIF readout */}
      <div className="border-t border-line px-4 py-4 sm:px-6">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 md:grid-cols-6">
          {exif.map(([k, v]) =>
            v ? (
              <div key={k} className="flex flex-col gap-1">
                <span className="font-mono text-[0.6rem] uppercase tracking-widest text-faint">{k}</span>
                <span className="font-mono text-xs text-muted">{v}</span>
              </div>
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
}

/** On-brand technical panel shown when no real image exists yet. */
function PlaceholderPanel({ ratio, label }: { ratio: string; label: string }) {
  return (
    <div
      className="relative w-[min(80vw,900px)] overflow-hidden border border-line bg-surface"
      style={{ aspectRatio: ratio.replace('/', ' / '), maxHeight: '70vh' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-line-soft) 1px,transparent 1px),linear-gradient(90deg,var(--color-line-soft) 1px,transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <span className="absolute bottom-3 left-3 font-mono text-[0.65rem] uppercase tracking-widest text-faint">
        {label}
      </span>
    </div>
  );
}
