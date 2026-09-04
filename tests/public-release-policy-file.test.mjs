import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('versioned public release policy exists', () => {
  assert.ok(fs.statSync(path.join(root, 'PUBLIC_RELEASE.md')).isFile());
});
