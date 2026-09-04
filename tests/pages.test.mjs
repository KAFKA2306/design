import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Pages deploys verified /design/ build', () => {
  const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'pages.yml'), 'utf8');
  assert.match(workflow, /pnpm test/);
  assert.match(workflow, /--base=\/design\//);
  assert.match(workflow, /actions\/upload-pages-artifact/);
  assert.match(workflow, /actions\/deploy-pages/);
  assert.match(workflow, /needs: verify-and-build/);
});

test('public specimen renders canonical Product UI instead of a Pages-only mock', () => {
  const source = fs.readFileSync(path.join(root, 'src', 'main.tsx'), 'utf8');
  assert.match(source, /from '\.\.\/registry\/ui\/product\/decision'/);
  assert.match(source, /<DecisionPanel/);
  assert.match(source, /View source on GitHub/);
});
