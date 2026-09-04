import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('tree scan excludes only generated/dependency directories and policy machinery', () => {
  const source = fs.readFileSync(path.join(root, 'scripts', 'public-tree-check.mjs'), 'utf8');
  for (const name of ['.git', 'node_modules', 'dist']) assert.ok(source.includes(name));
  assert.doesNotMatch(source, /src\/|registry\/|fixtures\//);
});
