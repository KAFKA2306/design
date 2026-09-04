export const publicForbiddenPatterns = Object.freeze([
  Object.freeze({ name: 'employer-name', source: 'nitto', flags: 'i' }),
  Object.freeze({ name: 'employer-email', source: '@nitto\\.com', flags: 'i' }),
  Object.freeze({ name: 'private-person-marker', source: '\\b高澤\\b', flags: '' }),
  Object.freeze({ name: 'private-machine-marker', source: 'PCA\\d{3,}', flags: 'i' }),
]);
