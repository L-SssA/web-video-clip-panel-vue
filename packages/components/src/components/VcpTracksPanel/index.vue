<template>
  <div class="vcp-tracks-panel" ref="tracksPanelRef"></div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue';

import type { VcpCtx } from '@/types/vcpContext';
import { defaultStyles, timelineStylesMap } from '@/config/timeline';
import { useWindowResize } from '@/hooks/useWindowResize';
import { timelineRendererName, vcpCtx } from '@/config/symbols';

const ctx = inject<VcpCtx>(vcpCtx, {} as VcpCtx);
const tracksPanelRef = ref<HTMLElement | null>(null)
const timelineStyles = computed(() => {
  return timelineStylesMap[ctx.theme.value] || defaultStyles
})

// 节流处理时间线更新
async function handleDataUpdate() {
  await ctx.rendererManager.renderAll(ctx.dataManager.ctx, {
    [timelineRendererName]: timelineStyles.value,
  })
}

async function setupPixi() {
  if (!tracksPanelRef.value) return
  // 初始化渲染器
  await ctx.rendererManager.init(tracksPanelRef.value, { backgroundAlpha: 0 })
  await ctx.rendererManager.renderAll(ctx.dataManager.ctx, {
    [timelineRendererName]: timelineStyles.value,
  })
}

// 窗口resize时重新渲染
let resizeUnlistener = useWindowResize(() => {
  handleDataUpdate()
})
// 主题变化时重新渲染
watch(ctx.theme, () => {
  handleDataUpdate()
})
// 数据变化时重新渲染
ctx.dataManager.onUpdate(handleDataUpdate)

ctx.timelineRenderer.on("timelineClick", ((event) => {
  ctx.dataManager.setCurrentTimeByPixel(event.global.x);
}));
ctx.timelineRenderer.on("cursorLineMove", ((event) => {
  ctx.dataManager.setCurrentTimeByPixel(event.global.x);
}));


onMounted(() => {
  setupPixi()
})

onUnmounted(() => {
  ctx.dataManager.offUpdate(handleDataUpdate)
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
