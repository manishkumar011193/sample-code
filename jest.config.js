/** @type {import('jest').Config} */
module.exports = {
  // eslint-disable-next-line import/no-extraneous-dependencies
  ...require('@inventory-service/config/jest'),
  clearMocks: true,
  setupFiles: ['./jest-setup-global-mocks.js'],
  testPathIgnorePatterns: ['/node_modules/', '.e2e.(spec|test).ts'],
}
