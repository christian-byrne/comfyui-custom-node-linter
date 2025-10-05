#!/usr/bin/env node

/**
 * Extract deprecated APIs from ComfyUI frontend source
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const FRONTEND_SOURCE_PATHS = [
  '/home/c_byrne/projects/comfyui-frontend-testing/ComfyUI_frontend-clone-20/src',
  '/home/c_byrne/projects/comfyui-frontend-testing/ComfyUI_frontend/src'
];

const FILE_PATTERNS = [
  '**/*.ts',
  '**/*.vue',
  '**/*.js'
];

const DEPRECATED_PATTERNS = [
  /@deprecated\s+(.+?)(?:\n|$|\*\/)/gi,
  /\/\*\*[\s\S]*?@deprecated[\s\S]*?\*\//gi,
  /\/\/\s*@deprecated\s+(.+)/gi
];

class DeprecatedApiExtractor {
  constructor() {
    this.deprecatedApis = {
      functions: [],
      classes: [],
      properties: [],
      constants: [],
      types: [],
      imports: []
    };
  }

  /**
   * Main extraction method
   */
  async extract() {
    console.log('🔍 Extracting deprecated APIs from ComfyUI frontend...');
    
    for (const sourcePath of FRONTEND_SOURCE_PATHS) {
      if (fs.existsSync(sourcePath)) {
        console.log(`📁 Scanning: ${sourcePath}`);
        await this.scanDirectory(sourcePath);
      } else {
        console.warn(`⚠️  Directory not found: ${sourcePath}`);
      }
    }

    console.log(`✅ Found ${this.getTotalCount()} deprecated items`);
    return this.deprecatedApis;
  }

  /**
   * Scan a directory for TypeScript/Vue files
   */
  async scanDirectory(dirPath) {
    for (const pattern of FILE_PATTERNS) {
      const files = glob.sync(path.join(dirPath, pattern), {
        ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts']
      });

      for (const filePath of files) {
        await this.scanFile(filePath);
      }
    }
  }

  /**
   * Scan a single file for deprecated APIs
   */
  async scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = this.getRelativePath(filePath);
      
      // Find all deprecated items in the file
      const deprecatedItems = this.findDeprecatedItems(content, relativePath);
      
      if (deprecatedItems.length > 0) {
        console.log(`📄 ${relativePath}: ${deprecatedItems.length} deprecated items`);
        
        for (const item of deprecatedItems) {
          this.categorizeDeprecatedItem(item);
        }
      }
    } catch (error) {
      console.error(`❌ Error scanning ${filePath}:`, error.message);
    }
  }

  /**
   * Find deprecated items in file content
   */
  findDeprecatedItems(content, filePath) {
    const items = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Check for @deprecated comments
      for (const pattern of DEPRECATED_PATTERNS) {
        pattern.lastIndex = 0; // Reset regex
        const match = pattern.exec(line);
        
        if (match) {
          const deprecationReason = match[1]?.trim() || 'No reason provided';
          
          // Look for the item being deprecated in nearby lines
          const context = this.getContextualInfo(lines, i);
          
          items.push({
            file: filePath,
            line: lineNumber,
            reason: deprecationReason,
            context: context,
            type: this.guessItemType(context),
            fullMatch: match[0]
          });
        }
      }
    }

    return items;
  }

  /**
   * Get contextual information around the deprecated comment
   */
  getContextualInfo(lines, deprecatedLineIndex) {
    const contextLines = [];
    const start = Math.max(0, deprecatedLineIndex - 2);
    const end = Math.min(lines.length, deprecatedLineIndex + 3);

    for (let i = start; i < end; i++) {
      if (i !== deprecatedLineIndex) {
        const line = lines[i].trim();
        if (line && !line.startsWith('//') && !line.startsWith('*')) {
          contextLines.push(line);
        }
      }
    }

    return contextLines.join(' ');
  }

  /**
   * Guess the type of deprecated item based on context
   */
  guessItemType(context) {
    if (/^(export\s+)?(function|const\s+\w+\s*=\s*\([^)]*\)\s*=>|async\s+function)/.test(context)) {
      return 'function';
    }
    if (/^(export\s+)?(class|interface|type)\s+/.test(context)) {
      return 'class';
    }
    if (/^(export\s+)?(const|let|var)\s+/.test(context)) {
      return 'constant';
    }
    if (/^(export\s+)?type\s+/.test(context)) {
      return 'type';
    }
    if (/^\w+\s*:\s*/.test(context)) {
      return 'property';
    }
    if (/^import\s+/.test(context)) {
      return 'import';
    }
    return 'unknown';
  }

  /**
   * Categorize deprecated item into appropriate category
   */
  categorizeDeprecatedItem(item) {
    const category = item.type === 'unknown' ? 'functions' : `${item.type}s`;
    
    if (!this.deprecatedApis[category]) {
      this.deprecatedApis[category] = [];
    }

    // Extract the actual name/identifier
    const name = this.extractIdentifierName(item.context, item.type);
    
    this.deprecatedApis[category].push({
      name: name,
      reason: item.reason,
      file: item.file,
      line: item.line,
      context: item.context
    });
  }

  /**
   * Extract the identifier name from context
   */
  extractIdentifierName(context, type) {
    // Try to extract meaningful names based on type
    const patterns = {
      function: /(?:function\s+(\w+)|const\s+(\w+)\s*=|(\w+)\s*\([^)]*\)\s*{)/,
      class: /(?:class|interface|type)\s+(\w+)/,
      constant: /(?:const|let|var)\s+(\w+)/,
      type: /type\s+(\w+)/,
      property: /(\w+)\s*:/,
      import: /import\s+.*?from\s+['"]([^'"]+)['"]/
    };

    const pattern = patterns[type] || /(\w+)/;
    const match = context.match(pattern);
    
    if (match) {
      // Return the first non-empty capture group
      return match.find((group, index) => index > 0 && group) || 'unknown';
    }

    return 'unknown';
  }

  /**
   * Get relative path for cleaner output
   */
  getRelativePath(filePath) {
    for (const sourcePath of FRONTEND_SOURCE_PATHS) {
      if (filePath.startsWith(sourcePath)) {
        return path.relative(sourcePath, filePath);
      }
    }
    return filePath;
  }

  /**
   * Get total count of deprecated items
   */
  getTotalCount() {
    return Object.values(this.deprecatedApis).reduce((total, category) => {
      return total + (Array.isArray(category) ? category.length : 0);
    }, 0);
  }

  /**
   * Generate output with metadata
   */
  generateOutput() {
    return {
      extractedAt: new Date().toISOString(),
      totalCount: this.getTotalCount(),
      sources: FRONTEND_SOURCE_PATHS,
      deprecatedApis: this.deprecatedApis
    };
  }
}

// Main execution
async function main() {
  try {
    const extractor = new DeprecatedApiExtractor();
    await extractor.extract();
    
    const output = extractor.generateOutput();
    
    // Write to JSON file
    const outputPath = path.join(__dirname, '..', 'src', 'data', 'deprecated-apis.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    
    console.log(`📝 Deprecated APIs written to: ${outputPath}`);
    console.log('📊 Summary:');
    
    Object.entries(output.deprecatedApis).forEach(([category, items]) => {
      if (Array.isArray(items) && items.length > 0) {
        console.log(`   ${category}: ${items.length} items`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { DeprecatedApiExtractor };