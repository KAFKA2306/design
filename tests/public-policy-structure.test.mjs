import assert from 'node:assert/strict';
import test from 'node:test';
import { publicForbiddenPatterns } from '../scripts/public-policy.mjs';

test('public confidentiality policy remains explicit and non-empty', () => {
  assert.ok(publicForbiddenPatterns.length >= 4);
  for (const rule of publicForbiddenPatterns) {
    assert.equal(typeof rule.name, 'string');
    assert.ok(rule.name.length > 0);
    assert.doesNotThrow(() => new RegExp(rule.source, rule.flags));
  }
});
