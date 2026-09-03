import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('showcase GitHub links stay within design repository', () => {
  const source = fs.readFileSync(path.join(root, 'src', 'main.tsx'), 'utf8');
  const urls = source.match(/https:\/\/github\.com\/[^'" ]+/g) ?? [];
  assert.ok(urls.length >= 2);
  assert.ok(urls.every((url) => url.startsWith('https://github.com/KAFKA2306/design')));
});
