/**
 * Modern ComfyUI extension using current APIs
 * This file should NOT trigger any deprecated API warnings
 */

import { app } from "../../../scripts/app.js";
import { api } from "../../../scripts/api.js";
import { $el } from "../../../scripts/ui.js";

// Modern patterns - should not trigger warnings
class ModernCustomNode {
  static category = "testing/modern";

  constructor() {
    this.serialize_widgets = true;
  }

  // Current lifecycle method
  onNodeExecuted(output: any) {
    console.log("Modern execution handler", output);
    
    // Using modern serialization
    const data = JSON.stringify({ output, timestamp: Date.now() });
    return data;
  }

  // Current method names
  refresh() {
    console.log("Modern refresh method");
  }

  getExtraMenuOptions() {
    return [
      {
        content: "Process with modern API",
        callback: () => {
          // Modern API calls
          this.onNodeExecuted({});
          this.refresh();
          
          // Modern property names
          const nodeCollection = new Set();
          nodeCollection.add("test");
        }
      }
    ];
  }
}

// Modern extension registration
app.registerExtension({
  name: "modern.extension",
  
  async beforeRegisterNodeDef(nodeType: any, nodeData: any, app: any) {
    // Using current APIs in extension setup
    if (nodeData.name === "ModernNode") {
      const orig = nodeType.prototype.onNodeExecuted;
      nodeType.prototype.onNodeExecuted = function(output: any) {
        // Current method call
        return orig?.call(this, output);
      };
    }
  },

  // Current extension lifecycle
  nodeCreated(node: any, app: any) {
    // Using current node manipulation
    if (node.onNodeExecuted) {
      node.originalExecuted = node.onNodeExecuted;
    }
  }
});

// Modern API usage
export function processModernData(nodes: any[], graph: any) {
  // Using modern serialization
  const serialized = JSON.stringify({
    nodes: nodes.map(n => ({ id: n.id, type: n.type })),
    graph: { version: graph.version },
    timestamp: Date.now()
  });
  
  // Modern patterns
  nodes.forEach(node => {
    if (node.onNodeExecuted) {
      node.onNodeExecuted({});
    }
    
    if (node.refresh) {
      node.refresh();
    }
  });

  return serialized;
}

// Modern TypeScript patterns
export interface ModernNodeInterface {
  id: string;
  type: string;
  onNodeExecuted(output: any): void;
  refresh(): void;
}

export class ModernNodeManager {
  private nodes: ModernNodeInterface[] = [];
  
  addNode(node: ModernNodeInterface) {
    this.nodes.push(node);
  }
  
  executeAll() {
    this.nodes.forEach(node => {
      node.onNodeExecuted({ batch: true });
    });
  }
  
  refreshAll() {
    this.nodes.forEach(node => {
      node.refresh();
    });
  }
}