import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('showcase displays a useful token palette', () => {
  const source = fs.readFileSync(path.join(root, 'src', 'main.tsx'), 'utf8');
  for (const label of ['Canvas', 'Surface', 'Foreground', 'Primary', 'Accent', 'Success', 'Warning', 'Danger']) assert.ok(source.includes(label));
});
