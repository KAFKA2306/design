import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const excluded = new Set(['.git', 'node_modules', 'dist']);
const textExtensions = new Set(['.md', '.json', '.mjs', '.js', '.ts', '.tsx', '.css', '.html', '.yml', '.yaml']);

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (excluded.has(entry.name)) return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? files(full) : [full];
  });
}

test('public tree contains no known private-context markers', () => {
  const forbidden = [/nitto/i, /@nitto\.com/i, /\\b高澤\\b/, /PCA\\d{3,}/i];
  const findings = [];
  for (const file of files(root)) {
    if (!textExtensions.has(path.extname(file))) continue;
    const relative = path.relative(root, file);
    const text = fs.readFileSync(file, 'utf8');
    for (const pattern of forbidden) if (pattern.test(text)) findings.push(`${relative}: ${pattern}`);
  }
  assert.deepEqual(findings, []);
});

test('public release policy and history-aware secret scan stay present', () => {
  assert.ok(fs.existsSync(path.join(root, 'PUBLIC_RELEASE.md')));
  const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'public-safety.yml'), 'utf8');
  assert.match(workflow, /fetch-depth: 0/);
  assert.match(workflow, /gitleaks\/gitleaks-action/);
});
