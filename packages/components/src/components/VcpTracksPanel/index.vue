<template>
  <div class="vcp-tracks-panel" ref="vcpTracksPanelRef">
    <TimeLine />
    <TrackLines />
    <CursorLine />
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';

import type { VcpCtx } from '@/types/vcpContext.ts';
import { vcpCtxSymbol } from '@/config/symbols.ts';

import TimeLine from "@/components/TimeLine/index.vue";
import CursorLine from "@/components/CursorLine/index.vue";
import TrackLines from "./TrackLines.vue";

const ctx = inject<VcpCtx>(vcpCtxSymbol, {} as VcpCtx);

const vcpTracksPanelRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  if (vcpTracksPanelRef.value) {
    ctx.manager.setElementToListenMouseMove(vcpTracksPanelRef.value)
  }
}) 
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
