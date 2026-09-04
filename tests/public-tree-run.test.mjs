import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('public tree scan passes', () => {
  const output = execFileSync(process.execPath, [path.join(root, 'scripts', 'public-tree-check.mjs')], { cwd: root, encoding: 'utf8' });
  assert.match(output, /Public tree policy passed/);
});
