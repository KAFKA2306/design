import fs from 'node:fs';

const registry = JSON.parse(fs.readFileSync('registry.json', 'utf8'));

function fail(message) {
  console.error(`registry: ${message}`);
  process.exit(1);
}

if (registry.$schema !== 'https://ui.shadcn.com/schema/registry.json') fail('unexpected schema URL');
if (!Array.isArray(registry.items) || registry.items.length === 0) fail('items must not be empty');

const names = new Set();
for (const item of registry.items) {
  if (!item.name || names.has(item.name)) fail(`duplicate or missing item name: ${item.name ?? '<missing>'}`);
  names.add(item.name);
  if (!Array.isArray(item.files) || item.files.length === 0) fail(`${item.name}: files must not be empty`);
  const targets = new Set();
  for (const file of item.files) {
    if (!file.path || !fs.existsSync(file.path)) fail(`${item.name}: missing source file ${file.path ?? '<missing>'}`);
    if (file.path.startsWith('tokens/')) fail(`${item.name}: DTCG token authority must not be copied to consumers`);
    if (!file.target) fail(`${item.name}: registry:file must have an explicit target`);
    if (targets.has(file.target)) fail(`${item.name}: duplicate target ${file.target}`);
    targets.add(file.target);
  }
}

const base = registry.items.find((item) => item.name === 'kafka-base');
if (!base) fail('kafka-base is required');
if (base.type !== 'registry:base') fail('kafka-base must use registry:base');
if (base.extends !== 'none') fail('kafka-base must not inherit a second visual authority');
if (base.config?.iconLibrary !== 'lucide') fail('kafka-base must pin Lucide');
if (base.config?.tsx !== true || base.config?.rsc !== false) fail('kafka-base must pin TypeScript and non-RSC v0 consumer mode');
for (const dependency of ['@base-ui/react@1.7.0', 'lucide-react@1.39.0']) {
  if (!base.dependencies?.includes(dependency)) fail(`kafka-base missing pinned dependency ${dependency}`);
}
for (const source of ['styles/tokens.css', 'styles/globals.css']) {
  if (!base.files.some((file) => file.path === source)) fail(`kafka-base missing ${source}`);
}

console.log(`registry: ${registry.items.length} item(s), ${base.files.length} canonical files checked`);
