import { execFileSync } from 'node:child_process';
import { publicForbiddenPatterns } from './public-policy.mjs';

const commits = execFileSync('git', ['rev-list', '--all'], { encoding: 'utf8' }).trim().split(/\s+/).filter(Boolean);
const findings = [];
const policyDefinitionPaths = [
  ':(exclude)scripts/public-policy.mjs',
  ':(exclude)scripts/history-public-scan.mjs',
  ':(exclude)scripts/public-tree-policy.mjs',
  ':(exclude)tests/public-release.test.mjs',
];

for (const commit of commits) {
  for (const rule of publicForbiddenPatterns) {
    let output = '';
    try {
      output = execFileSync(
        'git',
        ['grep', '-n', '-I', '-i', '-E', rule.source, commit, '--', '.', ...policyDefinitionPaths],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
      );
    } catch (error) {
      if (error.status !== 1) throw error;
    }
    if (output.trim()) findings.push(`${rule.name} in ${commit}\n${output.trim()}`);
  }
}
if (findings.length) {
  console.error(`Public history policy failed:\n${findings.join('\n\n')}`);
  process.exit(1);
}
console.log(`Public history policy passed across ${commits.length} commit(s).`);
