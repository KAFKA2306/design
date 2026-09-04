import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('public policy exports a frozen rule set', () => {
  const source = fs.readFileSync(path.join(root, 'scripts', 'public-policy.mjs'), 'utf8');
  assert.match(source, /Object\.freeze/);
});
