import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('release policy explicitly scans full reachable history', () => {
  const policy = fs.readFileSync(path.join(root, 'PUBLIC_RELEASE.md'), 'utf8');
  assert.match(policy, /full reachable Git history/);
});
