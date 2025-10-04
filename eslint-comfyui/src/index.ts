/**
 * ESLint plugin for ComfyUI web development standards
 */

import { rules } from './rules';
import { configs } from './configs';

const plugin = {
  meta: {
    name: 'eslint-plugin-comfyui',
    version: '0.1.0',
  },
  rules,
  configs,
};

module.exports = plugin;