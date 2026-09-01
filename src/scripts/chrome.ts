import { navigate } from 'astro:transitions/client';

function onEntryNavKey(e: KeyboardEvent) {
  if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  if (e.key !== 'Escape' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  const el = document.getElementById('entry-keynav');
  if (!el) return;
  const t = e.target as HTMLElement | null;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
  if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
  const dest =
    e.key === 'Escape'
      ? el.dataset.back
      : e.key === 'ArrowLeft'
        ? el.dataset.prev
        : el.dataset.next;
  if (!dest) return;
  e.preventDefault();
  navigate(dest);
}
document.addEventListener('keydown', onEntryNavKey);

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
