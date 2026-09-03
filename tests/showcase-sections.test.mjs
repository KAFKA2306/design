import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('showcase covers system tokens guarantees and adoption', () => {
  const source = fs.readFileSync(path.join(root, 'src', 'main.tsx'), 'utf8');
  for (const heading of ['One system, reusable layers', 'Token authority', 'What consumers get', 'Adopt']) assert.ok(source.includes(heading));
});
