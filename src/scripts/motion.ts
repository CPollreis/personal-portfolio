/**
 * Motion engine - one shared, declarative anime.js runtime for the whole site.
 *
 * Markup opts in with data-attributes; this script wires IntersectionObserver +
 * anime.js so pages ship zero per-effect JS. Everything degrades gracefully:
 *   • No JS            → content is fully visible (initial-hidden CSS is scoped
 *                        to `html.motion`, which only this script adds).
 *   • Reduced motion   → final states applied instantly, no animation.
 *
 * Supported attributes:
 *   data-reveal[="up|left|right|clip"] fade + slide (or clip-wipe) an element in
 *   data-reveal-delay="120"            ms delay
 *   data-stagger                       container: stagger its [data-stagger-item]s
 *   data-stagger-gap="60"              per-item ms (default 45)
 *   data-counter="1240"                count up to a number (tabular)
 *   data-counter-suffix="+"            appended after the value
 *   data-scramble                      scramble-reveal the element's text
 *   data-draw[="scroll"]               draw inline SVG strokes on enter (or synced)
 *   data-parallax="0.15"               slow scroll drift for decorative layers
 *
 * Re-initializes after ClientRouter page swaps (astro:page-load); nodes are
 * marked with data-mo-bound so repeat passes never double-bind.
 */
import { animate, stagger, createDrawable, onScroll, utils, cubicBezier } from 'animejs';

const prefersReduced =
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

// anime v4 removed the string form; pass the easing function itself.
const EASE = cubicBezier(0.16, 1, 0.3, 1);

/** Reveal offset per direction. */
function offset(dir: string | null): { x: number; y: number } {
  switch (dir) {
    case 'left':
      return { x: -24, y: 0 };
    case 'right':
      return { x: 24, y: 0 };
    case 'down':
      return { x: 0, y: -20 };
    default:
      return { x: 0, y: 20 };
  }
}

function revealEl(el: HTMLElement) {
  const dir = el.getAttribute('data-reveal');
  const delay = Number(el.getAttribute('data-reveal-delay')) || 0;
  if (dir === 'clip') {
    // The clip lives on the CHILD: a clipped target reports a zero-area
    // intersection, so observing the (unclipped) wrapper is what makes the
    // IntersectionObserver fire at all.
    const target = el.firstElementChild as HTMLElement | null;
    if (!target) return;
    animate(target, {
      clipPath: ['inset(0 0 100% 0)', 'inset(0 0 -12% 0)'],
      translateY: [22, 0],
      duration: 900,
      delay,
      ease: EASE,
    });
    return;
  }
  const { x, y } = offset(dir);
  animate(el, {
    opacity: [0, 1],
    translateX: [x, 0],
    translateY: [y, 0],
    duration: 640,
    delay,
    ease: EASE,
  });
}

function staggerEl(container: HTMLElement) {
  const items = container.querySelectorAll<HTMLElement>('[data-stagger-item]');
  const targets = items.length ? items : (container.children as unknown as HTMLElement[]);
  const gap = Number(container.getAttribute('data-stagger-gap')) || 45;
  animate(targets, {
    opacity: [0, 1],
    translateY: [18, 0],
    duration: 620,
    delay: stagger(gap),
    ease: EASE,
  });
}

function counterEl(el: HTMLElement) {
  const end = Number(el.getAttribute('data-counter')) || 0;
  const suffix = el.getAttribute('data-counter-suffix') ?? '';
  const decimals = (el.getAttribute('data-counter') || '').split('.')[1]?.length ?? 0;
  const obj = { v: 0 };
  animate(obj, {
    v: end,
    duration: 1400,
    ease: 'out(3)',
    onUpdate: () => {
      el.textContent = obj.v.toFixed(decimals) + suffix;
    },
  });
}

