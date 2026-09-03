import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicForbiddenPatterns } from './public-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const excluded = new Set(['.git', 'node_modules', 'dist']);
const extensions = new Set(['.md', '.json', '.mjs', '.js', '.ts', '.tsx', '.css', '.html', '.yml', '.yaml']);
const authority = new Set(['scripts/public-policy.mjs', 'tests/public-policy.test.mjs']);
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => { if (excluded.has(e.name)) return []; const f = path.join(dir, e.name); return e.isDirectory() ? walk(f) : [f]; }); }
const findings = [];
for (const file of walk(root)) {
  if (!extensions.has(path.extname(file))) continue;
  const relative = path.relative(root, file).replaceAll('\\', '/');
  if (authority.has(relative)) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const rule of publicForbiddenPatterns) if (new RegExp(rule.source, rule.flags).test(text)) findings.push(`${relative}: ${rule.name}`);
}
if (findings.length) { console.error(`Public tree policy failed:\n${findings.join('\n')}`); process.exit(1); }
console.log('Public tree policy passed.');
