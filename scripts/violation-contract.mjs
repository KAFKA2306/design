import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const states = new Set(['usable', 'loading', 'empty', 'error', 'unavailable', 'unverified', 'all']);
export const severities = new Set(['error', 'warning', 'info']);
const required = ['criterion', 'observed', 'expected', 'affected_surface', 'affected_state', 'severity', 'verification_method', 'evidence'];
const allowed = new Set([...required, 'repair_hint']);

const expectedByCriterion = Object.freeze({
  'managed-file-drift': 'managed files, lock state, and canonical integration match the pinned design SHA',
  'duplicate-visual-authority': 'visual values use canonical design tokens instead of consumer-owned alternatives',
  'forbidden-visual-effect': 'the consumer uses canonical design styles without prohibited local visual effects',
  'chart-override': 'chart styling and Recharts usage stay inside the canonical Product UI chart adapter',
  'mutable-design-ref': 'design workflow and action references use a full immutable Git SHA',
  'design-owned-component-duplication': 'each design-owned component has one canonical source location',
});

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

export function structuredViolationFromConformanceError(error) {
  if (!error || typeof error !== 'object') throw new Error('conformance error must be an object');
  const criterion = typeof error.rule === 'string' ? error.rule.trim() : '';
  const affectedSurface = typeof error.path === 'string' ? error.path.trim() : '';
  const observed = typeof error.message === 'string' ? error.message.trim() : '';
  const expected = expectedByCriterion[criterion];
  if (!criterion || !affectedSurface || !observed || !expected) {
    throw new Error(`cannot structure conformance error: ${JSON.stringify(error)}`);
  }
  return {
    criterion,
    observed,
    expected,
    affected_surface: affectedSurface,
    affected_state: 'all',
    severity: 'error',
    verification_method: 'design conformance',
    evidence: [`${affectedSurface}: ${observed}`],
  };
}

export function structuredViolationBundleFromConformanceErrors(errors) {
  if (!Array.isArray(errors)) throw new Error('conformance errors must be an array');
  const violations = errors.map(structuredViolationFromConformanceError);
  const contractErrors = validateViolationBundle({ violations });
  if (contractErrors.length) throw new Error(`structured violation contract failure: ${contractErrors.join('; ')}`);
  return { violations };
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  try {
    if (!process.argv[2] || process.argv.length !== 3) throw new Error('Usage: pnpm violations:validate -- <json-file>');
    const input = JSON.parse(await readFile(process.argv[2], 'utf8'));
    const errors = validateViolationBundle(input);
    if (errors.length) {
      console.error(JSON.stringify({ status: 'INVALID', errors }, null, 2));
      process.exitCode = 1;
    } else {
      console.log(JSON.stringify({ status: 'VERIFIED', violations: Array.isArray(input) ? input.length : input.violations.length }));
    }
  } catch (error) {
    console.error(JSON.stringify({ status: 'INVALID', errors: [error.message] }, null, 2));
    process.exitCode = 1;
  }
}
