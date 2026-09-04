import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  structuredViolationBundleFromConformanceErrors,
  validateViolation,
  validateViolationBundle,
} from '../scripts/violation-contract.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
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
  const value = { ...valid, affected_state: 'unverified' };
  delete value.repair_hint;
  assert.deepEqual(validateViolation(value), []);
});

test('converts conformance errors into contract-valid structured violations', () => {
  const bundle = structuredViolationBundleFromConformanceErrors([
    {
      rule: 'duplicate-visual-authority',
      path: 'src/styles.css',
      message: 'raw color literal found; use canonical --k-color-* tokens',
    },
  ]);
  assert.deepEqual(validateViolationBundle(bundle), []);
  assert.equal(bundle.violations[0].criterion, 'duplicate-visual-authority');
  assert.equal(bundle.violations[0].affected_surface, 'src/styles.css');
  assert.match(bundle.violations[0].expected, /canonical design tokens/);
});

test('rejects unknown conformance criteria instead of inventing an expectation', () => {
  assert.throws(
    () => structuredViolationBundleFromConformanceErrors([{ rule: 'unknown-rule', path: 'x', message: 'broken' }]),
    /cannot structure conformance error/,
  );
});

test('violation validator CLI fails loudly when no input file is supplied', () => {
  const result = spawnSync(process.execPath, ['scripts/violation-contract.mjs'], { cwd: root, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Usage: pnpm violations:validate -- <json-file>/);
});
