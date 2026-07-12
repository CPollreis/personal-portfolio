// Screenshot site pages against a self-managed preview server.
//
//   node scripts/screenshot.mjs                  # default page set, Chromium
//   node scripts/screenshot.mjs /fsae /timeline  # specific paths
//   node scripts/screenshot.mjs --firefox /      # Firefox engine (matches Zen)
//   node scripts/screenshot.mjs --full /         # full-page instead of viewport
//   node scripts/screenshot.mjs --mobile /       # 390x844 viewport (phone layouts)
//   node scripts/screenshot.mjs --reduced-motion /photography  # settle scroll-reveal content immediately
//
// --reduced-motion emulates prefers-reduced-motion, which the site's motion
// runtime treats as "show everything now" (no [data-reveal] hide-class). Use it
// to capture content gated behind scroll-reveal (e.g. the /photography archive)
// that a static full-page shot would otherwise leave invisible.
//
// Output: .screenshots/<engine><path>.png, printed as absolute paths.
import { chromium, firefox } from 'playwright';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { ensureServer, projectRoot } from './lib/server.mjs';

const args = process.argv.slice(2);
const useFirefox = args.includes('--firefox');
const fullPage = args.includes('--full');
const mobile = args.includes('--mobile');
const reducedMotion = args.includes('--reduced-motion');
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
  const page = await browser.newPage({
    // note: the option is `viewport`; `viewportSize` is silently ignored
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    ...(reducedMotion ? { reducedMotion: 'reduce' } : {}),
  });
  for (const p of pages) {
    await page.goto(baseUrl + p, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800); // let entrance animations settle
    if (fullPage) {
      // Walk the page top-to-bottom so loading="lazy" media enters the viewport
      // and fetches; a full-page shot alone leaves below-fold images blank.
      await page.evaluate(async () => {
        const step = window.innerHeight;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(400);
    }
    const name = `${engine}${mobile ? '-mobile' : ''}${p === '/' ? '/home' : p}`.replaceAll('/', '_');
    const file = path.join(outDir, `${name}.png`);
    await page.screenshot({ path: file, fullPage });
    console.log(file);
  }
} finally {
  await browser.close();
  await stop();
}
