import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('showcase has a single h1 value proposition', () => {
  const source = fs.readFileSync(path.join(root, 'src', 'main.tsx'), 'utf8');
  assert.equal((source.match(/<h1/g) ?? []).length, 1);
});
