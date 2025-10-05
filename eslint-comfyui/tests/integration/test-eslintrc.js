// ESLint configuration for integration tests

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['comfyui'],
  rules: {
    'comfyui/no-deprecated-comfyui-apis': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'lib/',
    '**/*.d.ts'
  ],
  // Use the built plugin for testing
  settings: {
    'import/resolver': {
      node: {
        paths: ['lib']
      }
    }
  }
};