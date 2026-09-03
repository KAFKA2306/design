import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('Gitleaks action receives repository-scoped GitHub token', () => {
  const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'public-safety.yml'), 'utf8');
  assert.match(workflow, /GITHUB_TOKEN: \$\{\{ secrets\.GITHUB_TOKEN \}\}/);
});
