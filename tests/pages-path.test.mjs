import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Pages build emits repository-scoped asset URLs', async () => {
  await build({ root, logLevel: 'silent' });

  const html = fs.readFileSync(path.join(root, 'dist', 'index.html'), 'utf8');
  assert.match(html, /src="\/design\/assets\/[^"]+\.js"/);
  assert.match(html, /href="\/design\/assets\/[^"]+\.css"/);
  assert.doesNotMatch(html, /(src|href)="\/assets\//);
});
