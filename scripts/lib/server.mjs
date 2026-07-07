// Shared preview-server management for the verify scripts.
// Reuses an already-running dev server on 4321 when present; otherwise starts
// `astro preview` on PORT (default 4331) and guarantees it is killed on exit.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

async function isUp(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function ensureServer({ port = 4331 } = {}) {
  if (await isUp('http://localhost:4321/')) {
    return { baseUrl: 'http://localhost:4321', stop: async () => {} };
  }
  if (!existsSync(path.join(projectRoot, 'dist'))) {
    throw new Error('No dev server on :4321 and no dist/ build. Run `npm run dev` or `npm run build` first.');
  }
  const proc = spawn('npx', ['astro', 'preview', '--port', String(port)], {
    cwd: projectRoot,
    stdio: 'ignore',
    detached: true,
  });
  const baseUrl = `http://localhost:${port}`;
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    if (await isUp(`${baseUrl}/`)) {
      return {
        baseUrl,
        stop: async () => {
          try { process.kill(-proc.pid, 'SIGTERM'); } catch { /* already gone */ }
        },
      };
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  try { process.kill(-proc.pid, 'SIGTERM'); } catch { /* already gone */ }
  throw new Error(`astro preview did not become ready on :${port} within 20s`);
}
