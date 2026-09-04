import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkConsumer } from '../scripts/design-conformance.mjs';
import { syncConsumer } from '../scripts/design-sync.mjs';
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

function makeConsumer() {
  const consumer = fs.mkdtempSync(path.join(os.tmpdir(), 'kafka-violation-'));
  fs.mkdirSync(path.join(consumer, 'src'), { recursive: true });
  fs.writeFileSync(path.join(consumer, 'src', 'styles.css'), 'body { margin: 0; }\n');
  fs.writeFileSync(path.join(consumer, 'design.config.json'), JSON.stringify({
    schemaVersion: 1,
    designSha: spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).stdout.trim(),
    preset: 'base',
    cssEntry: 'src/styles.css',
  }, null, 2));
  return consumer;
}

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
    { rule: 'duplicate-visual-authority', path: 'src/styles.css', message: 'raw color literal found; use canonical --k-color-* tokens' },
  ]);
  assert.deepEqual(validateViolationBundle(bundle), []);
  assert.equal(bundle.violations[0].criterion, 'duplicate-visual-authority');
  assert.equal(bundle.violations[0].affected_surface, 'src/styles.css');
  assert.match(bundle.violations[0].expected, /canonical design tokens/);
});

test('every emitted conformance criterion has a structured violation contract', () => {
  const consumer = makeConsumer();
  try {
    syncConsumer(consumer);
    fs.appendFileSync(path.join(consumer, 'src', 'styles.css'), '\n.bad { --surface-color: #fff; background: #fff; box-shadow: 0 1px 3px #000; }\n');
    const workflow = path.join(consumer, '.github', 'workflows', 'design.yml');
    fs.mkdirSync(path.dirname(workflow), { recursive: true });
    fs.writeFileSync(workflow, 'jobs:\n  design:\n    uses: KAFKA2306/design/.github/workflows/conformance.yml@main\n');
    for (const relativePath of ['src/one/button.tsx', 'src/two/button.tsx']) {
      const filePath = path.join(consumer, relativePath);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, 'export const Button = () => null\n');
    }
    fs.writeFileSync(path.join(consumer, 'src', 'chart.tsx'), "import { LineChart } from 'recharts'\nexport { LineChart }\n");
    fs.appendFileSync(path.join(consumer, '.kafka-design', 'kafka-tokens.css'), '\n/* drift */\n');
    const errors = checkConsumer(consumer);
    assert.ok(errors.length >= 6);
    const bundle = structuredViolationBundleFromConformanceErrors(errors);
    assert.deepEqual(validateViolationBundle(bundle), []);
    assert.deepEqual(new Set(bundle.violations.map(({ criterion }) => criterion)), new Set(errors.map(({ rule }) => rule)));
  } finally {
    fs.rmSync(consumer, { recursive: true, force: true });
  }
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
