/**
 * Export all ComfyUI ESLint rules
 */

import { noDeprecatedComfyuiApis } from './no-deprecated-comfyui-apis';

export const rules = {
  'no-deprecated-comfyui-apis': noDeprecatedComfyuiApis,
};