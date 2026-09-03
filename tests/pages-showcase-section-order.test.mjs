import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('showcase journey moves from system to tokens to guarantees to adoption', () => {
  const source = fs.readFileSync(path.join(root, 'src', 'main.tsx'), 'utf8');
  const headings = ['One system, reusable layers', 'Token authority', 'What consumers get', '>Adopt<'];
  const positions = headings.map((heading) => source.indexOf(heading));
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
});
