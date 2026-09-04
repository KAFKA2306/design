import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const benchmark = JSON.parse(fs.readFileSync(path.join(root, 'fixtures/benchmark/structured-feedback-pilot.json'), 'utf8'));
const categories = new Set(['contract', 'state', 'accessibility', 'journey']);
const states = new Set(['usable', 'loading', 'empty', 'error', 'unavailable', 'unverified', 'all']);
const severities = new Set(['error', 'warning', 'info']);

test('pilot is synthetic rather than production truth', () => {
  assert.equal(benchmark.status, 'synthetic-pilot');
  assert.equal(benchmark.productionTruth, false);
});

test('A/B/C/D protocol is fixed before results exist', () => {
  assert.deepEqual(benchmark.protocol.conditions, ['generate-only', 'pass-fail', 'structured-one-shot', 'structured-loop']);
  assert.equal(benchmark.protocol.maxRepairIterations, 4);
  assert.ok(benchmark.protocol.primaryMetrics.includes('repair_success'));
  assert.ok(benchmark.protocol.primaryMetrics.includes('overcorrection'));
});

test('pilot has unique machine-checkable ground truth', () => {
  assert.equal(benchmark.tasks.length, 5);
  assert.equal(new Set(benchmark.tasks.map(({ id }) => id)).size, benchmark.tasks.length);
  for (const task of benchmark.tasks) {
    assert.ok(categories.has(task.category));
    assert.ok(task.surface.length > 0 && task.defect.length > 0);
    assert.ok(task.groundTruth.criterion.length > 0);
    assert.ok(states.has(task.groundTruth.affected_state));
    assert.ok(severities.has(task.groundTruth.severity));
    assert.ok(task.groundTruth.verification_method.length > 0);
  }
});
