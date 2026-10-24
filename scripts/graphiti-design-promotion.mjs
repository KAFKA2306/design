import fs from 'node:fs';

const SHA40 = /^[0-9a-f]{40}$/;
const KINDS = new Set(['token', 'component', 'interaction']);
const SOURCE_STATES = new Set(['active', 'corrected', 'superseded']);

export function validateDesignPromotion(candidate) {
  const errors = [];
  if (!candidate || typeof candidate !== 'object') return { ok: false, errors: ['candidate must be an object'] };
  const p = candidate.provenance ?? {};
  if (!p.repo) errors.push('provenance.repo is required');
  if (!SHA40.test(p.commit ?? '')) errors.push('provenance.commit must be a 40-char lowercase SHA');
  if (!p.evidence) errors.push('provenance.evidence is required');
  if (!p.graphitiId) errors.push('provenance.graphitiId is required');
  if (!p.observedAt || Number.isNaN(Date.parse(p.observedAt))) errors.push('provenance.observedAt must be an ISO date');
  if (!KINDS.has(candidate.target?.kind)) errors.push('target.kind must be token, component, or interaction');
  if (!candidate.target?.authorityPath) errors.push('target.authorityPath is required');
  if (!SOURCE_STATES.has(candidate.sourceState)) errors.push('sourceState must be active, corrected, or superseded');
  if (candidate.sourceState === 'corrected' || candidate.sourceState === 'superseded') errors.push('stale Graphiti knowledge cannot be promoted');
  if (!candidate.expectedAuthorityHash || !candidate.currentAuthorityHash) errors.push('authority hashes are required');
  if (candidate.expectedAuthorityHash && candidate.currentAuthorityHash && candidate.expectedAuthorityHash !== candidate.currentAuthorityHash) errors.push('candidate conflicts with current design authority');
  if (candidate.status !== 'candidate') errors.push('Graphiti input must remain candidate until repository adoption');
  return { ok: errors.length === 0, errors };
}

if (process.argv[1] && process.argv[1].endsWith('graphiti-design-promotion.mjs') && process.argv[2]) {
  const result = validateDesignPromotion(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')));
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}
