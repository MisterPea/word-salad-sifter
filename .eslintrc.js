module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:storybook/recommended'],
  env: {
    browser: true,
    es2021: true,
  },
  rules: {
    'no-undef': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { 'varsIgnorePattern': 'chrome' }],
  },
  overrides: [
    {
      files: [
        "**/*.test.js",
        "**/*.test.ts",
        "**/*.test.tsx"
      ],
      env: { jest: true }
    }
  ]
};