import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const app = fs.readFileSync('src/main.tsx', 'utf8');
const globals = fs.readFileSync('styles/globals.css', 'utf8');
const specimen = fs.readFileSync('src/specimen.css', 'utf8');

test('specimen exposes current canonical showcase sections', () => {
  for (const label of ['One system, reusable layers', 'Token authority', 'What consumers get', 'Adopt']) {
    assert.match(app, new RegExp(label));
  }
  assert.match(app, /state-success/);
  assert.match(app, /state-warning/);
  assert.match(app, /state-danger/);
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
