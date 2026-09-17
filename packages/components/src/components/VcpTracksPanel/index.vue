<template>
  <div class="vcp-tracks-panel" ref="tracksPanelRef"></div>
</template>

<script setup lang="ts">
import { inject, onUnmounted } from 'vue';

import type { VcpCtx } from '@/types/vcpContext';
import { vcpCtxSymbol } from '@/config/symbols';

const ctx = inject<VcpCtx>(vcpCtxSymbol, {} as VcpCtx);



onUnmounted(() => {
  // 销毁渲染器
  ctx.manager.destroy()
})

</script>

<style scoped lang="scss">
.vcp-tracks-panel {
  width: 100%;
  font-size: 0;
}
</style>
