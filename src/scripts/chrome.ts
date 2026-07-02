/**
 * Site chrome - the persistent HUD layer that rides above every page:
 *   • #scroll-progress  hairline accent bar tracking scroll depth
 *   • #hud-clock        live Winnipeg time in the footer
 *
 * The progress bar carries transition:persist, so it survives ClientRouter
 * swaps; all handlers live at module scope and query the DOM live.
 */

/* ---------------- scroll progress ---------------- */
let progressRaf = 0;
function paintProgress() {
  progressRaf = 0;
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  bar.style.transform = `scaleX(${p})`;
}
function queueProgress() {
  if (!progressRaf) progressRaf = requestAnimationFrame(paintProgress);
}
window.addEventListener('scroll', queueProgress, { passive: true });
window.addEventListener('resize', queueProgress, { passive: true });
document.addEventListener('astro:page-load', queueProgress);
queueProgress();

/* ---------------- live Winnipeg clock ---------------- */
const clockFmt = new Intl.DateTimeFormat('en-CA', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZone: 'America/Winnipeg',
});
function tickClock() {
  const el = document.getElementById('hud-clock');
  if (el) el.textContent = clockFmt.format(new Date());
}
tickClock();
window.setInterval(tickClock, 1000);
document.addEventListener('astro:page-load', tickClock);
