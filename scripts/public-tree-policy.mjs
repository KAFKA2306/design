import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicForbiddenPatterns } from './public-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const excluded = new Set(['.git', 'node_modules', 'dist']);
const extensions = new Set(['.md', '.json', '.mjs', '.js', '.ts', '.tsx', '.css', '.html', '.yml', '.yaml']);
const policyFiles = new Set(['scripts/public-policy.mjs']);
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (excluded.has(entry.name)) return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
const findings = [];
for (const file of walk(root)) {
  if (!extensions.has(path.extname(file))) continue;
  const relative = path.relative(root, file).replaceAll('\\', '/');
  if (policyFiles.has(relative)) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const rule of publicForbiddenPatterns) if (new RegExp(rule.source, rule.flags).test(text)) findings.push(`${relative}: ${rule.name}`);
}
if (findings.length) {
  console.error(`Public tree policy failed:\n${findings.join('\n')}`);
  process.exit(1);
}
console.log('Public tree policy passed.');
