const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

function begin(video: HTMLVideoElement) {
  video.muted = true; // required for programmatic autoplay
  video.play().catch(() => {
    // Media not ready yet: play as soon as it can.
    video.addEventListener('canplay', () => void video.play().catch(() => {}), { once: true });
  });
}

/* Replace a dead element with a brand-new one (same attributes and <source>
   children) so the browser redoes source selection from a clean slate. */
function rebuild(video: HTMLVideoElement): HTMLVideoElement {
  const fresh = document.createElement('video');
  for (const { name, value } of Array.from(video.attributes)) fresh.setAttribute(name, value);
  fresh.innerHTML = video.innerHTML;
  video.replaceWith(fresh);
  return fresh;
}

/* Watch a not-yet-decoding video and rebuild it if its load ends in
   NETWORK_NO_SOURCE (every candidate failed). In-flight loads on slow
   connections are left alone. */
function rescue(video: HTMLVideoElement, attempt: number) {
  if (attempt > 4) return;
  setTimeout(() => {
    if (!video.isConnected || mq.matches) return;
    if (video.readyState > HTMLMediaElement.HAVE_NOTHING) return; // media arrived
    if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      const fresh = rebuild(video);
      begin(fresh);
      rescue(fresh, attempt + 1);
    } else {
      rescue(video, attempt + 1);
    }
  }, 700 * attempt);
}

/* After a ClientRouter swap, never trust the adopted element: its candidate
   list may already be marked failed (Firefox then falls back to the mp4 and
   the broken decoder). Rebuilding unconditionally makes every arrival behave
   exactly like a real page parse, which reliably picks the webm. */
function syncAfterSwap() {
  document.querySelectorAll<HTMLVideoElement>('video[data-header-video]').forEach((video) => {
    if (mq.matches) {
      video.pause();
      return;
    }
    const fresh = rebuild(video);
    begin(fresh);
    rescue(fresh, 1);
  });
}

/* Gentle resume for tab returns and bfcache restores: leave a healthy playing
   video alone, restart a dead one. */
function sync() {
  document.querySelectorAll<HTMLVideoElement>('video[data-header-video]').forEach((video) => {
    if (mq.matches) {
      video.pause();
      return;
    }
    if (video.readyState === HTMLMediaElement.HAVE_NOTHING) {
      if (
        video.networkState === HTMLMediaElement.NETWORK_EMPTY ||
        video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE
      ) {
        video = rebuild(video);
      }
      begin(video);
      rescue(video, 1);
      return;
    }
    if (!video.paused) return; // already rolling: don't snap it to frame 0
    try {
      video.currentTime = 0;
    } catch {
      /* not seekable; play from wherever it is */
    }
    begin(video);
  });
}

sync();
mq.addEventListener('change', sync);
document.addEventListener('astro:page-load', syncAfterSwap);
window.addEventListener('pageshow', sync); // covers back/forward-cache restores
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) sync(); // returning to the tab: resume playback
});
