import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, '.github', 'workflows', 'conformance.yml'), 'utf8');

test('public reusable conformance delegates to the consumer managed verifier', () => {
  assert.match(source, /workflow_call:/);
  assert.match(source, /contents: read/);
  assert.match(source, /config\.managedDir/);
  assert.match(source, /managedDir must be a non-empty string/);
  assert.match(source, /managedDir must stay inside consumer_path/);
  assert.match(source, /portable-conformance\.mjs/);
  assert.doesNotMatch(source, /CONSUMER_PATH\/\.kafka-design\/portable-conformance/);
});

test('reusable conformance third-party actions are immutable', () => {
  const uses = [...source.matchAll(/^\s*- uses:\s*([^\s]+)$/gm)].map((match) => match[1]);
  assert.ok(uses.length >= 2);
  for (const value of uses) {
    const ref = value.split('@')[1] ?? '';
    assert.match(ref, /^[0-9a-f]{40}$/);
  }
});
