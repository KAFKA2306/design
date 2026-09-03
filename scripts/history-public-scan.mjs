import { execFileSync } from 'node:child_process';

const forbidden = [
  { name: 'employer-name', pattern: 'nitto' },
  { name: 'employer-email', pattern: '@nitto\\.com' },
  { name: 'private-person-marker', pattern: '高澤' },
  { name: 'private-machine-marker', pattern: 'PCA[0-9]{3,}' },
];

const commits = execFileSync('git', ['rev-list', '--all'], { encoding: 'utf8' }).trim().split(/\s+/).filter(Boolean);
const findings = [];
for (const commit of commits) {
  for (const rule of forbidden) {
    let output = '';
    try {
      output = execFileSync('git', ['grep', '-n', '-I', '-i', '-E', rule.pattern, commit, '--', '.'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
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
