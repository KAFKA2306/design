import { publicForbiddenPatterns } from './public-policy.mjs';

if (publicForbiddenPatterns.length < 4) throw new Error('Public confidentiality policy is unexpectedly empty.');
for (const rule of publicForbiddenPatterns) {
  if (!rule.name || !rule.source) throw new Error('Public confidentiality rule must have name and source.');
  new RegExp(rule.source, rule.flags);
}
console.log(`Validated ${publicForbiddenPatterns.length} public confidentiality rule(s).`);
