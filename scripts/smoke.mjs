// Interaction smoke test: replays the navigation patterns that have broken
// before, in Chromium AND Firefox (Caleb browses in Zen, a Firefox fork).
//
//   node scripts/smoke.mjs
//
// Checks per engine:
//   1. Home loads and the hero background video reaches playing state.
//   2. Client-side nav Home -> build-log entry -> Home: hero video resumes.
//   3. Nav links on every core page are clickable (nothing overlays them).
//   4. Build-log filter rail: PRJ isolates project entries, a second click
//      clears back to all, the FSAE parent isolates its three subsystems, and
//      /#projects and /#buildlog preselect the Projects and FSAE filters.
// Exits 1 with a FAIL line per broken check.
import { chromium, firefox } from 'playwright';
import { ensureServer } from './lib/server.mjs';

// One-page site: /fsae and /projects are redirect stubs now; a detail page
// stands in for them.
const CORE_PAGES = ['/', '/fsae/bms-can-integration', '/photography', '/timeline'];
const failures = [];

async function videoPlaying(page) {
  return page.evaluate(() => {
    const v = document.querySelector('video[data-header-video], video[autoplay], video');
    if (!v) return 'no-video';
    return !v.paused && !v.ended && v.readyState >= 2 ? 'playing' : 'stalled';
  });
}

async function waitForPlaying(page, label, engine) {
  const deadline = Date.now() + 8000;
  let state = 'no-video';
  while (Date.now() < deadline) {
    state = await videoPlaying(page);
    if (state === 'playing') return;
    await page.waitForTimeout(250);
  }
  failures.push(`[${engine}] ${label}: hero video state is "${state}" after 8s`);
}

async function run(engine, launcher, opts) {
  const browser = await launcher.launch(opts);
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    // 1. initial load plays video
    await page.goto(base + '/', { waitUntil: 'networkidle' });
    await waitForPlaying(page, 'initial home load', engine);

    // 2. Home -> build-log entry -> Home resumes video (the recurring regression)
    await page.click('#fsae a[href*="/fsae/"]');
    await page.waitForURL('**/fsae/**');
    await page.click('header a >> nth=0');
    await page.waitForTimeout(500);
    await waitForPlaying(page, 'return to home after a build-log entry', engine);

    // 3. nav links clickable on every core page (no overlay swallowing clicks)
    for (const p of CORE_PAGES) {
      await page.goto(base + p, { waitUntil: 'domcontentloaded' });
      const blocked = await page.evaluate(() => {
        const bad = [];
        for (const a of document.querySelectorAll('header a, nav a')) {
          const r = a.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
          if (el && !a.contains(el) && !el.contains(a)) bad.push(a.getAttribute('href'));
        }
        return bad;
      });
      if (blocked.length) failures.push(`[${engine}] ${p}: nav links click-blocked: ${blocked.join(', ')}`);
    }

    // 4. build-log filter rail (desktop viewport, so the rail is visible)
    await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
    const counts = await page.evaluate(() => ({
      total: document.querySelectorAll('#buildlog [data-log-entry]').length,
      prj: document.querySelectorAll('#buildlog [data-log-entry][data-cat="prj"]').length,
      fsae: document.querySelectorAll('#buildlog [data-log-entry]:not([data-cat="prj"])').length,
    }));
    const visibleEntries = () =>
      page.evaluate(
        () =>
          [...document.querySelectorAll('#buildlog [data-log-entry]')].filter(
            (el) => el.offsetParent !== null,
          ).length,
      );
    // clicks retry because the filter binds on astro:page-load, which can land
    // a beat after domcontentloaded
    const clickUntil = async (selector, want, label) => {
      const deadline = Date.now() + 5000;
      let n = -1;
      while (Date.now() < deadline) {
        await page.click(selector);
        await page.waitForTimeout(120);
        n = await visibleEntries();
        if (n === want) return;
      }
      failures.push(`[${engine}] build-log filter ${label}: ${n} entries visible, wanted ${want}`);
    };
    if (counts.total === 0 || counts.prj === 0) {
      failures.push(`[${engine}] build-log filter: no entries found (total ${counts.total}, prj ${counts.prj})`);
    } else {
      await clickUntil('#buildlog nav [data-log-filter="prj"]', counts.prj, 'PRJ isolate');
      await clickUntil('#buildlog nav [data-log-filter="prj"]', counts.total, 'second-click clear');
      await clickUntil('#buildlog nav [data-log-filter="fsae"]', counts.fsae, 'FSAE grouping');
      await clickUntil('#buildlog nav [data-log-filter="fsae"]', counts.total, 'FSAE second-click clear');
      // hash preselects: #projects -> Projects filter, #buildlog -> FSAE grouping
      const preselect = async (hash, want, label) => {
        await page.goto(base + hash, { waitUntil: 'domcontentloaded' });
        const deadline = Date.now() + 5000;
        let n = -1;
        while (Date.now() < deadline) {
          n = await visibleEntries();
          if (n === want) return;
          await page.waitForTimeout(150);
        }
        failures.push(`[${engine}] ${label} preselect: ${n} entries visible, wanted ${want}`);
      };
      await preselect('/#projects', counts.prj, '/#projects');
      await preselect('/#buildlog', counts.fsae, '/#buildlog');
    }
  } catch (err) {
    failures.push(`[${engine}] crashed: ${err.message}`);
  } finally {
    await browser.close();
  }
}

const { baseUrl: base, stop } = await ensureServer();
try {
  await run('chromium', chromium, { channel: 'chrome' });
  await run('firefox', firefox, {});
} finally {
  await stop();
}

if (failures.length) {
  for (const f of failures) console.error('FAIL ' + f);
  process.exit(1);
}
console.log('smoke OK: video autoplay + nav replay + click targets pass in chromium and firefox');
