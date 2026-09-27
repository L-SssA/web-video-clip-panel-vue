<template>
  <div class="track-item-drag-panel" :draggable="data.changeable"
    @dragstart.prevent.stop="ctx.manager.data.activeEvent(PANEL_EVENT_TYPE.TrackItemDrag)">
  </div>
  <div class="resize-box" v-show="showResizeBox">
    <div class="resize-btn resize-btn-left"
      @mousedown.prevent.stop="ctx.manager.data.activeEvent(PANEL_EVENT_TYPE.TrackItemResize, 'start')">|
    </div>
    <div class="resize-btn resize-btn-right"
      @mousedown.prevent.stop="ctx.manager.data.activeEvent(PANEL_EVENT_TYPE.TrackItemResize, 'end')">|
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';

import type { TrackItem } from '@web-vcp/core';
import { PANEL_EVENT_TYPE } from '@web-vcp/core';

import type { VcpCtx } from '@/types/vcpContext';
import { vcpCtxSymbol } from '@/config/symbols';

const ctx = inject<VcpCtx>(vcpCtxSymbol, {} as VcpCtx);

const props = defineProps({
  data: {
    type: Object as () => TrackItem,
    required: true
  }
})

const showResizeBox = computed(() => {
  const { activeTrackItem } = ctx.manager.data.trackline
  return props.data.id === activeTrackItem.value?.id && props.data.changeable
}) 
</script>

<style scoped lang="scss">
.track-item-drag-panel {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.resize-box {
  position: absolute;
  inset: 0px -1px;
  border: 1px solid #fff;
  box-sizing: border-box;
  opacity: 0.8;
  z-index: 2;
  font-size: 1rem;
  pointer-events: none;

  .resize-btn {
    background-color: #fff;
    color: #2a2a2e;
    display: flex;
    justify-content: center;
    align-items: center;
    line-height: 1;
    width: 8px;
    position: absolute;
    user-select: none;
    cursor: e-resize;
    pointer-events: auto;
  }

  .resize-btn-left {
    left: -8px;
    top: -1px;
    bottom: -1px;
    border-radius: 4px 0 0 4px;
  }

  .resize-btn-right {
    right: -8px;
    top: -1px;
    bottom: -1px;
    border-radius: 0 4px 4px 0;
  }
}
</style>