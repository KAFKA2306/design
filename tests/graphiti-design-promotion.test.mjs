import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateDesignPromotion } from '../scripts/graphiti-design-promotion.mjs';

const valid = JSON.parse(fs.readFileSync(new URL('../fixtures/graphiti-design-promotion.json', import.meta.url)));

test('accepts an active candidate with complete provenance and matching authority', () => {
  assert.deepEqual(validateDesignPromotion(valid), { ok: true, errors: [] });
});

test('rejects missing provenance', () => {
  const value = structuredClone(valid);
  delete value.provenance.evidence;
  assert.equal(validateDesignPromotion(value).ok, false);
});

test('rejects corrected and superseded knowledge', () => {
  for (const sourceState of ['corrected', 'superseded']) {
    const value = structuredClone(valid);
    value.sourceState = sourceState;
    assert.match(validateDesignPromotion(value).errors.join('\n'), /stale Graphiti knowledge/);
  }
});

test('detects conflict with current design authority', () => {
  const value = structuredClone(valid);
  value.currentAuthorityHash = 'registry-v2';
  assert.match(validateDesignPromotion(value).errors.join('\n'), /conflicts with current design authority/);
});

test('does not let Graphiti input declare itself adopted authority', () => {
  const value = structuredClone(valid);
  value.status = 'accepted';
  assert.match(validateDesignPromotion(value).errors.join('\n'), /must remain candidate/);
});
