import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = fileURLToPath(new URL('../', import.meta.url));
const SHA40 = /^[0-9a-f]{40}$/;
const KINDS = new Set(['token', 'component', 'interaction']);
const SOURCE_STATES = new Set(['active', 'corrected', 'superseded']);

function authorityBlobHash(authorityPath, repoRoot) {
  if (typeof authorityPath !== 'string' || !authorityPath) throw new Error('target.authorityPath is required');
  const parts = authorityPath.split('#');
  if (parts.length > 2 || !parts[0] || (parts.length === 2 && !parts[1])) throw new Error('invalid authority path');
  const [relativePath, itemName] = parts;
  if (!/^[a-zA-Z0-9_./-]+$/.test(relativePath) || path.isAbsolute(relativePath)) throw new Error('invalid authority path');
  const root = fs.realpathSync(repoRoot);
  const resolved = fs.realpathSync(path.resolve(root, relativePath));
  if (!resolved.startsWith(root + path.sep) || !fs.statSync(resolved).isFile()) throw new Error('authority must be a repository file');
  const bytes = fs.readFileSync(resolved);
  if (itemName) {
    if (relativePath !== 'registry.json') throw new Error('registry item selectors require registry.json');
    const registry = JSON.parse(bytes.toString('utf8'));
    if (!Array.isArray(registry.items) || !registry.items.some((item) => item.name === itemName)) {
      throw new Error('target registry item does not exist');
    }
  }
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}

export function validateDesignPromotion(candidate, { repoRoot = REPO_ROOT } = {}) {
  const errors = [];
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return { ok: false, errors: ['candidate must be an object'] };
  }
  const p = candidate.provenance ?? {};
  if (typeof p.repo !== 'string' || !p.repo.trim()) errors.push('provenance.repo is required');
  if (!SHA40.test(p.commit ?? '')) errors.push('provenance.commit must be a 40-char lowercase SHA');
  if (typeof p.evidence !== 'string' || !p.evidence.trim()) errors.push('provenance.evidence is required');
  if (typeof p.graphitiId !== 'string' || !p.graphitiId.trim()) errors.push('provenance.graphitiId is required');
  if (typeof p.observedAt !== 'string' || !Number.isFinite(Date.parse(p.observedAt))) {
    errors.push('provenance.observedAt must be a date');
  }
  if (!KINDS.has(candidate.target?.kind)) errors.push('target.kind must be token, component, or interaction');
  if (!SOURCE_STATES.has(candidate.sourceState)) errors.push('sourceState must be active, corrected, or superseded');
  if (candidate.sourceState === 'corrected' || candidate.sourceState === 'superseded') errors.push('stale Graphiti knowledge cannot be promoted');
  if (candidate.status !== 'candidate') errors.push('Graphiti input must remain candidate until repository adoption');
  if ('currentAuthorityHash' in candidate) errors.push('currentAuthorityHash must not be supplied by a candidate');
  if (!SHA40.test(candidate.expectedAuthorityHash ?? '')) {
    errors.push('expectedAuthorityHash must be a 40-char Git blob SHA');
  }
  try {
    const actual = authorityBlobHash(candidate.target?.authorityPath, repoRoot);
    if (SHA40.test(candidate.expectedAuthorityHash ?? '') && actual !== candidate.expectedAuthorityHash) {
      errors.push('candidate conflicts with current design authority');
    }
  } catch (error) {
    errors.push(`cannot resolve current design authority: ${error.message}`);
  }
  return { ok: errors.length === 0, errors };
}

if (process.argv[1] && process.argv[1].endsWith('graphiti-design-promotion.mjs') && process.argv[2]) {
  const result = validateDesignPromotion(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')));
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}
