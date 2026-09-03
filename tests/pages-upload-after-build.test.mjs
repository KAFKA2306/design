import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('Pages artifact upload occurs after build', () => {
  const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'pages.yml'), 'utf8');
  assert.ok(workflow.indexOf('upload-pages-artifact') > workflow.indexOf('name: Build'));
});
