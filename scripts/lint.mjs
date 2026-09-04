import fs from 'node:fs';
import path from 'node:path';

const roots = ['styles', 'src', 'registry'];
const files = [];
for (const root of roots) {
  for (const entry of fs.readdirSync(root, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const full = path.join(entry.parentPath ?? entry.path, entry.name);
    if (/\.(css|ts|tsx)$/.test(full)) files.push(full);
  }
}

const forbidden = [
  ['decorative gradient', /(?:linear|radial|conic)-gradient\s*\(/i],
  ['glow/text shadow', /text-shadow\s*:/i],
  ['box shadow', /box-shadow\s*:/i],
  ['glass/backdrop blur', /backdrop-filter\s*:/i],
];

const violations = [];
for (const file of files) {
  if (file.endsWith(path.join('styles', 'tokens.css'))) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const [rule, pattern] of forbidden) {
    if (pattern.test(text)) violations.push(`${file}: ${rule}`);
  }
  if (/#[0-9a-fA-F]{3,8}\b/.test(text)) violations.push(`${file}: raw color literal outside generated tokens`);
}

for (const entry of fs.readdirSync('.github/workflows', { withFileTypes: true })) {
  if (!entry.isFile() || !/\.ya?ml$/.test(entry.name)) continue;
  const file = path.join('.github/workflows', entry.name);
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(/^\s*-?\s*uses:\s*([^\s#]+).*$/gm)) {
    const reference = match[1];
    if (!/@[0-9a-f]{40}$/.test(reference)) violations.push(`${file}: action reference must use a full immutable SHA (${reference})`);
  }
}

const globals = fs.readFileSync('styles/globals.css', 'utf8');
if (!globals.includes(':focus-visible')) violations.push('styles/globals.css: missing :focus-visible');
if (!globals.includes('prefers-reduced-motion')) violations.push('styles/globals.css: missing prefers-reduced-motion');

if (violations.length) {
  console.error(violations.join('\n'));
  process.exit(1);
}
console.log(`lint: ${files.length} source/style files checked`);
