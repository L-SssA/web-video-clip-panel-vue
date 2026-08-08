<template>
  <div class="vcp-tracks-panel" ref="tracksPanelRef"></div>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref } from 'vue';

import type { VcpCtx } from '@/types/vcpContext';
import { vcpCtxSymbol } from '@/config/symbols';

const ctx = inject<VcpCtx>(vcpCtxSymbol, {} as VcpCtx);
const tracksPanelRef = ref<HTMLElement | null>(null)

async function setupPixi() {
  if (!tracksPanelRef.value) return
  // 初始化渲染器
  await ctx.webVcpManager.init(tracksPanelRef.value, { backgroundAlpha: 0 })
}

onMounted(() => {
  setupPixi()
})

onUnmounted(() => {
  // 销毁渲染器
  ctx.webVcpManager.destroy()
})

</script>

<style scoped lang="scss">
.vcp-tracks-panel {
  width: 100%;
  font-size: 0;
}
</style>
