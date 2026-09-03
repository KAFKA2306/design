import assert from 'node:assert/strict';
import test from 'node:test';
import { publicForbiddenPatterns } from '../scripts/public-policy.mjs';

test('public confidentiality policy covers employer, person, and machine markers', () => {
  const names = publicForbiddenPatterns.map((rule) => rule.name);
  assert.deepEqual(names, ['employer-name', 'employer-email', 'private-person-marker', 'private-machine-marker']);
});
