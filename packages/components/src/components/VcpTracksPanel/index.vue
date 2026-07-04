<template>
  <div class="vcp-tracks-panel" ref="tracksPanelRef"></div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue';
import { PixiHelper } from '@web-vcp/core';

import type { VcpCtx } from '@/types/vcpContext';
import { vcpCtxKey } from '@/provides/vcpContext';
import { defaultStyles, timelineStylesMap } from '@/config/timeline';
import { useWindowResize } from '@/hooks/useWindowResize';

const ctx = inject<VcpCtx>(vcpCtxKey, {} as VcpCtx);

const tracksPanelRef = ref<HTMLElement | null>(null)
let pixiHelper: PixiHelper = new PixiHelper()
let resizeUnlistener: () => void


const timelineStyles = computed(() => {
  return timelineStylesMap[ctx.theme.value] || defaultStyles
})

function drawTimeline(timelineCtx: typeof ctx.timeline.ctx) {
  if (!pixiHelper.isInitialized) return
  pixiHelper.drawTimeline(timelineCtx, timelineStyles.value)
}

async function setupPixi() {
  if (tracksPanelRef.value) {
    await pixiHelper.init(tracksPanelRef.value, { backgroundAlpha: 0 })
    ctx.timeline.onUpdate(drawTimeline)
    resizeUnlistener = useWindowResize(() => drawTimeline(ctx.timeline.ctx))
  }
}


watch(ctx.theme, () => {
  drawTimeline(ctx.timeline.ctx)
})

onMounted(() => {
  setupPixi()
})

onUnmounted(() => {
  ctx.timeline.offUpdate(drawTimeline)
  resizeUnlistener?.()
})

</script>

<style scoped lang="scss">
.vcp-tracks-panel {
  width: 100%;
  font-size: 0;
}
</style>
