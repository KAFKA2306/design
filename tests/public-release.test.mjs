import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('public tree policy passes', () => {
  assert.doesNotThrow(() => execFileSync(process.execPath, [path.join(root, 'scripts', 'public-tree-policy.mjs')], { cwd: root, stdio: 'pipe' }));
});

test('public release policy and history-aware scans stay present', () => {
  assert.ok(fs.existsSync(path.join(root, 'PUBLIC_RELEASE.md')));
  assert.ok(fs.existsSync(path.join(root, 'scripts', 'history-public-scan.mjs')));
  const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'public-safety.yml'), 'utf8');
  assert.match(workflow, /fetch-depth: 0/);
  assert.match(workflow, /history-public-scan\.mjs/);
  assert.match(workflow, /gitleaks\/gitleaks-action/);
});
