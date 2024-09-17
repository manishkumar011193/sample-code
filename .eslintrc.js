module.exports = {
  extends: [
    '@inventory-service/eslint-config/base',
    '@inventory-service/eslint-config/jest',
    '@inventory-service/eslint-config/typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
  },
}
