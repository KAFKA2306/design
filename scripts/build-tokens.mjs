import fs from 'node:fs';
import { OUTPUT_PATH, generateCss, readTokens } from './token-lib.mjs';
const css = generateCss(readTokens());
fs.mkdirSync(new URL('../styles/', import.meta.url), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, css, 'utf8');
console.log('tokens: built styles/tokens.css');
