import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadContentSchema, validateArtifactContent } from '../scripts/content-contract.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixturePath = path.join(root, 'fixtures', 'content', 'contract-example.json');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const schema = loadContentSchema();

const clone = (value) => structuredClone(value);

test('canonical contract fixture validates', () => {
  assert.deepEqual(validateArtifactContent(fixture, schema), []);
});

test('invalid semantic kind fails loudly', () => {
  const invalid = clone(fixture);
  invalid.facts[0].kind = 'verified';
  assert.match(validateArtifactContent(invalid, schema).join('\n'), /must be one of actual, forecast, hypothesis, unverified/);
});

test('numeric fact without unit is invalid', () => {
  const invalid = clone(fixture);
  delete invalid.facts[0].unit;
  assert.match(validateArtifactContent(invalid, schema).join('\n'), /must match exactly one oneOf branch/);
});

test('fact cannot silently contain both numeric and text payloads', () => {
  const invalid = clone(fixture);
  invalid.facts[0].text = 'conflicting representation';
  assert.match(validateArtifactContent(invalid, schema).join('\n'), /must match exactly one oneOf branch/);
});

test('unknown fields fail instead of becoming hidden format-specific authority', () => {
  const invalid = clone(fixture);
  invalid.facts[0].statusBadge = 'green';
  assert.match(validateArtifactContent(invalid, schema).join('\n'), /statusBadge: unknown property/);
});

test('source URL is optional and is never fabricated', () => {
  const withoutUrl = clone(fixture);
  assert.equal(withoutUrl.facts[0].source.url, undefined);
  assert.deepEqual(validateArtifactContent(withoutUrl, schema), []);
});
