/** @type {import('jest').Config} */
module.exports = {
  // eslint-disable-next-line import/no-extraneous-dependencies
  ...require('@inventory-service/config/jest'),
  clearMocks: true,
  testRegex: ['.e2e.(spec|test).ts'],
}
