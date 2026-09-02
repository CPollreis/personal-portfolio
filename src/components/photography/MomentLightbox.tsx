import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { withBase } from '../../config/paths';
import { wsrv, wsrvSrcSet } from '../../data/wsrv';

const LARGE_WIDTHS = [1600, 2400, 3200];

export interface Moment {
  title?: string;
  kind: 'photo' | 'video';
  /** Pre-formatted, e.g. "AUG 30, 2024" */
  dateDisplay: string;
  story?: string;
  location?: string;
  camera?: string;
  lens?: string;
  iso?: string;
  aperture?: string;
  shutter?: string;
  focal?: string;
  fps?: string;
  quality?: string;
  /** e.g. "3/2" */
  ratio: string;
  /** Optimized image URL, if a real asset exists. */
  src?: string;
  /** Raw full-resolution original (GitHub Release). Drives the large view via
   *  wsrv.nl and the "Download original" link; absent -> `src` is used. */
  downloadUrl?: string;
  /** Looping clip (public/ path) for kind: video moments. */
  video?: string;
  /** CSS background used by the placeholder tile (must match the grid). */
  backdrop: string;
}

interface Props {
  moments: Moment[];
}

// Cinematic pacing (Caleb's pick): a long soft flight.
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const OPEN_MS = 720;
const CLOSE_MS = 500;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function MomentLightbox({ moments }: Props) {
  const [index, setIndex] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const [recovery, setRecovery] = useState(0);
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

  useEffect(() => {
    setRecovery(0);
  }, [index]);

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
  // webm-first sibling (see src/scripts/footage.ts / Hero.astro): Firefox on
  // macOS can fail the H.264 decoder, so prefer the .webm when we have an .mp4.
  const videoWebm = m.video?.endsWith('.mp4') ? m.video.replace(/\.mp4$/, '.webm') : null;
  let largeSrc = m.downloadUrl ? wsrv(m.downloadUrl, { w: 2400, q: 82 }) : m.src;
  let largeSrcSet = m.downloadUrl ? wsrvSrcSet(m.downloadUrl, LARGE_WIDTHS, 82) : undefined;
  if (m.downloadUrl && recovery === 1) {
    largeSrc = `${wsrv(m.downloadUrl, { w: 2400, q: 82 })}&retry=1`;
    largeSrcSet = undefined;
  } else if (m.downloadUrl && recovery >= 2) {
    largeSrc = m.downloadUrl;
    largeSrcSet = undefined;
  }
  // Crossfade media content only when browsing away from the opened frame,
  // so the FLIP flight itself never double-animates.
  const browsing = index !== openedIndex.current;

  const counter = `${String(index + 1).padStart(2, '0')} / ${String(moments.length).padStart(2, '0')}`;
  const exposure =
    m.kind === 'video'
      ? [m.camera, m.fps && `${m.fps} FPS`, m.quality].filter(Boolean).join('  ·  ')
      : [m.camera, m.iso && `ISO ${m.iso}`, m.aperture, m.shutter].filter(Boolean).join('  ·  ');
  const label = `${m.kind === 'video' ? 'Film' : 'Photograph'} ${index + 1} of ${moments.length}${m.title ? `: ${m.title}` : ''}`;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-[80] bg-black/95 backdrop-blur-md"
      style={{
        transition: `opacity ${CLOSE_MS}ms ${EASE}`,
        opacity: closing ? 0 : 1,
        animation: 'm-fade 360ms both',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <button
        ref={closeBtnRef}
        onClick={close}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white/75 transition-colors hover:border-white/70 hover:text-white md:right-6 md:top-6"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>

      <div
        className="absolute inset-0 grid place-items-center p-6 pt-16 md:p-12"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div
          className="flex flex-col"
          style={{ width: `min(100%, calc((100dvh - 14rem) * ${r}))` }}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            ref={mediaRef}
            className="relative w-full overflow-hidden bg-[#0b0b0b]"
            style={{ aspectRatio: `${rw} / ${rh}` }}
          >
            <div
              key={index}
              className="absolute inset-0"
              style={browsing ? { animation: 'm-fade 280ms both' } : undefined}
            >
              {m.kind === 'video' && m.video ? (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover"
                >
                  {videoWebm && <source src={withBase(videoWebm)} type="video/webm" />}
                  <source
                    src={withBase(m.video)}
                    type={m.video.endsWith('.mp4') ? 'video/mp4' : 'video/webm'}
                  />
                </video>
              ) : largeSrc ? (
                <img
                  src={largeSrc}
                  srcSet={largeSrcSet}
                  sizes="(min-width: 768px) min(100vw, calc((100dvh - 14rem) * 1.5)), 100vw"
                  alt={m.title ?? ''}
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={() => {
                    if (m.downloadUrl && recovery < 2) setRecovery((s) => s + 1);
                  }}
                />
              ) : (
                <span className="absolute inset-0" style={{ background: m.backdrop }} aria-hidden="true" />
              )}
              {!largeSrc && !m.video && (
                <span className="absolute bottom-3 left-3 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/35">
                  {m.kind === 'video' ? 'Reel placeholder' : 'Frame placeholder'}
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-[0.7rem]">
            <span className="flex items-baseline gap-2 tracking-[0.06em]">
              <span className="tracking-[0.18em] text-cyan/70">{counter}</span>
              {m.dateDisplay && (
                <>
                  <span className="text-white/25">·</span>
                  <span className="text-white/60">{m.dateDisplay}</span>
                </>
              )}
            </span>
            {exposure && (
              <span className="whitespace-nowrap text-right tracking-[0.06em] text-white/55">
                {exposure}
              </span>
            )}
          </div>

          {m.downloadUrl && (
            <a
              href={m.downloadUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 self-start font-mono text-[0.65rem] uppercase tracking-[0.14em] text-white/45 transition-colors hover:text-white/80"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 2v9m0 0L4.5 7.5M8 11l3.5-3.5M3 13.5h10" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              Download original
            </a>
          )}
        </div>
      </div>

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
  );
}
