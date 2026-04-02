/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  // Avoid extra transforms; tests only use Node/ESM features.
  transform: {},
};
