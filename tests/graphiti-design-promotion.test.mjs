import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { validateDesignPromotion } from '../scripts/graphiti-design-promotion.mjs';

const valid = JSON.parse(fs.readFileSync(new URL('../fixtures/graphiti-design-promotion.json', import.meta.url)));
const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'design-promotion-'));
const registry = Buffer.from(JSON.stringify({ items: [{ name: 'kafka-button', type: 'registry:ui' }] }));
fs.writeFileSync(path.join(repoRoot, 'registry.json'), registry);
const expectedAuthorityHash = createHash('sha1').update(`blob ${registry.length}\0`).update(registry).digest('hex');
const candidate = { ...valid, expectedAuthorityHash };

test.after(() => fs.rmSync(repoRoot, { recursive: true, force: true }));

test('accepts a candidate against the repository file', () => {
  assert.deepEqual(validateDesignPromotion(candidate, { repoRoot }), { ok: true, errors: [] });
});

test('rejects missing provenance', () => {
  const value = structuredClone(candidate);
  delete value.provenance.evidence;
  assert.equal(validateDesignPromotion(value, { repoRoot }).ok, false);
});

test('rejects corrected and superseded knowledge', () => {
  for (const sourceState of ['corrected', 'superseded']) {
    const value = { ...candidate, sourceState };
    assert.match(validateDesignPromotion(value, { repoRoot }).errors.join('\n'), /stale Graphiti knowledge/);
  }
});

test('detects a real authority change, even when the candidate claims a matching hash', () => {
  const value = { ...candidate, currentAuthorityHash: candidate.expectedAuthorityHash };
  fs.writeFileSync(path.join(repoRoot, 'registry.json'), JSON.stringify({ items: [{ name: 'kafka-button', type: 'registry:ui', changed: true }] }));
  try {
    const errors = validateDesignPromotion(value, { repoRoot }).errors.join('\n');
    assert.match(errors, /candidate conflicts with current design authority/);
    assert.match(errors, /currentAuthorityHash must not be supplied/);
  } finally {
    fs.writeFileSync(path.join(repoRoot, 'registry.json'), registry);
  }
});

test('rejects missing target and traversal outside the repository', () => {
  for (const authorityPath of ['registry.json#missing', '../secret.txt']) {
    const value = { ...candidate, target: { ...candidate.target, authorityPath } };
    assert.match(validateDesignPromotion(value, { repoRoot }).errors.join('\n'), /cannot resolve current design authority/);
  }
});

test('rejects candidates that declare themselves adopted', () => {
  const value = { ...candidate, status: 'accepted' };
  assert.match(validateDesignPromotion(value, { repoRoot }).errors.join('\n'), /must remain candidate/);
});

test('rejects non-SHA authority hashes', () => {
  const value = { ...candidate, expectedAuthorityHash: 'registry-v1' };
  assert.match(validateDesignPromotion(value, { repoRoot }).errors.join('\n'), /40-char Git blob SHA/);
});
