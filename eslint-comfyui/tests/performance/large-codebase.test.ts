/**
 * Performance tests for ESLint plugin with large codebases
 * Ensures the rule performs well with realistic file sizes
 */

import { ESLint } from 'eslint';
import fs from 'fs';
import path from 'path';

describe('Performance Tests', () => {
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

  it('should handle large files with many deprecated API calls efficiently', async () => {
    // Generate a large file with many deprecated API calls
    const largeLegacyCode = generateLargeCodeFile(1000); // 1000 lines
    const tempFile = path.join(__dirname, '../fixtures/large-legacy-temp.ts');
    
    fs.writeFileSync(tempFile, largeLegacyCode);
    
    try {
      const start = Date.now();
      const results = await eslint.lintFiles([tempFile]);
      const duration = Date.now() - start;
      
      console.log(`Large file (1000 lines) processed in ${duration}ms`);
      
      // Should complete within reasonable time (under 5 seconds)
      expect(duration).toBeLessThan(5000);
      
      // Should still detect deprecated APIs
      const [result] = results;
      expect(result.messages.length).toBeGreaterThan(0);
      
      // Clean up
      fs.unlinkSync(tempFile);
    } catch (error) {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      throw error;
    }
  });

  it('should handle multiple files concurrently', async () => {
    // Create multiple test files
    const fileCount = 10;
    const tempFiles: string[] = [];
    
    try {
      // Generate multiple files
      for (let i = 0; i < fileCount; i++) {
        const code = generateMediumCodeFile(100); // 100 lines each
        const tempFile = path.join(__dirname, `../fixtures/multi-test-${i}.ts`);
        fs.writeFileSync(tempFile, code);
        tempFiles.push(tempFile);
      }
      
      const start = Date.now();
      const results = await eslint.lintFiles(tempFiles);
      const duration = Date.now() - start;
      
      console.log(`${fileCount} files (100 lines each) processed in ${duration}ms`);
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(10000);
      
      // Should return results for all files
      expect(results).toHaveLength(fileCount);
      
      // Clean up
      tempFiles.forEach(file => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      });
    } catch (error) {
      // Clean up on error
      tempFiles.forEach(file => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      });
      throw error;
    }
  });

  it('should have consistent performance with repeated runs', async () => {
    const testFile = path.join(__dirname, '../fixtures/legacy-extension.ts');
    const durations: number[] = [];
    const runCount = 5;
    
    // Run multiple times to check consistency
    for (let i = 0; i < runCount; i++) {
      const start = Date.now();
      await eslint.lintFiles([testFile]);
      const duration = Date.now() - start;
      durations.push(duration);
    }
    
    console.log(`Durations across ${runCount} runs:`, durations);
    
    // Calculate standard deviation to check consistency
    const mean = durations.reduce((a, b) => a + b) / durations.length;
    const variance = durations.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / durations.length;
    const stdDev = Math.sqrt(variance);
    
    console.log(`Mean: ${mean.toFixed(2)}ms, StdDev: ${stdDev.toFixed(2)}ms`);
    
    // Standard deviation should be reasonable (less than 50% of mean)
    expect(stdDev).toBeLessThan(mean * 0.5);
  });

  it('should handle files with no deprecated APIs efficiently', async () => {
    // Generate a large file with NO deprecated APIs
    const largeModernCode = generateLargeModernCodeFile(1000);
    const tempFile = path.join(__dirname, '../fixtures/large-modern-temp.ts');
    
    fs.writeFileSync(tempFile, largeModernCode);
    
    try {
      const start = Date.now();
      const results = await eslint.lintFiles([tempFile]);
      const duration = Date.now() - start;
      
      console.log(`Large modern file (1000 lines) processed in ${duration}ms`);
      
      // Should complete quickly since no deprecated APIs to process
      expect(duration).toBeLessThan(3000);
      
      // Should have no deprecated API violations
      const [result] = results;
      const deprecatedMessages = result.messages.filter(m => 
        m.message.includes('deprecated')
      );
      expect(deprecatedMessages).toHaveLength(0);
      
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

function generateLargeCodeFile(lineCount: number): string {
  const lines = [
    `// Generated test file with ${lineCount} lines`,
    `import { serialise } from '../utils/vintageClipboard.js';`,
    `import { app } from '../scripts/app.js';`,
    ``,
    `class TestNode {`
  ];
  
  // Generate many methods with deprecated API calls
  for (let i = 0; i < lineCount - 10; i++) {
    if (i % 10 === 0) {
      lines.push(`  // Method group ${Math.floor(i / 10)}`);
    }
    
    if (i % 5 === 0) {
      lines.push(`  onExecuted${i}(output: any) {`);
      lines.push(`    return serialise([], app.graph);`);
      lines.push(`  }`);
    } else if (i % 5 === 1) {
      lines.push(`  recreate${i}() {`);
      lines.push(`    return Promise.resolve(null);`);
      lines.push(`  }`);
    } else if (i % 5 === 2) {
      lines.push(`  processSubgraphs${i}() {`);
      lines.push(`    const subgraphs = new Set();`);
      lines.push(`    return subgraphs;`);
      lines.push(`  }`);
    } else {
      lines.push(`  method${i}() {`);
      lines.push(`    // Regular method without deprecated APIs`);
      lines.push(`  }`);
    }
    
    if (i % 10 === 9) {
      lines.push(``);
    }
  }
  
  lines.push(`}`);
  lines.push(``);
  lines.push(`export default TestNode;`);
  
  return lines.join('\n');
}

function generateMediumCodeFile(lineCount: number): string {
  const lines = [
    `// Generated medium test file`,
    `import { serialise } from '../utils/vintageClipboard.js';`,
    ``,
    `export class MediumTestNode {`
  ];
  
  for (let i = 0; i < lineCount - 5; i++) {
    if (i % 3 === 0) {
      lines.push(`  onExecuted${i}() { return serialise([], null); }`);
    } else if (i % 3 === 1) {
      lines.push(`  recreate${i}() { return Promise.resolve(); }`);
    } else {
      lines.push(`  method${i}() { console.log('test'); }`);
    }
  }
  
  lines.push(`}`);
  
  return lines.join('\n');
}

function generateLargeModernCodeFile(lineCount: number): string {
  const lines = [
    `// Generated modern test file with ${lineCount} lines`,
    `import { app } from '../scripts/app.js';`,
    ``,
    `class ModernTestNode {`
  ];
  
  // Generate many methods WITHOUT deprecated API calls
  for (let i = 0; i < lineCount - 10; i++) {
    if (i % 10 === 0) {
      lines.push(`  // Modern method group ${Math.floor(i / 10)}`);
    }
    
    if (i % 5 === 0) {
      lines.push(`  onNodeExecuted${i}(output: any) {`);
      lines.push(`    return JSON.stringify(output);`);
      lines.push(`  }`);
    } else if (i % 5 === 1) {
      lines.push(`  refresh${i}() {`);
      lines.push(`    return Promise.resolve(null);`);
      lines.push(`  }`);
    } else if (i % 5 === 2) {
      lines.push(`  processNodes${i}() {`);
      lines.push(`    const nodeCollection = new Set();`);
      lines.push(`    return nodeCollection;`);
      lines.push(`  }`);
    } else {
      lines.push(`  modernMethod${i}() {`);
      lines.push(`    // Modern method implementation`);
      lines.push(`    return { success: true };`);
      lines.push(`  }`);
    }
    
    if (i % 10 === 9) {
      lines.push(``);
    }
  }
  
  lines.push(`}`);
  lines.push(``);
  lines.push(`export default ModernTestNode;`);
  
  return lines.join('\n');
}