<template>
  <div class="vcp-container" :style="styleList">
    <VcpToolbar class="vcp-toolbar" />
    <VcpTracksPanel class="vcp-tracks-panel" />
  </div>
</template>

<script setup lang="ts">
import { computed, provide, reactive, toRef } from "vue";

import VcpToolbar from "@/components/VcpToolbar/index.vue";
import VcpTracksPanel from "@/components/VcpTracksPanel/index.vue";
import { useTheme } from "@web-vcp/core";
import { vcpCtxKey } from "@/provides/vcpContext.ts";
import type { VcpCtx } from "@/types/vcpContext.ts";

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

const theme = toRef(props, 'theme')
const { cssProps } = useTheme(theme);

const styleList = computed(() => ({
  height: typeof props.height === "number" ? `${props.height}px` : props.height,
  ...cssProps.value
}));

provide<VcpCtx>(vcpCtxKey, reactive({
  theme
}))
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
