#!/usr/bin/env node

/**
 * Comprehensive test script for ESLint plugin
 * Tests the plugin with real ComfyUI extension code samples
 */

const { ESLint } = require('eslint');
const path = require('path');
const fs = require('fs');

async function testPlugin() {
  console.log('Testing ESLint ComfyUI Plugin\n');

  // Create ESLint instance with our plugin
  const eslint = new ESLint({
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
      overrides: [
        {
          files: ['*.vue'],
          parser: 'vue-eslint-parser',
          parserOptions: {
            parser: '@typescript-eslint/parser',
            ecmaVersion: 2020,
            sourceType: 'module',
          },
        },
      ],
    },
    useEslintrc: false,
    // Load our built plugin
    plugins: {
      comfyui: require('../lib/index.js'),
    },
  });

  const fixturesDir = path.join(__dirname, '../tests/fixtures');
  const testFiles = [
    'legacy-extension.ts',
    'modern-extension.ts',
    'legacy-widget.vue'
  ];

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const fileName of testFiles) {
    const filePath = path.join(fixturesDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${fileName} - file not found`);
      continue;
    }

    console.log(`Testing: ${fileName}`);
    totalTests++;

    try {
      const results = await eslint.lintFiles([filePath]);
      const [result] = results;
      
      const deprecatedMessages = result.messages.filter(msg => 
        msg.message.includes('deprecated')
      );

      if (fileName.includes('legacy')) {
        // Legacy files should have deprecated API warnings
        if (deprecatedMessages.length > 0) {
          console.log(`   ✅ Detected ${deprecatedMessages.length} deprecated API(s)`);
          
          // Show first 2 examples
          deprecatedMessages.slice(0, 2).forEach(msg => {
            console.log(`      - Line ${msg.line}: ${msg.message.split('.')[0]}`);
          });
          
          if (deprecatedMessages.length > 2) {
            console.log(`      ... and ${deprecatedMessages.length - 2} more`);
          }
          
          passedTests++;
        } else {
          console.log(`   ❌ FAILED: Expected deprecated API warnings but found none`);
          failedTests++;
        }
      } else if (fileName.includes('modern')) {
        // Modern files should NOT have deprecated API warnings
        if (deprecatedMessages.length === 0) {
          console.log(`   ✅ Passed - no deprecated APIs detected`);
          passedTests++;
        } else {
          console.log(`   ❌ FAILED: Unexpected deprecated API warnings:`);
          deprecatedMessages.forEach(msg => {
            console.log(`      - Line ${msg.line}: ${msg.message}`);
          });
          failedTests++;
        }
      }

    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      failedTests++;
    }

    console.log('');
  }

  // Test ignore patterns
  console.log('Testing ignore patterns configuration');
  totalTests++;

  try {
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
        comfyui: require('../lib/index.js'),
      },
    });

    const legacyFilePath = path.join(fixturesDir, 'legacy-extension.ts');
    const results = await eslintWithIgnore.lintFiles([legacyFilePath]);
    const [result] = results;
    
    const ignoredAPIs = ['serialise', 'onExecuted'];
    const hasIgnoredAPIs = result.messages.some(msg => 
      ignoredAPIs.some(api => msg.message.includes(api))
    );

    if (!hasIgnoredAPIs) {
      console.log(`   ✅ Ignored specified deprecated APIs`);
      passedTests++;
    } else {
      console.log(`   ❌ FAILED: Still detecting ignored deprecated APIs`);
      failedTests++;
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    failedTests++;
  }

  console.log('');

  // Summary
  console.log('\nTest Summary');
  console.log('============');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (failedTests === 0) {
    console.log('\n✅ All tests passed! Plugin is working correctly.');
    process.exit(0);
  } else {
    console.log(`\n❌ ${failedTests} test(s) failed.`);
    process.exit(1);
  }
}

// Run tests
testPlugin().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});