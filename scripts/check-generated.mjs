import fs from 'node:fs';
import { OUTPUT_PATH, generateCss, readTokens } from './token-lib.mjs';
const expected = generateCss(readTokens());
const actual = fs.existsSync(OUTPUT_PATH) ? fs.readFileSync(OUTPUT_PATH, 'utf8') : '';
if (actual !== expected) {
  console.error('styles/tokens.css is stale. Run: npm run tokens:build');
  process.exit(1);
}
console.log('tokens: generated output is current');
