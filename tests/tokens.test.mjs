import assert from 'node:assert/strict';
import test from 'node:test';
import { flattenTokens, generateCss, readTokens, resolveToken, validateTokens } from '../scripts/token-lib.mjs';

test('v0 visual anchors are canonical token values', () => {
  const root = readTokens();
  const tokens = validateTokens(root);
  assert.equal(resolveToken('color.light.canvas', tokens).value.hex, '#F7F5EF');
  assert.equal(resolveToken('color.light.foreground', tokens).value.hex, '#17233F');
  assert.equal(resolveToken('color.light.border', tokens).value.hex, '#D9D6CE');
  assert.equal(resolveToken('color.light.primary', tokens).value.hex, '#2563EB');
  assert.equal(resolveToken('color.light.accent', tokens).value.hex, '#7DD3FC');
  assert.deepEqual(resolveToken('dimension.tableRow', tokens).value, { value: 30, unit: 'px' });
  assert.deepEqual(resolveToken('dimension.radius', tokens).value, { value: 2, unit: 'px' });
  assert.equal(resolveToken('number.shadowOpacity', tokens).value, 0);
});

test('aliases resolve without a second color authority', () => {
  const tokens = flattenTokens(readTokens());
  assert.equal(resolveToken('color.light.focus', tokens).value.hex, '#2563EB');
});

test('generated CSS is deterministic', () => {
  const root = readTokens();
  assert.equal(generateCss(root), generateCss(JSON.parse(JSON.stringify(root))));
});

test('invalid aliases fail loudly', () => {
  const root = readTokens();
  root.color.light.focus.$value = '{color.light.doesNotExist}';
  assert.throws(() => validateTokens(root), /alias target does not exist/);
});

test('malformed colors fail loudly', () => {
  const root = readTokens();
  root.color.light.canvas.$value.components = [2, 0, 0];
  assert.throws(() => validateTokens(root), /invalid sRGB component/);
});
