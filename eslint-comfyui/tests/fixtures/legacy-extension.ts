/**
 * Legacy ComfyUI extension that uses deprecated APIs
 * This file should trigger multiple deprecated API warnings
 */

import { app } from "../../../scripts/app.js";
import { api } from "../../../scripts/api.js";
import { $el } from "../../../scripts/ui.js";
import { serialise } from "../../../utils/vintageClipboard.js";

// Should trigger deprecated API warnings
class LegacyCustomNode {
  static category = "testing/legacy";

  constructor() {
    this.serialize_widgets = true;
  }

  // Deprecated lifecycle method
  onExecuted(output: any) {
    console.log("Legacy execution handler", output);
    
    // Using deprecated serialization
    const data = serialise([], app.graph);
    return data;
  }

  // Another deprecated method
  recreate() {
    return Promise.resolve(null);
  }

  getExtraMenuOptions() {
    return [
      {
        content: "Process with deprecated API",
        callback: () => {
          // Multiple deprecated API calls
          this.onExecuted({});
          this.recreate();
          
          // Deprecated property access
          const subgraphs = new Set();
          subgraphs.add("test");
        }
      }
    ];
  }
}

// Extension registration using deprecated patterns
app.registerExtension({
  name: "legacy.extension",
  
  async beforeRegisterNodeDef(nodeType: any, nodeData: any, app: any) {
    // Using deprecated APIs in extension setup
    if (nodeData.name === "LegacyNode") {
      const orig = nodeType.prototype.onExecuted;
      nodeType.prototype.onExecuted = function(output: any) {
        // Deprecated method call
        return orig?.call(this, output);
      };
    }
  },

  // Deprecated extension lifecycle
  loadedGraphNode(node: any, app: any) {
    // Using deprecated node manipulation
    if (node.onExecuted) {
      node.originalExecuted = node.onExecuted;
    }
  }
});

// Global deprecated API usage
export function processLegacyData(nodes: any[], graph: any) {
  // Should trigger warnings
  const serialized = serialise(nodes, graph);
  
  // More deprecated patterns
  nodes.forEach(node => {
    if (node.onExecuted) {
      node.onExecuted({});
    }
    
    if (node.recreate) {
      node.recreate();
    }
  });

  return serialized;
}