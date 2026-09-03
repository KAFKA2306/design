import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const schemaPath = path.join(root, 'artifacts', 'content.schema.json');

function typeMatches(value, expected) {
  if (expected === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
  if (expected === 'array') return Array.isArray(value);
  if (expected === 'number') return typeof value === 'number' && Number.isFinite(value);
  return typeof value === expected;
}

function validateNode(value, schema, location, errors) {
  if (schema.type && !typeMatches(value, schema.type)) {
    errors.push(`${location}: expected ${schema.type}`);
    return;
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${location}: must be one of ${schema.enum.join(', ')}`);
  }

  if (typeof value === 'string') {
    if (schema.minLength && value.length < schema.minLength) errors.push(`${location}: must not be empty`);
    if (schema.pattern && !(new RegExp(schema.pattern)).test(value)) errors.push(`${location}: does not match ${schema.pattern}`);
  }

  if (Array.isArray(value)) {
    if (schema.minItems && value.length < schema.minItems) errors.push(`${location}: expected at least ${schema.minItems} item(s)`);
    if (schema.items) value.forEach((item, index) => validateNode(item, schema.items, `${location}[${index}]`, errors));
  }

  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    for (const key of schema.required ?? []) {
      if (!(key in value)) errors.push(`${location}.${key}: required`);
    }

    const properties = schema.properties ?? {};
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!(key in properties)) errors.push(`${location}.${key}: unknown property`);
      }
    }

    for (const [key, childSchema] of Object.entries(properties)) {
      if (key in value) validateNode(value[key], childSchema, `${location}.${key}`, errors);
    }
  }

  if (schema.oneOf) {
    const matches = schema.oneOf.filter((branch) => {
      const branchErrors = [];
      validateNode(value, branch, location, branchErrors);
      return branchErrors.length === 0;
    });
    if (matches.length !== 1) errors.push(`${location}: must match exactly one oneOf branch`);
  }
}

export function loadContentSchema() {
  return JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
}

export function validateArtifactContent(value, schema = loadContentSchema()) {
  const errors = [];
  validateNode(value, schema, '$', errors);
  return errors;
}

export function validateArtifactFile(filePath) {
  const value = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const errors = validateArtifactContent(value);
  if (errors.length) {
    throw new Error(`Artifact content validation failed for ${filePath}:\n${errors.map((error) => `- ${error}`).join('\n')}`);
  }
  return value;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const files = process.argv.slice(2);
  if (!files.length) {
    console.error('Usage: node scripts/content-contract.mjs <content.json> [...]');
    process.exit(2);
  }
  for (const file of files) validateArtifactFile(path.resolve(file));
  console.log(`Validated ${files.length} artifact content file(s).`);
}
