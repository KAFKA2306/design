import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('history scanner exits nonzero when findings exist', () => {
  const source = fs.readFileSync(path.join(root, 'scripts', 'history-public-scan.mjs'), 'utf8');
  assert.match(source, /git.*rev-list/);
  assert.match(source, /process\.exit\(1\)/);
});
