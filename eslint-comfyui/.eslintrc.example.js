// Example ESLint configuration for ComfyUI projects

module.exports = {
  extends: [
    '@typescript-eslint/recommended',
    'plugin:comfyui/recommended'
  ],
  plugins: ['comfyui'],
  rules: {
    // ComfyUI specific rules
    'comfyui/no-deprecated-comfyui-apis': ['error', {
      severity: 'error',
      showContext: true,
      ignorePatterns: [
        // Add patterns to ignore specific deprecated APIs if needed
        // 'legacy.*',
        // 'old.*'
      ]
    }],
  },
  overrides: [
    {
      // Stricter rules for new files
      files: ['src/**/*.ts', 'src/**/*.vue'],
      rules: {
        'comfyui/no-deprecated-comfyui-apis': ['error', {
          severity: 'error',
          showContext: true
        }]
      }
    },
    {
      // More lenient for legacy files during migration
      files: ['legacy/**/*.ts', 'old/**/*.js'],
      rules: {
        'comfyui/no-deprecated-comfyui-apis': 'warn'
      }
    }
  ]
};