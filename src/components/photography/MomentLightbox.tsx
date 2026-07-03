import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface Moment {
  title: string;
  kind: 'photo' | 'video';
  /** Pre-formatted, e.g. "AUG 30, 2024" */
  dateDisplay: string;
  story?: string;
  location?: string;
  camera?: string;
  lens?: string;
  iso?: string;
  aperture?: string;
  focal?: string;
  fps?: string;
  quality?: string;
  /** e.g. "3/2" */
  ratio: string;
  /** Optimized image URL, if a real asset exists. */
  src?: string;
  /** CSS background used by the placeholder tile (must match the grid). */
  backdrop: string;
}

interface Props {
  moments: Moment[];
}

// Cinematic pacing (Caleb's pick): a long soft flight, panel arrives late.
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const OPEN_MS = 720;
const CLOSE_MS = 500;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * MomentLightbox - shared-element detail view for /photography. The clicked
 * frame's [data-media] element is measured at click time, then the lightbox
 * media FLIPs from that rect to its fullscreen layout position; closing
 * reverses the flight back into the grid. The info panel (story + tech
 * readout) slides in beside the media.
 */
export default function MomentLightbox({ moments }: Props) {
  const [index, setIndex] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const sourceRect = useRef<DOMRect | null>(null);
  const openedIndex = useRef<number | null>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const open = index !== null;

  const show = useCallback((i: number, tile: HTMLElement) => {
    lastFocused.current = tile;
    sourceRect.current = tile.querySelector('[data-media]')?.getBoundingClientRect() ?? null;
    openedIndex.current = i;
    setClosing(false);
    setIndex(i);
  }, []);

  // Delegate clicks from the static grid tiles.
  useEffect(() => {
    const tiles = Array.from(document.querySelectorAll<HTMLElement>('[data-moment-index]'));
    const handlers = tiles.map((tile) => {
      const h = () => show(Number(tile.dataset.momentIndex), tile);
      tile.addEventListener('click', h);
      return [tile, h] as const;
    });
    return () => handlers.forEach(([t, h]) => t.removeEventListener('click', h));
  }, [show]);

  // FLIP in from the grid tile, once per open.
  useLayoutEffect(() => {
    if (!open) return;
    const el = mediaRef.current;
    const first = sourceRect.current;
    if (!el || !first || prefersReducedMotion()) return;
    const last = el.getBoundingClientRect();
    if (last.width === 0 || last.height === 0) return;
    el.style.transformOrigin = 'top left';
    el.style.transition = 'none';
    el.style.transform = `translate(${first.left - last.left}px, ${first.top - last.top}px) scale(${first.width / last.width}, ${first.height / last.height})`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `transform ${OPEN_MS}ms ${EASE}`;
        el.style.transform = '';
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const finishClose = useCallback(() => {
    setIndex(null);
    setClosing(false);
    lastFocused.current?.focus?.();
  }, []);

  // Reverse flight back into the grid (unless the tile scrolled away). Fly
  // to the exact tile that was clicked: the same moment can also appear as a
  // decorative frame elsewhere on the page, but only when we're still on the
  // opened moment; after browsing with arrows, target that moment's grid tile.
  const close = useCallback(() => {
    if (index === null || closing) return;
    const el = mediaRef.current;
    const tile =
      index === openedIndex.current
        ? lastFocused.current?.querySelector<HTMLElement>('[data-media]')
        : document.querySelector<HTMLElement>(`[data-moment-index="${index}"] [data-media]`);
    const target = tile?.getBoundingClientRect();
    const visible =
      target && target.bottom > 0 && target.top < window.innerHeight && target.width > 0;
    setClosing(true);
    if (!el || !visible || prefersReducedMotion()) {
      finishClose();
      return;
    }
    const cur = el.getBoundingClientRect();
    el.style.transformOrigin = 'top left';
    el.style.transition = `transform ${CLOSE_MS}ms ${EASE}`;
    el.style.transform = `translate(${target.left - cur.left}px, ${target.top - cur.top}px) scale(${target.width / cur.width}, ${target.height / cur.height})`;
    window.setTimeout(finishClose, CLOSE_MS + 40);
  }, [index, closing, finishClose]);

  const step = useCallback(
    (d: number) => {
      setIndex((cur) =>
        cur === null ? cur : (((cur + d) % moments.length) + moments.length) % moments.length,
      );
    },
    [moments.length],
  );

  // Keyboard + scroll lock while open.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();
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

  const m = moments[index];
  const [rw, rh] = m.ratio.split('/').map(Number);
  const r = rw / rh;
  // Crossfade media content only when browsing away from the opened frame,
  // so the FLIP flight itself never double-animates.
  const browsing = index !== openedIndex.current;

  const specs: [string, string | undefined][] =
    m.kind === 'photo'
      ? [
          ['ISO', m.iso],
          ['Aperture', m.aperture],
          ['Focal length', m.focal],
        ]
      : [
          ['FPS', m.fps],
          ['Video quality', m.quality],
        ];
  const meta: [string, string | undefined][] = [
    ['Camera', m.camera],
    ['Lens', m.lens],
    ['Location', m.location],
  ];

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${m.kind === 'video' ? 'Film' : 'Photograph'}: ${m.title}`}
      className="fixed inset-0 z-[80] flex flex-col bg-[#050505]/95 backdrop-blur-md md:flex-row"
      style={{
        transition: `opacity ${CLOSE_MS}ms ${EASE}`,
        opacity: closing ? 0 : 1,
        animation: 'm-fade 360ms both',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      {/* stage */}
      <div
        className="relative grid min-h-0 flex-1 place-items-center p-5 pt-16 md:p-12"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div
          ref={mediaRef}
          className="relative overflow-hidden bg-[#0b0b0b]"
          style={{
            aspectRatio: `${rw} / ${rh}`,
            width: `min(100%, calc((100dvh - 14rem) * ${r}))`,
          }}
        >
          <div key={index} className="absolute inset-0" style={browsing ? { animation: 'm-fade 280ms both' } : undefined}>
            {m.src ? (
              <img src={m.src} alt={m.title} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <span className="absolute inset-0" style={{ background: m.backdrop }} aria-hidden="true" />
            )}
            {m.kind === 'video' && (
              <span className="absolute inset-0 grid place-items-center" aria-hidden="true">
                <span className="grid h-16 w-16 place-items-center rounded-full border border-white/60 bg-black/30 backdrop-blur-sm">
                  <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
                    <path d="M4 2.5v9l7-4.5-7-4.5z" fill="#f5f5f4" />
                  </svg>
                </span>
              </span>
            )}
            {!m.src && (
              <span className="absolute bottom-3 left-3 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/35">
                {m.kind === 'video' ? 'Reel placeholder' : 'Frame placeholder'}
              </span>
            )}
          </div>
        </div>

        {/* prev / next */}
        <button
          onClick={() => step(-1)}
          className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/70 hover:text-white md:left-6"
          aria-label="Previous moment"
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M11 3L5 9l6 6" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
        <button
          onClick={() => step(1)}
          className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/70 hover:text-white md:right-6"
          aria-label="Next moment"
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M7 3l6 6-6 6" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>

      {/* info panel */}
      <aside
        className="min-h-0 shrink-0 overflow-y-auto border-t border-white/10 bg-[#080808] px-6 py-6 md:w-[380px] md:border-l md:border-t-0 md:px-8 md:py-10"
        style={{ animation: `m-slide 680ms ${EASE} 320ms both` }}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-[0.65rem] tracking-[0.2em] text-cyan/80">
            N°{String(index + 1).padStart(2, '0')} / {String(moments.length).padStart(2, '0')}
          </span>
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-white/40">
            {m.kind === 'video' ? 'Film' : 'Photograph'}
          </span>
        </div>

        <h2
          className="mt-6 text-3xl text-[#f5f5f4]"
          style={{ fontFamily: 'var(--grotesk)', fontWeight: 550, letterSpacing: '-0.02em', lineHeight: 1.05 }}
        >
          {m.title}
        </h2>
        <p className="mt-2 text-sm italic text-white/45" style={{ fontFamily: 'var(--grotesk)' }}>
          {m.dateDisplay}
        </p>

        {m.story && (
          <p className="mt-6 text-[0.95rem] leading-relaxed text-white/70" style={{ fontFamily: 'var(--grotesk)' }}>
            {m.story}
          </p>
        )}

        <div className="mt-8 border-t border-white/10 pt-6">
          <span className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-white/35">
            Technical
          </span>
          <dl className="mt-4 grid grid-cols-3 gap-x-4 gap-y-5">
            {specs.map(([k, v]) =>
              v ? (
                <div key={k}>
                  <dt className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-white/35">{k}</dt>
                  <dd className="mt-1 font-mono text-sm text-[#e5e5e4]">{v}</dd>
                </div>
              ) : null,
            )}
          </dl>
          <dl className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5">
            {meta.map(([k, v]) =>
              v ? (
                <div key={k} className="flex items-baseline justify-between gap-4">
                  <dt className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-white/35">{k}</dt>
                  <dd className="text-right font-mono text-xs text-white/65">{v}</dd>
                </div>
              ) : null,
            )}
          </dl>
        </div>

        <button
          ref={closeBtnRef}
          onClick={close}
          className="mt-10 inline-flex items-center gap-2 border border-white/20 px-4 py-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-white/75 transition-colors hover:border-cyan/60 hover:text-white"
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          Close
        </button>
      </aside>
    </div>
  );
}
