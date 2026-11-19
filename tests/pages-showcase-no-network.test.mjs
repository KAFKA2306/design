import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('showcase runs without remote data or assets', () => {
  const source = fs.readFileSync(path.join(root, 'src', 'main.tsx'), 'utf8');
  assert.doesNotMatch(source, /fetch\(|WebSocket|EventSource|XMLHttpRequest|axios|cdn\.|unpkg|jsdelivr/);
});
