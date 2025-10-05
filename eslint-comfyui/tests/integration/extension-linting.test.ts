/**
 * Integration tests for ESLint plugin with real ComfyUI extension code
 * Tests that the rules correctly identify deprecated APIs in realistic scenarios
 */

import { ESLint } from 'eslint';
import path from 'path';
import fs from 'fs';

describe('ComfyUI Extension Linting Integration', () => {
  let eslint: ESLint;
  
  beforeEach(() => {
    eslint = new ESLint({
      baseConfig: {
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
      },
      useEslintrc: false,
      // Use our built plugin
      plugins: {
        comfyui: require('../../lib/index.js'),
      },
    });
  });

  describe('Legacy Extension Detection', () => {
    it('should detect deprecated APIs in legacy TypeScript extension', async () => {
      const filePath = path.join(__dirname, '../fixtures/legacy-extension.ts');
      const results = await eslint.lintFiles([filePath]);
      
      expect(results).toHaveLength(1);
      const [result] = results;
      
      // Should have multiple deprecated API violations
      expect(result.messages.length).toBeGreaterThan(0);
      
      // Check for specific deprecated APIs we expect
      const messages = result.messages.map(m => m.message);
      
      // Should detect deprecated serialise function
      expect(messages.some(msg => 
        msg.includes('serialise') && msg.includes('deprecated')
      )).toBe(true);
      
      // Should detect deprecated onExecuted method
      expect(messages.some(msg => 
        msg.includes('onExecuted') && msg.includes('deprecated')
      )).toBe(true);
      
      // Should detect deprecated recreate method
      expect(messages.some(msg => 
        msg.includes('recreate') && msg.includes('deprecated')
      )).toBe(true);
      
      // Should detect deprecated subgraphs property
      expect(messages.some(msg => 
        msg.includes('subgraphs') && msg.includes('deprecated')
      )).toBe(true);
      
      // All violations should be errors (not warnings)
      expect(result.messages.every(m => m.severity === 2)).toBe(true);
    });

    it('should detect deprecated APIs in Vue component', async () => {
      const filePath = path.join(__dirname, '../fixtures/legacy-widget.vue');
      
      // For Vue files, we need a Vue parser setup
      const vueESLint = new ESLint({
        baseConfig: {
          parser: 'vue-eslint-parser',
          parserOptions: {
            parser: '@typescript-eslint/parser',
            ecmaVersion: 2020,
            sourceType: 'module',
          },
          plugins: ['comfyui'],
          rules: {
            'comfyui/no-deprecated-comfyui-apis': 'warn',
          },
        },
        useEslintrc: false,
        plugins: {
          comfyui: require('../../lib/index.js'),
        },
      });

      const results = await vueESLint.lintFiles([filePath]);
      
      expect(results).toHaveLength(1);
      const [result] = results;
      
      // Should detect deprecated APIs in Vue component
      expect(result.messages.length).toBeGreaterThan(0);
      
      const messages = result.messages.map(m => m.message);
      
      // Should detect deprecated APIs in Vue script sections
      expect(messages.some(msg => 
        msg.includes('serialise') && msg.includes('deprecated')
      )).toBe(true);
      
      expect(messages.some(msg => 
        msg.includes('onExecuted') && msg.includes('deprecated')
      )).toBe(true);
    });
  });

  describe('Modern Extension Validation', () => {
    it('should NOT detect deprecated APIs in modern TypeScript extension', async () => {
      const filePath = path.join(__dirname, '../fixtures/modern-extension.ts');
      const results = await eslint.lintFiles([filePath]);
      
      expect(results).toHaveLength(1);
      const [result] = results;
      
      // Should have no deprecated API violations
      const deprecatedMessages = result.messages.filter(m => 
        m.message.includes('deprecated')
      );
      
      expect(deprecatedMessages).toHaveLength(0);
    });
  });

  describe('Rule Configuration Testing', () => {
    it('should respect ignore patterns configuration', async () => {
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
              ignorePatterns: ['serialise', 'onExecuted']
            }],
          },
        },
        useEslintrc: false,
        plugins: {
          comfyui: require('../../lib/index.js'),
        },
      });

      const filePath = path.join(__dirname, '../fixtures/legacy-extension.ts');
      const results = await eslintWithIgnore.lintFiles([filePath]);
      
      const [result] = results;
      const messages = result.messages.map(m => m.message);
      
      // Should not detect ignored deprecated APIs
      expect(messages.some(msg => msg.includes('serialise'))).toBe(false);
      expect(messages.some(msg => msg.includes('onExecuted'))).toBe(false);
      
      // Should still detect non-ignored deprecated APIs
      expect(messages.some(msg => msg.includes('recreate'))).toBe(true);
    });

    it('should respect severity configuration', async () => {
      const eslintWithWarn = new ESLint({
        baseConfig: {
          parser: '@typescript-eslint/parser',
          parserOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
          },
          plugins: ['comfyui'],
          rules: {
            'comfyui/no-deprecated-comfyui-apis': 'warn',
          },
        },
        useEslintrc: false,
        plugins: {
          comfyui: require('../../lib/index.js'),
        },
      });

      const filePath = path.join(__dirname, '../fixtures/legacy-extension.ts');
      const results = await eslintWithWarn.lintFiles([filePath]);
      
      const [result] = results;
      
      // All messages should be warnings (severity 1) not errors (severity 2)
      expect(result.messages.every(m => m.severity === 1)).toBe(true);
    });

    it('should show context when configured', async () => {
      const eslintWithContext = new ESLint({
        baseConfig: {
          parser: '@typescript-eslint/parser',
          parserOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
          },
          plugins: ['comfyui'],
          rules: {
            'comfyui/no-deprecated-comfyui-apis': ['error', {
              showContext: true
            }],
          },
        },
        useEslintrc: false,
        plugins: {
          comfyui: require('../../lib/index.js'),
        },
      });

      const filePath = path.join(__dirname, '../fixtures/legacy-extension.ts');
      const results = await eslintWithContext.lintFiles([filePath]);
      
      const [result] = results;
      const messages = result.messages.map(m => m.message);
      
      // Should include file and line context in messages
      expect(messages.some(msg => 
        msg.includes('from') && msg.includes('.ts:')
      )).toBe(true);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle files with no deprecated APIs efficiently', async () => {
      const start = Date.now();
      
      const filePath = path.join(__dirname, '../fixtures/modern-extension.ts');
      const results = await eslint.lintFiles([filePath]);
      
      const duration = Date.now() - start;
      
      // Should complete quickly (under 1 second for small file)
      expect(duration).toBeLessThan(1000);
      
      // Should still return results
      expect(results).toHaveLength(1);
    });

    it('should handle malformed code gracefully', async () => {
      // Create a temporary malformed file
      const malformedCode = `
        import { serialise } from 'invalid
        class Broken {
          onExecuted(
      `;
      
      const tempFile = path.join(__dirname, '../fixtures/malformed-temp.ts');
      fs.writeFileSync(tempFile, malformedCode);
      
      try {
        const results = await eslint.lintFiles([tempFile]);
        
        // Should not throw, but may have parsing errors
        expect(results).toHaveLength(1);
        
        // Clean up
        fs.unlinkSync(tempFile);
      } catch (error) {
        // Clean up even if test fails
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
        throw error;
      }
    });
  });

  describe('Real-world ComfyUI Extension Patterns', () => {
    it('should detect deprecated APIs in common extension patterns', async () => {
      // Test common ComfyUI extension patterns
      const extensionCode = `
        import { app } from "../../../scripts/app.js";
        
        // Common extension registration pattern
        app.registerExtension({
          name: "test.extension",
          
          async beforeRegisterNodeDef(nodeType, nodeData, app) {
            if (nodeData.name === "TestNode") {
              // This should trigger deprecated API warning
              nodeType.prototype.onExecuted = function(output) {
                return serialise([], app.graph);
              };
            }
          },
          
          loadedGraphNode(node, app) {
            // Another deprecated pattern
            if (node.recreate) {
              node.recreate();
            }
          }
        });
      `;
      
      const tempFile = path.join(__dirname, '../fixtures/extension-pattern-temp.ts');
      fs.writeFileSync(tempFile, extensionCode);
      
      try {
        const results = await eslint.lintFiles([tempFile]);
        const [result] = results;
        
        // Should detect the deprecated APIs
        expect(result.messages.length).toBeGreaterThan(0);
        
        const messages = result.messages.map(m => m.message);
        expect(messages.some(msg => msg.includes('onExecuted'))).toBe(true);
        expect(messages.some(msg => msg.includes('serialise'))).toBe(true);
        expect(messages.some(msg => msg.includes('recreate'))).toBe(true);
        
        // Clean up
        fs.unlinkSync(tempFile);
      } catch (error) {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
        throw error;
      }
    });
  });
});