import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('Pages uses the Node and pnpm versions required by the project', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'pages.yml'), 'utf8');
  assert.match(workflow, /actions\/setup-node@[0-9a-f]{40}/);
  const node = workflow.match(/node-version: '(\d+)\.(\d+)\.(\d+)'/);
  const minimum = pkg.engines.node.match(/^>=(\d+)\.(\d+)(?:\.(\d+))?$/);
  assert.ok(node, 'Pages must pin a Node version');
  assert.ok(minimum, 'package.json must declare the minimum Node version');
  const [major, minor, patch] = node.slice(1).map(Number);
  const [minMajor, minMinor, minPatch] = [minimum[1], minimum[2], minimum[3] ?? '0'].map(Number);
  assert.ok(
    major > minMajor ||
    (major === minMajor && (minor > minMinor || (minor === minMinor && patch >= minPatch))),
    'Pages Node version must meet package.json engines.node',
  );
  assert.ok(workflow.includes(pkg.packageManager));
});
