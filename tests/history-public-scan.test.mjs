import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('reachable Git history contains no configured private-context markers', () => {
  const output = execFileSync(process.execPath, [path.join(root, 'scripts', 'history-public-scan.mjs')], { cwd: root, encoding: 'utf8' });
  assert.match(output, /Public history policy passed/);
});
