export const publicForbiddenPatterns = Object.freeze([
  Object.freeze({ name: 'employer-name', source: 'nitto', flags: 'i' }),
  Object.freeze({ name: 'employer-email', source: '@nitto\\.com', flags: 'i' }),
  Object.freeze({ name: 'private-person-marker', source: '\\b高澤\\b', flags: '' }),
  Object.freeze({ name: 'private-machine-marker', source: 'PCA\\d{3,}', flags: 'i' }),
  Object.freeze({
    name: 'private-ipv4-endpoint',
    source: '(?:https?://)?(?:10\\.(?:\\d{1,3}\\.){2}\\d{1,3}|192\\.168\\.(?:\\d{1,3}\\.)\\d{1,3}|172\\.(?:1[6-9]|2\\d|3[01])\\.(?:\\d{1,3}\\.)\\d{1,3})(?::\\d+)?(?:/|\\b)',
    flags: 'i',
  }),
  Object.freeze({
    name: 'private-hostname-endpoint',
    source: '(?:https?://)?(?:localhost|[a-z0-9.-]+\\.(?:local|internal|intra))(?::\\d+)?(?:/|\\b)',
    flags: 'i',
  }),
]);
