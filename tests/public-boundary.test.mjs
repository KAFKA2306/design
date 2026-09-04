import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('public boundary forbids credentials and private data', () => {
  const policy = fs.readFileSync(path.join(root, 'PUBLIC_RELEASE.md'), 'utf8');
  for (const term of ['credentials', 'private keys', 'raw telemetry', 'proprietary business/data logic']) assert.ok(policy.includes(term));
});
