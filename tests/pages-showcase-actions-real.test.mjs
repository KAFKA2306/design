import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('showcase CTAs target canonical immutable repository paths', () => {
  const source = fs.readFileSync(path.join(root, 'src', 'main.tsx'), 'utf8');
  assert.match(source, /tree\/\$\{__DESIGN_COMMIT_SHA__\}\/registry\/ui/);
  assert.match(source, /blob\/\$\{__DESIGN_COMMIT_SHA__\}\/README\.md#consumer-adoption/);
  assert.doesNotMatch(source, /tree\/main\/registry\/ui/);
});
