<template>
  <div class="vcp-tracks-panel" ref="tracksPanelRef"></div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue';

import type { VcpCtx } from '@/types/vcpContext';
import { defaultStyles, timelineStylesMap } from '@/config/timeline';
import { useWindowResize } from '@/hooks/useWindowResize';
import { timelineRendererName, tracklineRendererName, vcpCtx } from '@/config/symbols';

const ctx = inject<VcpCtx>(vcpCtx, {} as VcpCtx);
const tracksPanelRef = ref<HTMLElement | null>(null)
const timelineStyles = computed(() => {
  return timelineStylesMap[ctx.theme.value] || defaultStyles
})

// 节流处理时间线更新
async function handleTimelineUpdate() {
  await ctx.rendererManager.render(timelineRendererName, ctx.timeline.ctx, timelineStyles.value)
  await ctx.rendererManager.render(tracklineRendererName, ctx.trackline.ctx)
}

async function setupPixi() {
  if (!tracksPanelRef.value) return
  // 初始化渲染器
  await ctx.rendererManager.init(tracksPanelRef.value, { backgroundAlpha: 0 })
  await ctx.rendererManager.renderAll({
    [timelineRendererName]: ctx.timeline.ctx,
    [tracklineRendererName]: ctx.trackline.ctx
  }, {
    [timelineRendererName]: timelineStyles.value,
  })
}

// 窗口resize时重新渲染
let resizeUnlistener = useWindowResize(() => {
  handleTimelineUpdate()
})
// 主题变化时重新渲染
watch(ctx.theme, () => {
  handleTimelineUpdate()
})
// 时间线变化时重新渲染
ctx.timeline.onUpdate(handleTimelineUpdate)

ctx.timelineRenderer.on("timelineClick", ((event) => {
  ctx.timeline.setCurrentTimeByPixel(event.global.x);
}));
ctx.timelineRenderer.on("cursorLineMove", ((event) => {
  ctx.timeline.setCurrentTimeByPixel(event.global.x);
}));


onMounted(() => {
  setupPixi()
})

onUnmounted(() => {
  ctx.timeline.offUpdate(handleTimelineUpdate)
  resizeUnlistener()
  // 销毁渲染器
  ctx.rendererManager.destroy()
})

</script>

<style scoped lang="scss">
.vcp-tracks-panel {
  width: 100%;
  font-size: 0;
}
</style>
