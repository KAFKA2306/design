import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('Pages validates generated tokens and content before build', () => {
  const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'pages.yml'), 'utf8');
  for (const command of ['tokens:validate', 'tokens:check', 'content:validate', 'pnpm lint', 'pnpm test']) assert.ok(workflow.includes(command));
});
