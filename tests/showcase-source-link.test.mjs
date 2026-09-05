import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('showcase links to repository and exact canonical registry revision', () => {
  const source = fs.readFileSync(path.join(root, 'src', 'main.tsx'), 'utf8');
  assert.match(source, /https:\/\/github\.com\/KAFKA2306\/design/);
  assert.match(source, /tree\/\$\{__DESIGN_COMMIT_SHA__\}\/registry\/ui/);
  assert.doesNotMatch(source, /tree\/main\/registry\/ui/);
});
