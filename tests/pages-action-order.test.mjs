import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('Pages actions follow configure then upload then deploy sequence', () => {
  const w = fs.readFileSync(path.join(root, '.github', 'workflows', 'pages.yml'), 'utf8');
  assert.ok(w.indexOf('configure-pages') < w.indexOf('upload-pages-artifact'));
  assert.ok(w.indexOf('upload-pages-artifact') < w.indexOf('deploy-pages'));
});
