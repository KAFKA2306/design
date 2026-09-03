import assert from 'node:assert/strict';
import test from 'node:test';
test('expected project Pages URL is stable', () => {
  assert.equal('https://kafka2306.github.io/design/', 'https://kafka2306.github.io/design/');
});
