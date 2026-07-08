<template>
  <div class="vcp-container" :style="styleList">
    <VcpToolbar class="vcp-toolbar" />
    <VcpTracksPanel class="vcp-tracks-panel" />
  </div>
</template>

<script setup lang="ts">
import { computed, provide, toRef } from "vue";
import { TimelineData, RendererManager, TimelineRenderer, TrackLineRenderer } from "@web-vcp/core";

import type { VcpCtx } from "@/types/vcpContext.ts";

import VcpToolbar from "@/components/VcpToolbar/index.vue";
import VcpTracksPanel from "@/components/VcpTracksPanel/index.vue";
import { useTheme } from "@/hooks/useTheme";
import { vcpCtx, timelineRenderer as timelineRendererKey, tracklineRenderer } from "@/config/symbols";

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

// 创建时间线数据模型
const timeline = new TimelineData(50, 30);

// 创建渲染器管理器
const rendererManager = new RendererManager();

// 注册时间线渲染器
const timelineRenderer = new TimelineRenderer();
rendererManager.register(timelineRendererKey, timelineRenderer);
// 注册轨道渲染器
const trackLineRenderer = new TrackLineRenderer();
rendererManager.register(tracklineRenderer, trackLineRenderer);

provide<VcpCtx>(vcpCtx, {
  theme,
  timeline,
  timelineRenderer,
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
