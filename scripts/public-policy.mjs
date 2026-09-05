export const publicForbiddenPatterns = Object.freeze([
  Object.freeze({ name: 'employer-name', source: 'nitto', flags: 'i' }),
  Object.freeze({ name: 'employer-email', source: '@nitto\\.com', flags: 'i' }),
  Object.freeze({ name: 'private-person-marker', source: '\\b高澤\\b', flags: '' }),
  Object.freeze({ name: 'private-machine-marker', source: 'PCA[0-9]{3,}', flags: 'i' }),
  Object.freeze({
    name: 'private-ipv4-endpoint',
    source: '(https?://)?(10\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}|192\\.168\\.[0-9]{1,3}\\.[0-9]{1,3}|172\\.(1[6-9]|2[0-9]|3[01])\\.[0-9]{1,3}\\.[0-9]{1,3})(:[0-9]+)?(/|$|[^0-9])',
    flags: 'i',
  }),
  Object.freeze({
    name: 'private-hostname-endpoint',
    source: '(https?://)?(localhost|[a-z0-9.-]+\\.(local|internal|intra))(:[0-9]+)?(/|$|[^a-z0-9.-])',
    flags: 'i',
  }),
]);
