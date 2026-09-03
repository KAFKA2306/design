import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const excluded = new Set(['.git', 'node_modules', 'dist']);
const extensions = new Set(['.md', '.json', '.mjs', '.js', '.ts', '.tsx', '.css', '.html', '.yml', '.yaml']);
const forbidden = [/nitto/i, /@nitto\.com/i, /\b高澤\b/, /PCA\d{3,}/i];
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
  const relative = path.relative(root, file);
  const text = fs.readFileSync(file, 'utf8');
  for (const pattern of forbidden) if (pattern.test(text)) findings.push(`${relative}: ${pattern}`);
}
if (findings.length) {
  console.error(`Public tree policy failed:\n${findings.join('\n')}`);
  process.exit(1);
}
console.log('Public tree policy passed.');
