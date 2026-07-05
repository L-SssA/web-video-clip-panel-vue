<template>
  <div class="vcp-tracks-panel" ref="tracksPanelRef"></div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue';

import type { VcpCtx } from '@/types/vcpContext';
import { vcpCtxKey } from '@/provides/vcpContext';
import { defaultStyles, timelineStylesMap } from '@/config/timeline';
import { useWindowResize } from '@/hooks/useWindowResize';

const ctx = inject<VcpCtx>(vcpCtxKey, {} as VcpCtx);

const tracksPanelRef = ref<HTMLElement | null>(null)


const timelineStyles = computed(() => {
  return timelineStylesMap[ctx.theme.value] || defaultStyles
})

function handleTimelineUpdate() {
  ctx.rendererManager.render('timeline', ctx.timeline.ctx, timelineStyles.value)
}

async function setupPixi() {
  if (!tracksPanelRef.value) return
  // 初始化渲染器
  await ctx.rendererManager.init(tracksPanelRef.value, { backgroundAlpha: 0 })
  ctx.rendererManager.renderAll({
    timeline: ctx.timeline.ctx,
  }, {
    timeline: timelineStyles.value,
  })
}


onMounted(() => {
  setupPixi()
})

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
