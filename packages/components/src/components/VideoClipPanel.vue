<template>
  <div class="vcp-container" :style="styleList">
    <VcpToolbar class="vcp-toolbar" />
    <VcpTracksPanel class="vcp-tracks-panel" />
  </div>
</template>

<script setup lang="ts">
import { computed, provide, toRef, watch } from "vue";
import { RendererManager, DataManager } from "@web-vcp/core";

import type { VcpCtx } from "@/types/vcpContext.ts";

import VcpToolbar from "@/components/VcpToolbar/index.vue";
import VcpTracksPanel from "@/components/VcpTracksPanel/index.vue";
import { useTheme } from "@/hooks/useTheme";
import { vcpCtxSymbol } from "@/config/symbols";
import { defaultStyles as timelineDefaultStyles, timelineStylesMap } from '@/config/timeline';
import { defaultStyles as tracklineDefaultStyles, tracklineStylesMap } from "@/config/trackline";

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

// 创建数据模型
const dataManager = new DataManager();

// 创建渲染器管理器
const rendererManager = new RendererManager();

watch(theme, (newTheme) => {
  dataManager.timeline.updateStyles(timelineStylesMap[newTheme] || timelineDefaultStyles)
  dataManager.trackline.updateStyles(tracklineStylesMap[newTheme] || tracklineDefaultStyles)
}, {
  immediate: true
})

provide<VcpCtx>(vcpCtxSymbol, {
  theme,
  dataManager,
  rendererManager
})
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
