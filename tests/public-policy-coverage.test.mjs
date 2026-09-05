import assert from 'node:assert/strict';
import test from 'node:test';
import { publicForbiddenPatterns } from '../scripts/public-policy.mjs';

const matches = (value) => publicForbiddenPatterns.some((rule) => new RegExp(rule.source, rule.flags).test(value));
const url = (scheme, host, suffix = '') => `${scheme}://${host}${suffix}`;
const host = (...parts) => parts.join('.');

test('public release policy blocks private network endpoints', () => {
  assert.equal(matches(url('http', host('10', '8', '1', '2'), ':8000/path')), true);
  assert.equal(matches(url('https', host('192', '168', '1', '10'), '/dashboard')), true);
  assert.equal(matches(url('https', host('172', '16', '5', '4'))), true);
  assert.equal(matches(url('http', host('service', 'internal'), ':3000/')), true);
  assert.equal(matches(url('http', ['local', 'host'].join(''), ':5173/')), true);
  assert.equal(matches(url('https', host('example', 'com'), '/')), false);
});
