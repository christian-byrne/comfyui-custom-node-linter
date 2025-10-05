# eslint-plugin-comfyui

ESLint plugin to enforce ComfyUI coding standards and best practices for web development.

## Installation

```bash
npm install --save-dev eslint-plugin-comfyui
```

## Usage

Add `comfyui` to the plugins section of your `.eslintrc` configuration file:

```json
{
  "plugins": ["comfyui"]
}
```

Then configure the rules you want to use under the rules section:

```json
{
  "rules": {
    "comfyui/no-deprecated-comfyui-apis": "error"
  }
}
```

### Recommended Configuration

This plugin provides several preset configurations:

```json
{
  "extends": ["plugin:comfyui/recommended"]
}
```

Available configurations:
- `plugin:comfyui/base` - Basic ComfyUI rules with warnings
- `plugin:comfyui/recommended` - Recommended rules for most projects
- `plugin:comfyui/strict` - Strict rules for new projects

## Rules

### `comfyui/no-deprecated-comfyui-apis`

Warns when using deprecated ComfyUI frontend APIs based on automatically extracted `@deprecated` JSDoc tags from the ComfyUI frontend source code.

**Why this rule exists:**
- Helps developers avoid using deprecated APIs that may be removed in future ComfyUI versions
- Provides context about why APIs were deprecated and suggests alternatives
- Automatically stays up-to-date with ComfyUI frontend deprecations

**Options:**

```json
{
  "comfyui/no-deprecated-comfyui-apis": ["error", {
    "severity": "error",
    "showContext": true,
    "ignorePatterns": ["legacy.*"]
  }]
}
```

- `severity` (`"error" | "warn" | "off"`): Severity level for violations (default: `"warn"`)
- `showContext` (`boolean`): Show file and line context in error messages (default: `true`)
- `ignorePatterns` (`string[]`): Array of regex patterns to ignore (default: `[]`)

**Examples:**

❌ **Incorrect** code for this rule:

```typescript
// Using deprecated serialization function
import { serialise } from 'utils/vintageClipboard';

class MyNode {
  // Using deprecated lifecycle method
  onExecuted(output: any) {
    console.log('Deprecated method');
  }
  
  processData() {
    // This will trigger a warning
    return serialise([], graph);
  }
}
```

✅ **Correct** code for this rule:

```typescript
// Using modern APIs
class MyNode {
  // Using current lifecycle method
  onNodeExecuted(output: any) {
    console.log('Current method');
  }
  
  processData() {
    // Use modern serialization
    return JSON.stringify({ nodes: [], graph });
  }
}
```

## Automated Deprecated API Detection

This plugin automatically extracts deprecated APIs from ComfyUI frontend source code using the `scripts/extract-deprecated-apis.js` script. The script:

1. Scans TypeScript and Vue files in the ComfyUI frontend source
2. Finds `@deprecated` JSDoc tags and comments
3. Extracts context about what's deprecated and why
4. Generates a JSON file used by the ESLint rule

### Updating Deprecated APIs

To update the deprecated APIs list:

```bash
npm run extract-deprecated-apis
```

This will re-scan the ComfyUI frontend source and update the deprecated APIs database.

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

### Linting

```bash
npm run lint
npm run lint:fix
```

### Extracting Deprecated APIs

```bash
node scripts/extract-deprecated-apis.js
```

## Example Configuration

Complete `.eslintrc.js` example for a ComfyUI project:

```javascript
module.exports = {
  extends: [
    '@typescript-eslint/recommended',
    'plugin:comfyui/recommended'
  ],
  plugins: ['comfyui'],
  rules: {
    'comfyui/no-deprecated-comfyui-apis': ['error', {
      severity: 'error',
      showContext: true,
      ignorePatterns: [
        // Ignore legacy files during migration
        'legacy.*',
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
      // More lenient for legacy files
      files: ['legacy/**/*.ts'],
      rules: {
        'comfyui/no-deprecated-comfyui-apis': 'warn'
      }
    }
  ]
};
```

## Integration with ComfyUI Development

This plugin is designed to work alongside the ComfyUI ecosystem:

- **Pylint Plugin**: For Python backend code standards
- **ESLint Plugin**: For JavaScript/TypeScript frontend code standards
- **Automatic Updates**: Deprecated APIs are automatically extracted from ComfyUI source

### ComfyUI Frontend Compatibility

This plugin tracks deprecated APIs from:
- ComfyUI Frontend official repository
- LiteGraph integration layers
- ComfyUI-specific extensions and utilities

The deprecated API detection covers:
- Functions and methods
- Classes and interfaces  
- Properties and constants
- TypeScript types
- Import statements

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Related

- [pylint-comfyui](../pylint_comfyui) - Python standards for ComfyUI backend code
- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) - The main ComfyUI project
- [ComfyUI Frontend](https://github.com/Comfy-Org/ComfyUI_frontend) - Official ComfyUI frontend