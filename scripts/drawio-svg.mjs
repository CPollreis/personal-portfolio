#!/usr/bin/env node
/**
 * Prepare a draw.io SVG export for inlining into the site.
 *
 * Export the page first (pages are 1-based), then run this on the result:
 *
 *   draw.io --export --format svg --page-index 1 --border 24 --theme light ...
 *   node scripts/drawio-svg.mjs out.svg
 *
 * Which theme to export depends on where the page keeps its colour. Check the
 * source styles for `light-dark(a,b)` pairs:
 *
 *  - Colour in the light value (`light-dark(#dae8fc,...)`): export --theme
 *    light and let this script re-tone it for the dark stage.
 *  - Colour only in the dark value (`light-dark(#FFFFFF,#C828B2)`, which is how
 *    the DV org chart is drawn): export --theme dark and pass --keep-palette,
 *    so the colours land exactly as they look in the app.
 *
 * Passes:
 *  1. Drop the <image> raster fallback that sits beside every <foreignObject>
 *     inside a <switch>. Browsers never use it and it is ~97% of the file.
 *  2. Strip the html: namespace prefix. The HTML parser does not understand
 *     prefixed tags, so <html:br /> stops breaking lines and every label
 *     renders run-together.
 *  3. Re-tone the palette for a dark stage: hue and role are preserved, only
 *     lightness moves, so a blue box stays blue and a green box stays green.
 *     Skipped with --keep-palette.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const INK = '#e7e7ea';
const INK_DIM = '#a5a5ae';
const PANEL = '#1b1b20';
const LINE = '#8b8b95';
const LINE_FAINT = '#3a3a42';

const hex = (c) => {
  const m = c.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (m) {
    const h = m[1].length === 3 ? [...m[1]].map((d) => d + d).join('') : m[1];
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  }
  const r = c.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  return r ? [+r[1], +r[2], +r[3]] : null;
};

const toHsl = ([r, g, b]) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (!d) return [0, 0, l];
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
};

const toHex = (h, s, l) => {
  const f = (n) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    const v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(v * 255).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const isWhite = ([, s, l]) => l > 0.92 && s < 0.14;
const isBlack = ([, , l]) => l < 0.14;
const isGrey = ([, s]) => s < 0.12;

/** Shape and label backgrounds: white becomes the panel, colour deepens. */
function mapFill(color, tag) {
  const rgb = hex(color);
  if (!rgb) return null;
  const [h, s, l] = toHsl(rgb);
  // Arrowheads are black-filled <path>, not text; they have to stay visible.
  if (isBlack([h, s, l])) return tag === 'path' ? INK_DIM : PANEL;
  if (isWhite([h, s, l])) return PANEL;
  if (isGrey([h, s, l])) return toHex(h, s, Math.min(l, 0.34));
  return toHex(h, Math.min(s, 0.55), l > 0.7 ? 0.29 : Math.min(l, 0.38));
}

/** Outlines and connectors: enough contrast to read on the dark panel. */
function mapStroke(color) {
  const rgb = hex(color);
  if (!rgb) return null;
  const [h, s, l] = toHsl(rgb);
  if (isBlack([h, s, l])) return LINE;
  // draw.io's invisible white-on-white grouping boxes, kept as a faint rule.
  if (isWhite([h, s, l])) return LINE_FAINT;
  if (isGrey([h, s, l])) return toHex(h, s, 0.55);
  return toHex(h, Math.max(s, 0.45), 0.62);
}

/** Label text, which lives in foreignObject inline styles. */
function mapText(color) {
  const rgb = hex(color);
  if (!rgb) return null;
  const [h, s, l] = toHsl(rgb);
  if (isBlack([h, s, l])) return INK;
  if (isWhite([h, s, l])) return INK;
  if (isGrey([h, s, l])) return INK_DIM;
  return toHex(h, Math.max(s, 0.5), Math.max(l, 0.68));
}

const COLOR = String.raw`(#[0-9a-fA-F]{3,6}|rgba?\([^)]*\))`;

function retone(svg) {
  return svg.replace(/<([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)(\/?)>/g, (all, tag, attrs, close) => {
    let out = attrs;

    out = out.replace(new RegExp(`fill="${COLOR}"`, 'g'), (m, c) => {
      const v = mapFill(c, tag);
      return v ? `fill="${v}"` : m;
    });
    out = out.replace(new RegExp(`stroke="${COLOR}"`, 'g'), (m, c) => {
      const v = mapStroke(c);
      return v ? `stroke="${v}"` : m;
    });

    out = out.replace(/style="([^"]*)"/g, (m, css) => {
      const next = css
        .replace(new RegExp(`(^|[;\\s])fill:\\s*${COLOR}`, 'g'), (mm, pre, c) => {
          const v = mapFill(c, tag);
          return v ? `${pre}fill: ${v}` : mm;
        })
        .replace(new RegExp(`(^|[;\\s])stroke:\\s*${COLOR}`, 'g'), (mm, pre, c) => {
          const v = mapStroke(c);
          return v ? `${pre}stroke: ${v}` : mm;
        })
        .replace(new RegExp(`(^|[;\\s])(background(?:-color)?):\\s*${COLOR}`, 'g'), (mm, pre, prop, c) => {
          const v = mapFill(c, tag);
          return v ? `${pre}${prop}: ${v}` : mm;
        })
        .replace(new RegExp(`(^|[;\\s])(border(?:-[a-z]+)?-color):\\s*${COLOR}`, 'g'), (mm, pre, prop, c) => {
          const v = mapStroke(c);
          return v ? `${pre}${prop}: ${v}` : mm;
        })
        .replace(new RegExp(`(^|[;\\s])color:\\s*${COLOR}`, 'g'), (mm, pre, c) => {
          const v = mapText(c);
          return v ? `${pre}color: ${v}` : mm;
        });
      return `style="${next}"`;
    });

    return `<${tag}${out}${close}>`;
  });
}

function dropRasterFallbacks(svg) {
  let dropped = 0;
  const out = svg.replace(/<switch>([\s\S]*?)<\/switch>/g, (all, inner) => {
    if (!inner.includes('<foreignObject')) return all;
    const trimmed = inner.replace(/<image\b[^>]*\/>/g, () => {
      dropped += 1;
      return '';
    });
    return `<switch>${trimmed}</switch>`;
  });
  return [out, dropped];
}

const args = process.argv.slice(2);
/** Pages whose colour only exists in the drawio's dark variant are exported
 *  with --theme dark and skip the re-tone, which would fight those colours. */
const keepPalette = args.includes('--keep-palette');

for (const file of args.filter((a) => !a.startsWith('--'))) {
  const before = readFileSync(file, 'utf8');
  let [svg, dropped] = dropRasterFallbacks(before);
  const prefixed = (svg.match(/<\/?html:/g) || []).length;
  svg = svg.replace(/<html:([a-zA-Z0-9]+)/g, '<$1').replace(/<\/html:([a-zA-Z0-9]+)>/g, '</$1>');
  if (!keepPalette) svg = retone(svg);
  writeFileSync(file, svg);
  const kb = (n) => `${(n / 1024).toFixed(0)}kB`;
  console.log(
    `${file}: ${kb(before.length)} -> ${kb(svg.length)}, ${dropped} fallbacks dropped, ` +
      `${prefixed} prefixed tags${keepPalette ? ', palette kept' : ', re-toned'}`,
  );
}
