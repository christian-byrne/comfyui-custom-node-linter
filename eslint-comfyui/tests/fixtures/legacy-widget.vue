<!--
  Legacy Vue widget component using deprecated ComfyUI APIs
  This should trigger deprecated API warnings in Vue SFC
-->

<template>
  <div class="legacy-widget">
    <button @click="handleLegacyAction">Process with Legacy API</button>
    <div v-if="output">{{ output }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { serialise } from '../../../utils/vintageClipboard.js';

// Reactive state
const output = ref<string>('');

// Should trigger deprecated API warnings
class LegacyWidgetHandler {
  constructor(private node: any) {}

  // Deprecated lifecycle method
  onExecuted(data: any) {
    console.log('Legacy widget execution', data);
    return data;
  }

  // Deprecated recreation method
  async recreate() {
    console.log('Recreating widget with deprecated API');
    return null;
  }

  // Using deprecated serialization
  serializeData(nodes: any[], graph: any) {
    return serialise(nodes, graph);
  }
}

// Component methods
const handleLegacyAction = () => {
  const handler = new LegacyWidgetHandler({});
  
  // These should all trigger warnings
  handler.onExecuted({ test: 'data' });
  handler.recreate();
  
  const result = handler.serializeData([], null);
  output.value = result;
};

// Lifecycle with deprecated APIs
onMounted(() => {
  // Deprecated property usage
  const subgraphs = new Set();
  subgraphs.add('mounted-widget');
  
  // More deprecated API calls
  const instance = new LegacyWidgetHandler({});
  instance.onExecuted({ mounted: true });
});
</script>

<script lang="ts">
// Options API section also using deprecated APIs
export default {
  name: 'LegacyWidget',
  
  data() {
    return {
      legacyHandler: null as any
    };
  },
  
  methods: {
    // Method using deprecated APIs
    processLegacyData() {
      if (this.legacyHandler?.onExecuted) {
        this.legacyHandler.onExecuted({ vue: 'component' });
      }
      
      // Deprecated serialization
      return serialise([], null);
    },
    
    // Another deprecated pattern
    async recreateComponent() {
      if (this.legacyHandler?.recreate) {
        await this.legacyHandler.recreate();
      }
    }
  },
  
  created() {
    // Using deprecated APIs in Vue lifecycle
    this.legacyHandler = {
      onExecuted: (data: any) => console.log('Legacy:', data),
      recreate: () => Promise.resolve()
    };
  }
};
</script>

<style scoped>
.legacy-widget {
  padding: 1rem;
  border: 1px solid #ccc;
}
</style>