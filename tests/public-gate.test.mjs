import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('public release gate wires tree and history checks', () => {
  const gate = fs.readFileSync(path.join(root, 'scripts', 'public-release-gate.mjs'), 'utf8');
  assert.match(gate, /public-tree-check\.mjs/);
  assert.match(gate, /history-public-scan\.mjs/);
});
