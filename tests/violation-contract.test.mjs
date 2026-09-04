import test from 'node:test';
import assert from 'node:assert/strict';
import { validateViolation, validateViolationBundle } from '../scripts/violation-contract.mjs';

const valid = {
  criterion: 'state.error.visible',
  observed: 'request failure renders an empty panel',
  expected: 'an explicit error state is visible',
  affected_surface: 'DecisionPanel',
  affected_state: 'error',
  severity: 'error',
  repair_hint: 'render the canonical error state',
  verification_method: 'component test',
  evidence: ['tests/decision.test.tsx:42']
};

test('accepts a complete structured violation', () => {
  assert.deepEqual(validateViolation(valid), []);
  assert.deepEqual(validateViolationBundle({ violations: [valid] }), []);
});

test('fails loudly on missing evidence', () => {
  const value = { ...valid };
  delete value.evidence;
  assert.match(validateViolation(value).join('\n'), /missing evidence/);
});

test('rejects invented states and extra authority fields', () => {
  const errors = validateViolation({ ...valid, affected_state: 'success-ish', score: 0.9 });
  assert.match(errors.join('\n'), /affected_state is invalid/);
  assert.match(errors.join('\n'), /unexpected score/);
});

test('allows UNVERIFIED to be represented explicitly as a state', () => {
  assert.deepEqual(validateViolation({ ...valid, affected_state: 'unverified', repair_hint: undefined }).filter((e) => !e.includes('repair_hint')), []);
});
