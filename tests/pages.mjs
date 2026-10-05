// No browser dependencies: reproduce URL resolution for root and project Pages sites.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { root, output } from '../scripts/lib/paths.mjs';

function run(script, base) {
  execFileSync(process.execPath, [path.join(root, script)], {
    cwd: root, env: { ...process.env, SITE_BASE_PATH: base }, stdio: 'inherit'
  });
}

function exactFile(relative) {
  let directory = output;
  for (const segment of relative.split('/')) {
    assert.ok(fs.readdirSync(directory).includes(segment), `Missing or incorrectly cased file: ${relative}`);
    directory = path.join(directory, segment);
  }
  assert.ok(fs.statSync(directory).isFile(), `Not a public file: ${relative}`);
}

try {
  for (const base of ['/', '/uiux_website/']) {
    run('scripts/build.mjs', base);
    run('scripts/check.mjs', base);
    assert.ok(fs.existsSync(path.join(output, '.nojekyll')));
    const origin = 'https://example.github.io';
    for (const file of fs.readdirSync(output).filter(name => name.endsWith('.html'))) {
      const html = fs.readFileSync(path.join(output, file), 'utf8');
      // The 404 document is served at the requested (possibly nested) missing URL.
      const requested = new URL(base + (file === '404.html' ? 'missing/deep/page' : file), origin);
      const declaredBase = html.match(/<base href="([^"]+)"/);
      if (file === '404.html') assert.equal(declaredBase?.[1], base);
      const documentBase = declaredBase ? new URL(declaredBase[1], requested) : requested;
      for (const [, value] of html.replace(/<base\b[^>]*>/g, '').matchAll(/\b(?:href|src)="([^"]+)"/g)) {
        const url = new URL(value, documentBase);
        if (url.origin !== origin) continue;
        assert.ok(url.pathname.startsWith(base), `Link escapes project path: ${file}: ${value}`);
        exactFile(decodeURIComponent(url.pathname.slice(base.length)) || 'index.html');
      }
    }
    const pdf = fs.readFileSync(path.join(output, 'assets/documents/aditya-nair-resume.pdf'));
    assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
    console.log(`Passed Pages hosting at ${base}: links, filename case, nested 404 recovery, and résumé.`);
  }
} finally {
  // Leave the local preview (or an explicitly configured build) usable after testing.
  run('scripts/build.mjs', process.env.SITE_BASE_PATH || '/');
}
