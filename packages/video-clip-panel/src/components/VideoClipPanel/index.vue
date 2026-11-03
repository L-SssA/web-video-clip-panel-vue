<template>
  <div class="vcp-container" ref="VcpContainerRef" :style="cssProps">
    <VcpToolbar class="vcp-toolbar" />
    <VcpTracksPanel class="vcp-tracks-panel" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, provide, ref } from "vue";
import { useResizeObserver, WebVcpManager } from "@web-vcp/core";

import type { VcpCtx } from "@/types/vcpContext.ts";

import { vcpCtxSymbol } from "@/config/symbols";
import { useThemeProps } from "@/hooks/useThemeProps";

import VcpToolbar from "@/components/VcpToolbar/index.vue";
import VcpTracksPanel from "@/components/VcpTracksPanel/index.vue";

let unuseResizeObserver: Function | null = null

const props = defineProps({
  manager: {
    type: WebVcpManager,
    default: () => new WebVcpManager(),
  },
});

const manager = props.manager

const VcpContainerRef = ref<HTMLDivElement>()

const { cssProps } = useThemeProps(manager.data.system)

function updatePanelRect() {
  if (VcpContainerRef.value) {
    const { clientHeight, clientWidth } = VcpContainerRef.value
    const panelRect = manager.data.system.panelRect
    panelRect.height = clientHeight
    panelRect.width = clientWidth
  }
}

onMounted(() => {
  if (VcpContainerRef.value) unuseResizeObserver = useResizeObserver(VcpContainerRef.value, updatePanelRect)
})

provide<VcpCtx>(vcpCtxSymbol, { manager })
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
