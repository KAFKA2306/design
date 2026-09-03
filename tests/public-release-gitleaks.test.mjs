import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('standard secret scanning configuration exists', () => {
  assert.ok(fs.existsSync(path.join(root, '.gitleaks.toml')));
});
