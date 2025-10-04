/**
 * ESLint rule to detect deprecated ComfyUI frontend APIs
 */

import { ESLintUtils } from '@typescript-eslint/utils';
import * as deprecatedApisData from '../data/deprecated-apis.json';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/comfyui/standards-bot/blob/main/docs/rules/${name}.md`
);

interface DeprecatedApi {
  name: string;
  reason: string;
  file: string;
  line: number;
  context: string;
}

interface DeprecatedApisData {
  extractedAt: string;
  totalCount: number;
  sources: string[];
  deprecatedApis: {
    functions: DeprecatedApi[];
    propertys: DeprecatedApi[];
    classs: DeprecatedApi[];
    constants: DeprecatedApi[];
    types: DeprecatedApi[];
    imports: DeprecatedApi[];
  };
}

const deprecatedApis = deprecatedApisData as DeprecatedApisData;

// Create lookup map
const deprecatedLookup = new Map<string, DeprecatedApi[]>();

// Populate lookup map
Object.entries(deprecatedApis.deprecatedApis).forEach(([category, items]) => {
  items.forEach((item) => {
    const key = item.name.toLowerCase();
    if (!deprecatedLookup.has(key)) {
      deprecatedLookup.set(key, []);
    }
    deprecatedLookup.get(key)!.push({
      ...item,
      category
    } as DeprecatedApi & { category: string });
  });
});

export const noDeprecatedComfyuiApis = createRule({
  name: 'no-deprecated-comfyui-apis',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow usage of deprecated ComfyUI frontend APIs',
      recommended: 'recommended',
    },
    schema: [
      {
        type: 'object',
        properties: {
          severity: {
            type: 'string',
            enum: ['error', 'warn', 'off'],
            description: 'Severity level for deprecated API usage',
          },
          ignorePatterns: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of patterns to ignore (regex supported)',
          },
          showContext: {
            type: 'boolean',
            description: 'Show the deprecated API context in the error message',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      deprecatedApi: 'Usage of deprecated ComfyUI API "{{name}}" detected. {{reason}}',
      deprecatedApiWithContext: 'Usage of deprecated ComfyUI API "{{name}}" detected. {{reason}} (from {{file}}:{{line}})',
      deprecatedApiGeneric: 'Usage of deprecated ComfyUI API "{{name}}" detected. Check ComfyUI documentation for alternatives.',
    },
  },
  defaultOptions: [
    {
      severity: 'warn',
      ignorePatterns: [],
      showContext: true,
    },
  ],
  create(context, [options]) {
    const { severity = 'warn', ignorePatterns = [], showContext = true } = options;

    function isIgnored(name: string): boolean {
      return ignorePatterns.some((pattern) => {
        try {
          const regex = new RegExp(pattern);
          return regex.test(name);
        } catch {
          return pattern === name;
        }
      });
    }

    function reportDeprecated(node: any, name: string, deprecatedInfo: DeprecatedApi & { category?: string }) {
      if (isIgnored(name)) {
        return;
      }

      const reason = deprecatedInfo.reason !== 'No reason provided' 
        ? `Reason: ${deprecatedInfo.reason}` 
        : 'Check ComfyUI documentation for alternatives.';

      const messageId = showContext && deprecatedInfo.file 
        ? 'deprecatedApiWithContext' 
        : deprecatedInfo.reason !== 'No reason provided'
          ? 'deprecatedApi'
          : 'deprecatedApiGeneric';

      context.report({
        node,
        messageId,
        data: {
          name,
          reason,
          file: deprecatedInfo.file,
          line: deprecatedInfo.line.toString(),
        },
      });
    }

    function checkIdentifier(node: any, name: string) {
      // Skip JavaScript/TypeScript built-ins
      const builtIns = new Set(['Set', 'Map', 'Array', 'Object', 'Promise', 'Function', 'String', 'Number', 'Boolean']);
      if (builtIns.has(name)) {
        return;
      }

      const deprecatedInfo = deprecatedLookup.get(name.toLowerCase());
      if (deprecatedInfo && deprecatedInfo.length > 0) {
        // Report first match if multiple items have same name
        const firstItem = deprecatedInfo[0];
        if (firstItem) {
          reportDeprecated(node, name, firstItem);
        }
      }
    }

    return {
      // Check function calls
      CallExpression(node) {
        if (node.callee.type === 'Identifier') {
          checkIdentifier(node.callee, node.callee.name);
        } else if (node.callee.type === 'MemberExpression' && node.callee.property.type === 'Identifier') {
          checkIdentifier(node.callee.property, node.callee.property.name);
        }
      },

      // Check property access
      MemberExpression(node) {
        if (node.property.type === 'Identifier') {
          checkIdentifier(node.property, node.property.name);
        }
      },

      // Check variable/function declarations
      VariableDeclarator(node) {
        if (node.id.type === 'Identifier') {
          checkIdentifier(node.id, node.id.name);
        }
      },

      // Check function declarations
      FunctionDeclaration(node) {
        if (node.id) {
          checkIdentifier(node.id, node.id.name);
        }
      },

      // Check class declarations
      ClassDeclaration(node) {
        if (node.id) {
          checkIdentifier(node.id, node.id.name);
        }
      },

      // Check method definitions in classes
      MethodDefinition(node) {
        if (node.key.type === 'Identifier') {
          checkIdentifier(node.key, node.key.name);
        }
      },

      // Check imports
      ImportSpecifier(node) {
        checkIdentifier(node.imported, node.imported.name);
      },

      ImportDefaultSpecifier(node) {
        checkIdentifier(node.local, node.local.name);
      },

      ImportNamespaceSpecifier(node) {
        checkIdentifier(node.local, node.local.name);
      },

      // Check new expressions
      NewExpression(node) {
        if (node.callee.type === 'Identifier') {
          checkIdentifier(node.callee, node.callee.name);
        }
      },

      // Check type annotations (for TypeScript)
      TSTypeReference(node) {
        if (node.typeName.type === 'Identifier') {
          checkIdentifier(node.typeName, node.typeName.name);
        }
      },
    };
  },
});