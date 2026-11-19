import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test('Pages validates generated tokens and content before build', () => {
  const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'pages.yml'), 'utf8');
  const install = workflow.indexOf('run: pnpm install --frozen-lockfile');
  const build = workflow.indexOf('run: pnpm build');
  assert.ok(install >= 0 && install < build);
  const beforeBuild = workflow.slice(install, build);
  for (const command of ['tokens:validate', 'tokens:check', 'content:validate', 'pnpm lint', 'pnpm test']) {
    assert.ok(beforeBuild.includes(command), `${command} must run after dependency installation and before the Pages build`);
  }
});
