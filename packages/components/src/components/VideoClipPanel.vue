<template>
  <div class="vcp-container" :style="styleList">
    <VcpToolbar class="vcp-toolbar" />
    <VcpTracksPanel class="vcp-tracks-panel" />
  </div>
</template>

<script setup lang="ts">
import { computed, provide, toRef, watch } from "vue";
import { WebVcpManager } from "@web-vcp/core";

import type { VcpCtx } from "@/types/vcpContext.ts";

import VcpToolbar from "@/components/VcpToolbar/index.vue";
import VcpTracksPanel from "@/components/VcpTracksPanel/index.vue";
import { vcpCtxSymbol } from "@/config/symbols";
import { useThemeProps } from "@/hooks/useThemeProps";
import { numberToStyleValue } from "@web-vcp/core";

const props = defineProps({
  theme: {
    type: String,
    default: "light",
    validator: (value: string) => ["light", "dark"].includes(value),
  },
  manager: {
    type: WebVcpManager,
    default: () => new WebVcpManager(),
  },
});

const { cssProps } = useThemeProps(props.manager.data.system)

const styleList = computed(() => ({
  height: numberToStyleValue(props.manager.data.system.panelHeight.value),
  ...cssProps.value
}));

const theme = toRef(props, 'theme')
watch(theme, (newTheme) => {
  props.manager.setTheme(newTheme);
}, {
  immediate: true
})

provide<VcpCtx>(vcpCtxSymbol, {
  theme,
  manager: props.manager,
})
</script>

<style scoped lang="scss">
.vcp-container {
  color: var(--vcp-color);
  background-color: var(--vcp-background-color);
  display: flex;
  flex-direction: column;
  min-height: 120px;

  .vcp-toolbar {
    flex-shrink: 0;
    height: 48px;
    box-sizing: border-box;
  }

  .vcp-tracks-panel {
    flex: 1;
    height: calc(100% - 48px);
  }
}
</style>
