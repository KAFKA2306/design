import fs from 'node:fs';

export const TOKEN_PATH = new URL('../tokens/foundation.tokens.json', import.meta.url);
export const OUTPUT_PATH = new URL('../styles/tokens.css', import.meta.url);

export function readTokens() {
  return JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
}

function isToken(node) {
  return node && typeof node === 'object' && Object.hasOwn(node, '$value');
}

export function flattenTokens(root) {
  const out = new Map();
  function walk(node, path = [], inheritedType = undefined) {
    if (!node || typeof node !== 'object' || Array.isArray(node)) return;
    const type = node.$type ?? inheritedType;
    if (isToken(node)) {
      out.set(path.join('.'), { ...node, $type: node.$type ?? inheritedType });
      return;
    }
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      walk(value, [...path, key], type);
    }
  }
  walk(root);
  return out;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function validateTokens(root) {
  const tokens = flattenTokens(root);
  assert(tokens.size > 0, 'No design tokens found');
  for (const [name, token] of tokens) {
    assert(token.$type, `${name}: missing $type or inherited $type`);
    const value = token.$value;
    if (typeof value === 'string' && /^\{[^{}]+\}$/.test(value)) {
      const target = value.slice(1, -1);
      assert(tokens.has(target), `${name}: alias target does not exist: ${target}`);
      continue;
    }
    switch (token.$type) {
      case 'color':
        assert(value && value.colorSpace === 'srgb', `${name}: colorSpace must be srgb in v0`);
        assert(Array.isArray(value.components) && value.components.length === 3, `${name}: sRGB requires 3 components`);
        value.components.forEach((component) => assert(typeof component === 'number' && component >= 0 && component <= 1, `${name}: invalid sRGB component`));
        assert(/^#[0-9A-Fa-f]{6}$/.test(value.hex ?? ''), `${name}: 6-digit hex fallback required`);
        break;
      case 'dimension':
        assert(value && Number.isFinite(value.value) && ['px', 'rem'].includes(value.unit), `${name}: invalid dimension`);
        break;
      case 'number':
        assert(Number.isFinite(value), `${name}: invalid number`);
        break;
      case 'fontFamily':
        assert((typeof value === 'string' && value.length > 0) || (Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' && item.length > 0)), `${name}: invalid fontFamily`);
        break;
      default:
        throw new Error(`${name}: unsupported token type in v0 validator: ${token.$type}`);
    }
  }
  return tokens;
}

export function resolveToken(name, tokens, stack = []) {
  assert(tokens.has(name), `Unknown token: ${name}`);
  assert(!stack.includes(name), `Alias cycle: ${[...stack, name].join(' -> ')}`);
  const token = tokens.get(name);
  const value = token.$value;
  if (typeof value === 'string' && /^\{[^{}]+\}$/.test(value)) {
    return resolveToken(value.slice(1, -1), tokens, [...stack, name]);
  }
  return { type: token.$type, value };
}

export function cssValue(resolved) {
  const { type, value } = resolved;
  if (type === 'color') return value.hex.toUpperCase();
  if (type === 'dimension') return `${value.value}${value.unit}`;
  if (type === 'number') return String(value);
  if (type === 'fontFamily') {
    const values = Array.isArray(value) ? value : [value];
    return values.map((item) => (/\s/.test(item) ? `"${item}"` : item)).join(', ');
  }
  throw new Error(`Cannot serialize ${type} to CSS`);
}

function cssName(name) {
  return `--k-${name.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`).replace(/\./g, '-')}`;
}

export function generateCss(root) {
  const tokens = validateTokens(root);
  const shared = [];
  const light = [];
  const dark = [];
  for (const name of [...tokens.keys()].sort()) {
    const resolved = resolveToken(name, tokens);
    const line = `  ${cssName(name.replace(/^color\.(light|dark)\./, 'color.'))}: ${cssValue(resolved)};`;
    if (name.startsWith('color.light.')) light.push(line);
    else if (name.startsWith('color.dark.')) dark.push(line);
    else shared.push(`  ${cssName(name)}: ${cssValue(resolved)};`);
  }
  return [
    '/* Generated from tokens/foundation.tokens.json. Do not edit. */',
    ':root {',
    ...shared,
    ...light,
    '}',
    '',
    '[data-theme="dark"] {',
    ...dark,
    '}',
    ''
  ].join('\n');
}
