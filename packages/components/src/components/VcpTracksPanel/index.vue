<template>
  <div class="vcp-tracks-panel" ref="tracksPanelRef"></div>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref } from 'vue';
import { PixiHelper } from '@web-vcp/core';

import type { VcpCtx } from '@/types/vcpContext';
import { vcpCtxKey } from '@/provides/vcpContext';

const ctx = inject<VcpCtx>(vcpCtxKey, {} as VcpCtx);

const tracksPanelRef = ref<HTMLElement | null>(null)
let pixiHelper: PixiHelper = new PixiHelper()

function drawTimeline() {
  if (!pixiHelper.isInitialized) return
  console.log("draw timeline");
}

async function setupPixi() {
  if (tracksPanelRef.value) {
    await pixiHelper.init(tracksPanelRef.value, { backgroundAlpha: 0 })
    ctx.timeline.onUpdate(drawTimeline)
  }
}

onMounted(() => {
  setupPixi()
})

onUnmounted(() => {
  ctx.timeline.offUpdate(drawTimeline)
})

</script>

<style scoped lang="scss">
.vcp-tracks-panel {
  width: 100%;
  font-size: 0;
}
</style>
