module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  env: {
    node: true,
    es2022: true,
  },
  ignorePatterns: ['**/lib/**', '**/dist/**', 'node_modules/**', '.yarn/**'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    // readable code: one declaration and one statement per line
    'one-var': ['error', 'never'],
    'max-statements-per-line': ['error', { max: 1 }],
    'no-sequences': 'error',
  },
};
