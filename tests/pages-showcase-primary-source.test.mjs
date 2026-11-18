import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('the primary showcase action opens the pinned adoption guide', () => {
  const source = fs.readFileSync(path.join(root, 'src', 'main.tsx'), 'utf8');
  assert.match(source, /primaryAction=\{\{ label: 'Use shared styles in your project'.*window\.location\.href = adoptionGuideUrl/);
  assert.match(source, /const adoptionGuideUrl = `[^`]*\$\{__DESIGN_COMMIT_SHA__\}\/README\.md#consumer-adoption`/);
});
