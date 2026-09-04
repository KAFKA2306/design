import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('history scan consumes canonical public policy', () => {
  const source = fs.readFileSync(path.join(root, 'scripts', 'history-public-scan.mjs'), 'utf8');
  assert.match(source, /public-policy\.mjs/);
});
