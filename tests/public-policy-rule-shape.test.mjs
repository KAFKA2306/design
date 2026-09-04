import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('policy checker requires rule names and sources', () => {
  const source = fs.readFileSync(path.join(root, 'scripts', 'public-policy-check.mjs'), 'utf8');
  assert.match(source, /rule\.name/);
  assert.match(source, /rule\.source/);
});
