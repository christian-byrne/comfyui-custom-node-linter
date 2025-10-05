/**
 * Example of deprecated ComfyUI API usage that should trigger warnings
 */

// ❌ These should trigger the deprecated API rule

// Deprecated function usage
import { serialise } from 'utils/vintageClipboard';

// Using deprecated APIs in code
export class BadExample {
  // Deprecated property access
  onExecuted(output: any) {
    console.log('This is deprecated');
  }

  processNodes() {
    // Deprecated function call
    const data = serialise([], null as any);
    
    // Deprecated property usage
    this.onExecuted(data);
  }

  // Using deprecated class members
  recreate() {
    console.log('This method is deprecated');
  }
}

// Deprecated variable names
const subgraphs = new Set();

// Function using deprecated APIs
function useDeprecatedApis() {
  // These should all trigger warnings based on the extracted deprecated APIs
  const result = serialise([], null as any);
  return result;
}