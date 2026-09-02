// Publish full-resolution portfolio images to a GitHub Release and record them
// in src/data/asset-manifest.json (pipeline B, research-image-hosting/).
//
//   node scripts/publish-assets.mjs --dir ~/path/to/originals
//   node scripts/publish-assets.mjs --dir ./originals --dry-run
//   node scripts/publish-assets.mjs --dir ./originals --namespace photography --force
//
// Each file becomes a manifest entry keyed <namespace>/<basename-without-ext>,
// uploaded to the release tag in manifest.release.active. When that tag reaches
// manifest.release.rollAt assets the script rolls to <tag>-2, -3, ... (GitHub's
// hard cap is 1000 assets per release, HTTP 422 past it).
//
// gh must be authed with repo scope. Uploads run locally on purpose; commit the
// manifest change afterwards.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { readPhotoExif } from '../src/components/photography/exif.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'src/data/asset-manifest.json');
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);

function parseArgs(argv) {
  const args = { dir: null, namespace: 'photography', repo: null, dryRun: false, force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dir') args.dir = argv[++i];
    else if (a === '--namespace') args.namespace = argv[++i];
    else if (a === '--repo') args.repo = argv[++i];
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--force') args.force = true;
    else if (a === '--help' || a === '-h') args.help = true;
    else {
      console.error(`unknown argument: ${a}`);
      process.exit(2);
    }
  }
  return args;
}

function detectRepo() {
  const url = execFileSync('git', ['remote', 'get-url', 'origin'], { cwd: ROOT })
    .toString()
    .trim();
  const m = url.match(/[:/]([^/:]+\/[^/]+?)(?:\.git)?$/);
  if (!m) throw new Error(`could not parse owner/repo from origin url: ${url}`);
  return m[1];
}

function sanitizeAssetName(base, ext) {
  const stem = base.replace(/[^\w.-]+/g, '.').replace(/\.+/g, '.').replace(/^\.|\.$/g, '');
  return `${stem}${ext.toLowerCase()}`;
}

function nextTag(tag) {
  const m = tag.match(/^(.*?)(?:-(\d+))?$/);
  const stem = m[1];
  const n = m[2] ? Number(m[2]) : 1;
  return `${stem}-${n + 1}`;
}

