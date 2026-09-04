import { readFile } from 'node:fs/promises';

export const states = new Set(['usable', 'loading', 'empty', 'error', 'unavailable', 'unverified', 'all']);
export const severities = new Set(['error', 'warning', 'info']);
const required = ['criterion', 'observed', 'expected', 'affected_surface', 'affected_state', 'severity', 'verification_method', 'evidence'];
const allowed = new Set([...required, 'repair_hint']);

export function validateViolation(value) {
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ['violation must be an object'];
  for (const key of required) if (!(key in value)) errors.push(`missing ${key}`);
  for (const key of Object.keys(value)) if (!allowed.has(key)) errors.push(`unexpected ${key}`);
  for (const key of ['criterion', 'observed', 'expected', 'affected_surface', 'verification_method']) {
    if (key in value && (typeof value[key] !== 'string' || value[key].trim() === '')) errors.push(`${key} must be a non-empty string`);
  }
  if ('affected_state' in value && !states.has(value.affected_state)) errors.push('affected_state is invalid');
  if ('severity' in value && !severities.has(value.severity)) errors.push('severity is invalid');
  if ('repair_hint' in value && (typeof value.repair_hint !== 'string' || value.repair_hint.trim() === '')) errors.push('repair_hint must be a non-empty string');
  if ('evidence' in value && (!Array.isArray(value.evidence) || value.evidence.length === 0 || value.evidence.some((item) => typeof item !== 'string' || item.trim() === ''))) errors.push('evidence must contain non-empty strings');
  return errors;
}

export function validateViolationBundle(value) {
  const violations = Array.isArray(value) ? value : value?.violations;
  if (!Array.isArray(violations)) return ['input must be an array or { violations: [] }'];
  return violations.flatMap((item, index) => validateViolation(item).map((error) => `violations[${index}]: ${error}`));
}

if (process.argv[1]?.endsWith('violation-contract.mjs') && process.argv[2]) {
  const input = JSON.parse(await readFile(process.argv[2], 'utf8'));
  const errors = validateViolationBundle(input);
  if (errors.length) {
    console.error(JSON.stringify({ status: 'INVALID', errors }, null, 2));
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({ status: 'VERIFIED', violations: Array.isArray(input) ? input.length : input.violations.length }));
  }
}
