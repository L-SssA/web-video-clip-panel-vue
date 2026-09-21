<template>
  <div class="vcp-tracks-panel">
    <TimeLine />
    <TrackLines />
    <CursorLine />
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';

import type { VcpCtx } from '@/types/vcpContext.ts';
import { vcpCtxSymbol } from '@/config/symbols.ts';

import TimeLine from "./TimeLine.vue";
import CursorLine from "./CursorLine.vue";
import TrackLines from "./TrackLines.vue";

const ctx = inject<VcpCtx>(vcpCtxSymbol, {} as VcpCtx);

console.log(ctx);


</script>

<style scoped lang="scss">
.vcp-tracks-panel {
  width: 100%;
  font-size: 0;
  position: relative;
  display: flex;
  flex-direction: column;
}
</style>
