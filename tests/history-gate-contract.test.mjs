import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('safety workflow checks out full history', () => {
  const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'public-safety.yml'), 'utf8');
  assert.match(workflow, /fetch-depth: 0/);
  assert.match(workflow, /history-public-scan\.mjs/);
});
