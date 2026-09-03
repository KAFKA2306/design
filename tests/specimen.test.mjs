import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const app = fs.readFileSync('src/main.tsx', 'utf8');
const globals = fs.readFileSync('styles/globals.css', 'utf8');
const specimen = fs.readFileSync('src/specimen.css', 'utf8');

test('specimen exposes required foundation sections', () => {
  for (const label of ['Color', 'Typography', 'Density', 'Spacing', 'State', 'Focus']) {
    assert.match(app, new RegExp(`>${label}<`));
  }
});

test('global accessibility rules are present', () => {
  assert.match(globals, /:focus-visible/);
  assert.match(globals, /prefers-reduced-motion/);
});

test('table density and mobile containment use canonical tokens', () => {
  assert.match(specimen, /height: var\(--k-dimension-table-row\)/);
  assert.match(specimen, /overflow-x: auto/);
  assert.match(specimen, /grid-template-columns: 1fr/);
});
