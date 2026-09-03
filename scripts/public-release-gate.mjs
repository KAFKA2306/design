import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const script of ['public-tree-scan.mjs', 'history-public-scan.mjs']) {
  execFileSync(process.execPath, [path.join(root, 'scripts', script)], { cwd: root, stdio: 'inherit' });
}
console.log('Public release policy gate passed.');
