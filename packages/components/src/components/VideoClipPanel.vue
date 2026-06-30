<template>
  <div class="vcp-container" :style="styleList">
    <VcpToolbar class="vcp-toolbar" />
    <VcpTracksPanel class="vcp-tracks-panel" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import VcpToolbar from "@/components/VcpToolbar/index.vue";
import VcpTracksPanel from "@/components/VcpTracksPanel/index.vue";
import { useTheme } from "@web-vcp/core";

const props = defineProps({
  height: {
    type: [String, Number],
    default: 320,
  },
  theme: {
    type: String,
    default: "light",
    validator: (value: string) => ["light", "dark"].includes(value),
  }
});

const { cssProps } = useTheme(props.theme);

const styleList = computed(() => ({
  height: typeof props.height === "number" ? `${props.height}px` : props.height,
  ...cssProps.value
})); 
</script>

<style scoped lang="scss">
.vcp-container {
  color: var(--vcp-color);
  background-color: var(--vcp-background-color);
  display: flex;
  flex-direction: column;
  min-height: 120px;

  .vcp-tracks-panel {
    flex: 1;
  }
}
</style>
