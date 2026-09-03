import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('Gitleaks configuration extends maintained defaults', () => {
  const config = fs.readFileSync(path.join(root, '.gitleaks.toml'), 'utf8');
  assert.match(config, /useDefault = true/);
});
