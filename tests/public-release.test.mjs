import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const privateUrl = ['https:', '', ['fixture', 'internal'].join('.'), 'reference'].join('/');

function createReleaseFixture(t) {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'design-public-release-'));
  t.after(() => fs.rmSync(fixture, { recursive: true, force: true }));
  fs.mkdirSync(path.join(fixture, 'scripts'));
  for (const name of ['public-release-gate.mjs', 'public-tree-check.mjs', 'history-public-scan.mjs', 'public-policy.mjs']) {
    fs.copyFileSync(path.join(root, 'scripts', name), path.join(fixture, 'scripts', name));
  }

  const git = (...args) => execFileSync(
    'git',
    ['-c', 'user.name=Design test', '-c', 'user.email=design-test@example.com', ...args],
    { cwd: fixture, encoding: 'utf8' },
  );
  const release = () => spawnSync(process.execPath, ['scripts/public-release-gate.mjs'], { cwd: fixture, encoding: 'utf8' });
  git('init', '--quiet', '--initial-branch=main');
  git('commit', '--quiet', '--allow-empty', '-m', 'Start with a clean history');
  return { fixture, git, release };
}

test('public release accepts the current tree and blocks private content in the working tree', (t) => {
  assert.doesNotThrow(() => execFileSync(process.execPath, [path.join(root, 'scripts', 'public-tree-check.mjs')], { cwd: root, stdio: 'pipe' }));
  const { fixture, release } = createReleaseFixture(t);
  fs.mkdirSync(path.join(fixture, 'src'));
  fs.writeFileSync(path.join(fixture, 'src', 'reference.md'), privateUrl + '\n');

  const blocked = release();
  assert.equal(blocked.status, 1, blocked.stderr);
  assert.match(blocked.stderr, /Public tree policy failed/);
  assert.match(blocked.stderr, /src\/reference\.md: private-hostname-endpoint/);
});

test('public release blocks private content in another reachable branch', (t) => {
  const { fixture, git, release } = createReleaseFixture(t);
  const clean = release();
  assert.equal(clean.status, 0, clean.stderr);

  git('switch', '--quiet', '--create', 'private-fixture');
  fs.writeFileSync(path.join(fixture, 'reference.md'), privateUrl + '\n');
  git('add', 'reference.md');
  git('commit', '--quiet', '-m', 'Add a synthetic private URL');
  const privateCommit = git('rev-parse', 'HEAD').trim();
  git('switch', '--quiet', 'main');

  const blocked = release();
  assert.equal(blocked.status, 1, blocked.stderr);
  assert.match(blocked.stdout, /Public tree policy passed/);
  assert.match(blocked.stderr, /Public history policy failed/);
  assert.ok(blocked.stderr.includes(`private-hostname-endpoint in ${privateCommit}`), blocked.stderr);
});
