<template>
  <div class="vcp-tracks-panel" ref="tracksPanelRef"></div>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref } from 'vue';

import type { VcpCtx } from '@/types/vcpContext';
import { useWindowResize } from '@/hooks/useWindowResize';
import { vcpCtxSymbol } from '@/config/symbols';

const ctx = inject<VcpCtx>(vcpCtxSymbol, {} as VcpCtx);
const tracksPanelRef = ref<HTMLElement | null>(null)


// 节流处理时间线更新
async function handleDataUpdate() {
  await ctx.rendererManager.renderAll(ctx.dataManager.ctx)
}

async function setupPixi() {
  if (!tracksPanelRef.value) return
  // 初始化渲染器
  await ctx.rendererManager.init(tracksPanelRef.value, { backgroundAlpha: 0 })
  await ctx.rendererManager.renderAll(ctx.dataManager.ctx)
}

// 窗口resize时重新渲染
let resizeUnlistener = useWindowResize(() => {
  handleDataUpdate()
})
// 数据变化时重新渲染
ctx.dataManager.onUpdate(handleDataUpdate)

ctx.rendererManager.timeline.on("timelineClick", ((event) => {
  ctx.dataManager.setCurrentTimeByPixel(event.global.x);
}));
ctx.rendererManager.timeline.on("cursorLineMove", ((event) => {
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
