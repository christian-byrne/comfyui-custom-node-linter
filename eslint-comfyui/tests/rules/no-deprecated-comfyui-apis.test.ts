/**
 * Unit tests for no-deprecated-comfyui-apis rule
 */

import { ESLint } from 'eslint';

describe('no-deprecated-comfyui-apis', () => {
  let eslint: ESLint;

  beforeEach(() => {
    eslint = new ESLint({
      baseConfig: {
        parser: '@typescript-eslint/parser',
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: 'module',
        },
        plugins: ['comfyui'],
        rules: {
          'comfyui/no-deprecated-comfyui-apis': 'error',
        },
      },
      useEslintrc: false,
      plugins: {
        comfyui: require('../../lib/index.js'),
      },
    });
  });

  it('should detect deprecated serialise function', async () => {
    const code = `
      import { serialise } from 'utils/vintageClipboard';
      const result = serialise([], null);
    `;

    const [result] = await eslint.lintText(code, { filePath: 'test.ts' });
    
    expect(result.messages.length).toBeGreaterThan(0);
    expect(result.messages.some(msg => 
      msg.message.includes('serialise') && msg.message.includes('deprecated')
    )).toBe(true);
  });

  it('should detect deprecated onExecuted method', async () => {
    const code = `
      class TestNode {
        onExecuted(output) {
          console.log('deprecated');
        }
      }
    `;

    const [result] = await eslint.lintText(code, { filePath: 'test.ts' });
    
    expect(result.messages.length).toBeGreaterThan(0);
    expect(result.messages.some(msg => 
      msg.message.includes('onExecuted') && msg.message.includes('deprecated')
    )).toBe(true);
  });

  it('should NOT detect modern APIs', async () => {
    const code = `
      class ModernNode {
        onNodeExecuted(output) {
          console.log('modern');
        }
        
        refresh() {
          return true;
        }
      }
      
      const nodeCollection = new Set();
    `;

    const [result] = await eslint.lintText(code, { filePath: 'test.ts' });
    
    const deprecatedMessages = result.messages.filter(msg => 
      msg.message.includes('deprecated')
    );
    
    expect(deprecatedMessages).toHaveLength(0);
  });

  it('should respect ignore patterns', async () => {
    const eslintWithIgnore = new ESLint({
      baseConfig: {
        parser: '@typescript-eslint/parser',
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: 'module',
        },
        plugins: ['comfyui'],
        rules: {
          'comfyui/no-deprecated-comfyui-apis': ['error', {
            ignorePatterns: ['serialise']
          }],
        },
      },
      useEslintrc: false,
      plugins: {
        comfyui: require('../../lib/index.js'),
      },
    });

    const code = `
      import { serialise } from 'utils/vintageClipboard';
      const result = serialise([], null);
    `;

    const [result] = await eslintWithIgnore.lintText(code, { filePath: 'test.ts' });
    
    const serialiseMessages = result.messages.filter(msg => 
      msg.message.includes('serialise')
    );
    
    expect(serialiseMessages).toHaveLength(0);
  });

  it('should handle multiple deprecated APIs in one file', async () => {
    const code = `
      import { serialise } from 'utils/vintageClipboard';
      
      class TestNode {
        onExecuted(output) {
          return serialise([], null);
        }
        
        recreate() {
          return Promise.resolve();
        }
      }
    `;

    const [result] = await eslint.lintText(code, { filePath: 'test.ts' });
    
    expect(result.messages.length).toBeGreaterThanOrEqual(2);
    
    const messageTexts = result.messages.map(m => m.message);
    expect(messageTexts.some(msg => msg.includes('serialise'))).toBe(true);
    expect(messageTexts.some(msg => msg.includes('onExecuted'))).toBe(true);
    expect(messageTexts.some(msg => msg.includes('recreate'))).toBe(true);
  });
});