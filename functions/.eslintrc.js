module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'google',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['tsconfig.json', 'tsconfig.dev.json'],
    sourceType: 'module',
  },
  ignorePatterns: [
    '/lib/**/*',
    'jest.config.js',
  ],
  plugins: [
    '@typescript-eslint',
    'import',
  ],
  rules: {
    'indent': ['error', 2],
    'require-jsdoc': ['off'],
    'max-len': ['error', {'code': 200}],
    'quotes': ['error', 'single'],
    'import/no-unresolved': 0,
  },
};
