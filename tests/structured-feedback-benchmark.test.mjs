import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const benchmark = JSON.parse(fs.readFileSync('fixtures/benchmark/structured-feedback-pilot.json', 'utf8'));
const schema = JSON.parse(fs.readFileSync('schemas/structured-feedback-benchmark.schema.json', 'utf8'));

const enumAt = (properties, key) => new Set(properties[key].enum);
const taskProperties = schema.properties.tasks.items.properties;
const groundTruthProperties = taskProperties.groundTruth.properties;

test('benchmark protocol is fixed by one machine-readable schema', () => {
  assert.equal(schema.properties.schemaVersion.const, benchmark.schemaVersion);
  assert.equal(schema.properties.status.const, benchmark.status);
  assert.equal(schema.properties.productionTruth.const, benchmark.productionTruth);
  assert.deepEqual(schema.properties.protocol.properties.conditions.const, benchmark.protocol.conditions);
  assert.equal(schema.properties.protocol.properties.maxRepairIterations.const, benchmark.protocol.maxRepairIterations);

  const metrics = new Set(benchmark.protocol.primaryMetrics);
  for (const metric of schema.properties.protocol.properties.primaryMetrics.items.enum) assert.ok(metrics.has(metric), `missing metric: ${metric}`);
});

test('pilot tasks conform to schema vocabulary and required ground truth', () => {
  assert.ok(benchmark.tasks.length >= schema.properties.tasks.minItems);
  assert.equal(new Set(benchmark.tasks.map(({ id }) => id)).size, benchmark.tasks.length, 'task ids must be unique');

  const categories = enumAt(taskProperties, 'category');
  const states = enumAt(groundTruthProperties, 'affected_state');
  const severities = enumAt(groundTruthProperties, 'severity');
  for (const task of benchmark.tasks) {
    for (const key of schema.properties.tasks.items.required) assert.ok(key in task, `${task.id}: missing ${key}`);
    assert.ok(categories.has(task.category), `${task.id}: invalid category`);
    assert.ok(task.id.trim() && task.surface.trim() && task.defect.trim(), `${task.id}: blank task field`);
    for (const key of taskProperties.groundTruth.required) assert.ok(key in task.groundTruth, `${task.id}: missing groundTruth.${key}`);
    assert.ok(states.has(task.groundTruth.affected_state), `${task.id}: invalid state`);
    assert.ok(severities.has(task.groundTruth.severity), `${task.id}: invalid severity`);
    assert.ok(task.groundTruth.criterion.trim() && task.groundTruth.verification_method.trim(), `${task.id}: blank ground truth`);
  }
});
