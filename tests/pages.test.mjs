import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('Pages deploys validated production build', () => {
  const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'pages.yml'), 'utf8');
  assert.match(workflow, /pnpm test/);
  assert.match(workflow, /run: pnpm build/);
  assert.match(workflow, /actions\/upload-pages-artifact/);
  assert.match(workflow, /actions\/deploy-pages/);
  assert.match(workflow, /needs: verify-and-build/);
});

test('Pages build and runtime expose the same exact commit provenance', () => {
  const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'pages.yml'), 'utf8');
  const vite = fs.readFileSync(path.join(root, 'vite.config.mjs'), 'utf8');
  assert.match(vite, /fileName: 'provenance\.json'/);
  assert.match(vite, /schemaVersion: 1, designSha: commitSha/);
  assert.match(workflow, /provenance\.json/);
  assert.match(workflow, /EXPECTED_SHA: \$\{\{ github\.sha \}\}/);
  assert.match(workflow, /p\.designSha !== process\.env\.EXPECTED_SHA/);
  assert.match(workflow, /exit 1/);
});

test('public specimen renders canonical Product UI instead of a Pages-only mock', () => {
  const source = fs.readFileSync(path.join(root, 'src', 'main.tsx'), 'utf8');
  assert.match(source, /from '\.\.\/registry\/ui\/product\/decision'/);
  assert.match(source, /<DecisionPanel/);
  assert.match(source, /View source on GitHub/);
});

test('public specimen exposes exact deployed source provenance', () => {
  const source = fs.readFileSync(path.join(root, 'src', 'main.tsx'), 'utf8');
  const vite = fs.readFileSync(path.join(root, 'vite.config.mjs'), 'utf8');
  assert.match(vite, /git', \['rev-parse', 'HEAD'\]/);
  assert.match(vite, /\^\[0-9a-f\]\{40\}\$/);
  assert.match(vite, /__DESIGN_COMMIT_SHA__/);
  assert.match(source, /Deployed commit/);
  assert.match(source, /design\/commit\/\$\{__DESIGN_COMMIT_SHA__\}/);
  assert.match(source, /design\/tree\/\$\{__DESIGN_COMMIT_SHA__\}\/registry\/ui/);
  assert.doesNotMatch(source, /design\/tree\/main\/registry\/ui/);
});