function scrambleEl(el: HTMLElement) {
  const finalText = (el.textContent ?? '').trim();
  const chars = '0123456789<>-_/[]{}=+*#';
  const total = finalText.length;
  let frame = 0;
  const settleAt = (i: number) => i * 1.4 + 6;
  const id = window.setInterval(() => {
    frame++;
    let out = '';
    for (let i = 0; i < total; i++) {
      const c = finalText[i];
      if (c === ' ') {
        out += ' ';
      } else if (frame >= settleAt(i)) {
        out += c;
      } else {
        out += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    el.textContent = out;
    if (frame >= settleAt(total)) window.clearInterval(id);
  }, 28);
}

/** Slow vertical drift synced to the element's traversal of the viewport. */
function parallaxEl(el: HTMLElement) {
  const speed = Number(el.getAttribute('data-parallax')) || 0.15;
  animate(el, {
    translateY: [speed * 120, speed * -120],
    ease: 'linear',
    autoplay: onScroll({ target: el, sync: 1, enter: 'bottom top', leave: 'top bottom' }),
  });
}

function drawEl(svgEl: HTMLElement) {
  const mode = svgEl.getAttribute('data-draw');
  const strokes = svgEl.querySelectorAll<SVGGeometryElement>('path, line, polyline, circle, rect, ellipse');
  if (!strokes.length) return;
  const drawable = createDrawable(strokes as unknown as SVGGeometryElement[]);
  if (mode === 'scroll') {
    animate(drawable, {
      draw: ['0 0', '0 1'],
      ease: 'linear',
      autoplay: onScroll({ target: svgEl, sync: 0.6, enter: 'bottom top', leave: 'top bottom' }),
    });
  } else {
    animate(drawable, { draw: ['0 0', '0 1'], duration: 1400, delay: stagger(90), ease: 'inOut(2)' });
  }
}

/** Apply the final resting state immediately (reduced-motion / eager paths). */
function settle(el: HTMLElement) {
  if (el.hasAttribute('data-counter')) {
    const end = Number(el.getAttribute('data-counter')) || 0;
    const suffix = el.getAttribute('data-counter-suffix') ?? '';
    const decimals = (el.getAttribute('data-counter') || '').split('.')[1]?.length ?? 0;
    el.textContent = end.toFixed(decimals) + suffix;
  }
  if (el.hasAttribute('data-draw')) {
    const strokes = el.querySelectorAll<SVGGeometryElement>('path, line, polyline, circle, rect, ellipse');
    utils.set(createDrawable(strokes as unknown as SVGGeometryElement[]), { draw: '0 1' });
  }
  // reveal/stagger/scramble need nothing: content is visible by default.
}

const SELECTOR =
  '[data-reveal],[data-stagger],[data-counter],[data-scramble],[data-draw],[data-parallax]';

function run(el: HTMLElement) {
  if (el.hasAttribute('data-reveal')) revealEl(el);
  else if (el.hasAttribute('data-stagger')) staggerEl(el);
  if (el.hasAttribute('data-counter')) counterEl(el);
  if (el.hasAttribute('data-scramble')) scrambleEl(el);
  if (el.hasAttribute('data-draw') && el.getAttribute('data-draw') !== 'scroll') drawEl(el);
}

function init() {
  // Only claim nodes this pass hasn't seen (fresh DOM after a page swap).
  const nodes = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR)).filter(
    (n) => !n.dataset.moBound,
  );
  nodes.forEach((n) => {
    n.dataset.moBound = '1';
  });
  if (!nodes.length) return;

  if (prefersReduced) {
    nodes.forEach(settle);
    // scroll-drawn SVGs still want a live scroll bind? No - settle to full.
    return;
  }

  // Only now that JS + motion are active do we allow initial-hidden CSS.
  document.documentElement.classList.add('motion');

  // Scroll-synced binds attach immediately (they track scroll position).
  nodes.filter((n) => n.getAttribute('data-draw') === 'scroll').forEach(drawEl);
  nodes.filter((n) => n.hasAttribute('data-parallax')).forEach(parallaxEl);

  const io = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        run(el);
        obs.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.15 },
  );

  nodes
    .filter((n) => n.getAttribute('data-draw') !== 'scroll' && !n.hasAttribute('data-parallax'))
    .forEach((n) => io.observe(n));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
// Re-run after every ClientRouter navigation (also fires on first load).
document.addEventListener('astro:page-load', init);
