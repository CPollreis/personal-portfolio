// Screenshot site pages against a self-managed preview server.
//
//   node scripts/screenshot.mjs                  # default page set, Chromium
//   node scripts/screenshot.mjs /fsae /timeline  # specific paths
//   node scripts/screenshot.mjs --firefox /      # Firefox engine (matches Zen)
//   node scripts/screenshot.mjs --full /         # full-page instead of viewport
//
// Output: .screenshots/<engine><path>.png, printed as absolute paths.
import { chromium, firefox } from 'playwright';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { ensureServer, projectRoot } from './lib/server.mjs';

const args = process.argv.slice(2);
const useFirefox = args.includes('--firefox');
const fullPage = args.includes('--full');
const paths = args.filter((a) => a.startsWith('/'));
const pages = paths.length ? paths : ['/', '/fsae', '/photography', '/projects', '/timeline', '/about'];

const outDir = path.join(projectRoot, '.screenshots');
mkdirSync(outDir, { recursive: true });

const { baseUrl, stop } = await ensureServer();
const engine = useFirefox ? 'firefox' : 'chromium';
const browser = useFirefox
  ? await firefox.launch()
  : await chromium.launch({ channel: 'chrome' });

try {
  const page = await browser.newPage({ viewportSize: { width: 1440, height: 900 } });
  for (const p of pages) {
    await page.goto(baseUrl + p, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800); // let entrance animations settle
    const name = `${engine}${p === '/' ? '/home' : p}`.replaceAll('/', '_');
    const file = path.join(outDir, `${name}.png`);
    await page.screenshot({ path: file, fullPage });
    console.log(file);
  }
} finally {
  await browser.close();
  await stop();
}
