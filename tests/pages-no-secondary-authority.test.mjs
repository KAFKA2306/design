import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('Pages app imports canonical registry Product UI instead of a local copy', () => {
  const source = fs.readFileSync(path.join(root, 'src', 'main.tsx'), 'utf8');
  assert.match(source, /\.\.\/registry\/ui\/product\/decision/);
  assert.doesNotMatch(source, /\.\/components\/DecisionPanel/);
});
