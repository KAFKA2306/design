import assert from 'node:assert/strict';
import test from 'node:test';
import { publicForbiddenPatterns } from '../scripts/public-policy.mjs';

const matches = (value) => publicForbiddenPatterns.some((rule) => new RegExp(rule.source, rule.flags).test(value));

test('public release policy blocks private network endpoints', () => {
  assert.equal(matches(`http${'://'}10.8.1.2:8000/path`), true);
  assert.equal(matches(`https${'://'}192.168.1.10/dashboard`), true);
  assert.equal(matches(`https${'://'}172.16.5.4`), true);
  assert.equal(matches(`http${'://'}service.internal:3000/`), true);
  assert.equal(matches(`http${'://'}localhost:5173/`), true);
  assert.equal(matches(`https${'://'}example.com/`), false);
});
