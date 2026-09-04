import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflowPath = path.join(root, '.github', 'workflows', 'conformance.yml');

function workflow() {
  return fs.readFileSync(workflowPath, 'utf8');
}

test('consumer conformance is exposed as a reusable workflow', () => {
  const source = workflow();
  assert.match(source, /on:\n  workflow_call:/);
  assert.match(source, /consumer_path:/);
  assert.match(source, /permissions:\n  contents: read/);
});

test('reusable workflow follows canonical managedDir and fails on missing adoption files', () => {
  const source = workflow();
  assert.match(source, /set -euo pipefail/);
  assert.match(source, /test -f \"\$CONSUMER_PATH\/design\.config\.json\"/);
  assert.match(source, /test -f \"\$CONSUMER_PATH\/design\.lock\.json\"/);
  assert.match(source, /config\.managedDir/);
  assert.match(source, /managedDir must be a non-empty string/);
  assert.match(source, /managedDir must stay inside consumer_path/);
  assert.match(source, /test -f \"\$CONSUMER_PATH\/\$MANAGED_DIR\/portable-conformance\.mjs\"/);
  assert.match(source, /node \"\$CONSUMER_PATH\/\$MANAGED_DIR\/portable-conformance\.mjs\" --consumer \"\$CONSUMER_PATH\"/);
  assert.doesNotMatch(source, /\$CONSUMER_PATH\/\.kafka-design\/portable-conformance\.mjs/);
});

test('third-party actions stay pinned to full commit SHAs', () => {
  const source = workflow();
  const uses = [...source.matchAll(/^\s*- uses:\s*([^\s]+)$/gm)].map((match) => match[1]);
  assert.ok(uses.length >= 2);
  for (const value of uses) {
    const ref = value.split('@')[1] ?? '';
    assert.match(ref, /^[0-9a-f]{40}$/);
  }
});
