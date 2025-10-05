/**
 * ESLint CLI integration tests
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

describe('ESLint CLI Integration', () => {
  const fixturesDir = path.join(__dirname, '../fixtures');
  
  it('should lint legacy extension and report deprecated APIs via CLI', () => {
    const legacyFile = path.join(fixturesDir, 'legacy-extension.ts');
    
    // Run ESLint via CLI with our plugin
    try {
      const output = execSync(
        `npx eslint --config tests/integration/test-eslintrc.js "${legacyFile}"`,
        { 
          cwd: path.join(__dirname, '../..'),
          encoding: 'utf8',
          stdio: 'pipe'
        }
      );
      
      // ESLint should exit with errors, so this shouldn't reach
      expect(false).toBe(true);
    } catch (error: any) {
      // Expected - ESLint should fail due to deprecated API usage
      const output = error.stdout || error.stderr || '';
      
      // Should contain deprecated API warnings
      expect(output).toContain('deprecated');
      expect(output).toContain('serialise');
      expect(output).toContain('onExecuted');
      expect(output).toContain('recreate');
      
      // Should show file path
      expect(output).toContain('legacy-extension.ts');
    }
  });

  it('should pass modern extension without errors via CLI', () => {
    const modernFile = path.join(fixturesDir, 'modern-extension.ts');
    
    try {
      const output = execSync(
        `npx eslint --config tests/integration/test-eslintrc.js "${modernFile}"`,
        { 
          cwd: path.join(__dirname, '../..'),
          encoding: 'utf8'
        }
      );
      
      // Should succeed without deprecated API warnings
      expect(output).not.toContain('deprecated');
    } catch (error: any) {
      // If there are errors, they shouldn't be about deprecated APIs
      const output = error.stdout || error.stderr || '';
      expect(output).not.toContain('deprecated');
      expect(output).not.toContain('comfyui/no-deprecated-comfyui-apis');
    }
  });

  it('should support different output formats', () => {
    const legacyFile = path.join(fixturesDir, 'legacy-extension.ts');
    
    try {
      // Test JSON output format
      execSync(
        `npx eslint --config tests/integration/test-eslintrc.js --format json "${legacyFile}"`,
        { 
          cwd: path.join(__dirname, '../..'),
          encoding: 'utf8'
        }
      );
    } catch (error: any) {
      const output = error.stdout || '';
      
      // Should be valid JSON
      expect(() => JSON.parse(output)).not.toThrow();
      
      const results = JSON.parse(output);
      expect(Array.isArray(results)).toBe(true);
      expect(results[0]).toHaveProperty('messages');
      expect(results[0].messages.length).toBeGreaterThan(0);
    }
  });

  it('should work with ESLint ignore patterns', () => {
    // Create a temporary file that should be ignored
    const ignoredFile = path.join(fixturesDir, 'node_modules', 'ignored-legacy.ts');
    
    // Ensure node_modules directory exists
    const nodeModulesDir = path.dirname(ignoredFile);
    if (!fs.existsSync(nodeModulesDir)) {
      fs.mkdirSync(nodeModulesDir, { recursive: true });
    }
    
    // Copy legacy content to ignored location
    const legacyContent = fs.readFileSync(
      path.join(fixturesDir, 'legacy-extension.ts'), 
      'utf8'
    );
    fs.writeFileSync(ignoredFile, legacyContent);
    
    try {
      const output = execSync(
        `npx eslint --config tests/integration/test-eslintrc.js "${fixturesDir}/*.ts"`,
        { 
          cwd: path.join(__dirname, '../..'),
          encoding: 'utf8'
        }
      );
      
      // Should not include the ignored file in output
      expect(output).not.toContain('ignored-legacy.ts');
    } catch (error: any) {
      const output = error.stdout || error.stderr || '';
      
      // Should not include the ignored file in error output
      expect(output).not.toContain('ignored-legacy.ts');
    } finally {
      // Clean up
      if (fs.existsSync(ignoredFile)) {
        fs.unlinkSync(ignoredFile);
      }
      if (fs.existsSync(nodeModulesDir)) {
        fs.rmdirSync(nodeModulesDir);
      }
    }
  });
});