function releaseExists(repo, tag) {
  try {
    execFileSync('gh', ['release', 'view', tag, '--repo', repo], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function ensureRelease(repo, tag, dryRun) {
  if (releaseExists(repo, tag)) return;
  if (dryRun) {
    console.log(`[dry-run] gh release create ${tag} (title "Photo assets ${tag}")`);
    return;
  }
  execFileSync(
    'gh',
    [
      'release',
      'create',
      tag,
      '--repo',
      repo,
      '--title',
      `Photo assets ${tag}`,
      '--notes',
      'Full-resolution image store for calebpollreis.com. Managed by scripts/publish-assets.mjs.',
    ],
    { stdio: 'inherit' },
  );
}

async function measure(file) {
  const meta = await sharp(file).metadata();
  const swap = (meta.orientation ?? 1) >= 5;
  return {
    w: swap ? meta.height : meta.width,
    h: swap ? meta.width : meta.height,
  };
}

async function readExif(file) {
  const ex = await readPhotoExif(file);
  const out = {
    takenAt: ex.takenAt ? ex.takenAt.toISOString() : null,
    iso: ex.iso,
    aperture: ex.aperture,
    shutter: ex.shutter,
    camera: ex.camera,
    lens: ex.lens,
    focal: ex.focal,
  };
  return Object.values(out).some((v) => v != null) ? out : null;
}

function loadManifest() {
  const raw = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  raw.release ??= { active: 'photo-assets', rollAt: 950 };
  raw.assets ??= {};
  return raw;
}

function writeManifest(manifest) {
  const sorted = {
    release: manifest.release,
    assets: Object.fromEntries(
      Object.keys(manifest.assets)
        .sort()
        .map((k) => [k, manifest.assets[k]]),
    ),
  };
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(sorted, null, 2) + '\n');
}

function countForTag(manifest, tag) {
  return Object.values(manifest.assets).filter((a) => a.tag === tag).length;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(
      [
        'node scripts/publish-assets.mjs --dir <folder> [options]',
        '',
        '  --dir <path>        folder of original images (required)',
        '  --namespace <name>  manifest key prefix (default: photography)',
        '  --repo <owner/repo> target repo (default: origin remote)',
        '  --dry-run           print planned uploads, write nothing',
        '  --force             reupload even if the source hash is unchanged',
      ].join('\n'),
    );
    return;
  }
  if (!args.dir) {
    console.error('missing --dir <folder of original images>');
    process.exit(2);
  }
  const dir = path.resolve(args.dir.replace(/^~(?=$|\/)/, os.homedir()));
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error(`not a directory: ${dir}`);
    process.exit(2);
  }

  const repo = args.repo ?? detectRepo();
  const manifest = loadManifest();

  const files = fs
    .readdirSync(dir)
    .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()))
    .sort();
  if (!files.length) {
    console.error(`no images (${[...IMAGE_EXT].join(', ')}) in ${dir}`);
    process.exit(1);
  }

  console.log(`${files.length} candidate file(s) in ${dir}`);
  console.log(`repo ${repo}  active tag ${manifest.release.active} (${countForTag(manifest, manifest.release.active)} assets)`);
  if (args.dryRun) console.log('dry run: no uploads, manifest not written\n');

  const usedNames = new Map();
  for (const rec of Object.values(manifest.assets)) usedNames.set(rec.file, true);

  let uploaded = 0;
  let skipped = 0;

  for (const name of files) {
    const abs = path.join(dir, name);
    const ext = path.extname(name);
    const stem = path.basename(name, ext);
    const key = `${args.namespace}/${stem}`;
    const hash = createHash('sha256').update(fs.readFileSync(abs)).digest('hex');

    const existing = manifest.assets[key];
    if (existing && existing.hash === hash && !args.force) {
      skipped++;
      continue;
    }

    const assetName = sanitizeAssetName(stem, ext);
    if (!existing && usedNames.has(assetName)) {
      console.error(`FAIL ${name}: asset filename "${assetName}" already taken by another key`);
      process.exit(1);
    }

    let tag = existing?.tag ?? manifest.release.active;
    if (!existing && countForTag(manifest, tag) >= manifest.release.rollAt) {
      tag = nextTag(tag);
      manifest.release.active = tag;
      console.log(`rolled active tag to ${tag}`);
    }

    const { w, h } = await measure(abs);
    const exif = await readExif(abs);
    const url = `https://github.com/${repo}/releases/download/${tag}/${assetName}`;

    if (args.dryRun) {
      const tags = exif
        ? [exif.camera, exif.lens, exif.focal, exif.aperture, exif.shutter, exif.iso && `ISO ${exif.iso}`]
            .filter(Boolean)
            .join(' · ')
        : 'no EXIF';
      console.log(`[dry-run] ${existing ? 'reupload' : 'upload  '} ${key}  ->  ${tag}/${assetName}  (${w}x${h})  ${tags}`);
    } else {
      ensureRelease(repo, tag, false);
      const tmp = path.join(os.tmpdir(), assetName);
      fs.copyFileSync(abs, tmp);
      try {
        execFileSync('gh', ['release', 'upload', tag, tmp, '--clobber', '--repo', repo], {
          stdio: 'inherit',
        });
      } finally {
        fs.rmSync(tmp, { force: true });
      }
      console.log(`ok ${key}  ->  ${tag}/${assetName}`);
    }

    manifest.assets[key] = { url, w, h, hash, tag, file: assetName, exif };
    usedNames.set(assetName, true);
    uploaded++;
  }

  if (!args.dryRun && uploaded > 0) writeManifest(manifest);

  console.log(`\n${uploaded} uploaded, ${skipped} unchanged`);
  if (!args.dryRun && uploaded > 0) {
    console.log(`manifest written: ${path.relative(ROOT, MANIFEST_PATH)}  (commit it)`);
  }
}

main().catch((err) => {
  console.error(err.stack ?? String(err));
  process.exit(1);
});
