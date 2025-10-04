/**
 * ESLint configuration presets for ComfyUI projects
 */

const baseConfig = {
  plugins: ['comfyui'],
  rules: {
    'comfyui/no-deprecated-comfyui-apis': 'warn',
  },
};

const recommendedConfig = {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    'comfyui/no-deprecated-comfyui-apis': 'error',
  },
};

const strictConfig = {
  ...recommendedConfig,
  rules: {
    ...recommendedConfig.rules,
    'comfyui/no-deprecated-comfyui-apis': ['error', {
      severity: 'error',
      showContext: true,
      ignorePatterns: []
    }],
  },
};

export const configs = {
  base: baseConfig,
  recommended: recommendedConfig,
  strict: strictConfig,
};