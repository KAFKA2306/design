import { readTokens, validateTokens } from './token-lib.mjs';
validateTokens(readTokens());
console.log('tokens: valid');
