import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('public policy authority is explicit', () => {
  const check = fs.readFileSync(path.join(root, 'scripts', 'public-policy-check.mjs'), 'utf8');
  const tree = fs.readFileSync(path.join(root, 'scripts', 'public-tree-check.mjs'), 'utf8');
  assert.match(check, /public-policy\.mjs/);
  assert.match(tree, /public-policy\.mjs/);
});
