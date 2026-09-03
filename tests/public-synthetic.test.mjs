import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('reference content remains explicitly synthetic', () => {
  const fixture = fs.readFileSync(path.join(root, 'fixtures', 'content', 'contract-example.json'), 'utf8');
  assert.match(fixture, /Synthetic/);
  assert.match(fixture, /not be presented as production evidence/);
});
