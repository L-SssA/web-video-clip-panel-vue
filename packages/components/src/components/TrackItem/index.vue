<template>
  <div class="track-item" :data-id="data.id" data-domtype="trackItem" :data-tracktype="data.type" :class="{
    'track-item-active': currActive,
    'track-item-ghost': data.ghost,
    'track-item-overlap': draggingOverlap,
    'unchange': !data.changeable,
  }" :style="trackItemStyle" @mousedown="setActiveTrackItem">
    <!-- 拖拽相关 -->
    <div class="track-item-drag-panel" :data-id="data.id" data-domtype="trackItem" :data-tracktype="data.type"
      :draggable="!actionType && data.changeable" @dragstart.self="console.log('dragStart')"
      @dragend.self="console.log('dragend')">
    </div>
    <div class="resize-box" v-show="currActive">
      <div class="resize-btn resize-btn-left" @mousedown.stop="data.changeable && console.log('dragLeft')">|
      </div>
      <div class="resize-btn resize-btn-right" @mousedown.stop="data.changeable && console.log('dragRight')">|
      </div>
    </div>
    <TrackItemHeader :data="data" />
    <TrackItemPreviews :data="data" />
  </div>
</template>

<script setup lang='ts'>
import type { TrackItem } from '@web-vcp/core';
import { numberToStyleValue, timeToPixel } from '@web-vcp/core';
import { computed, inject } from 'vue';

import type { VcpCtx } from '@/types/vcpContext.ts';
import { vcpCtxSymbol } from '@/config/symbols.ts';

import TrackItemHeader from "./TrackItemHeader.vue";
import TrackItemPreviews from "./TrackItemPreviews.vue";


const ctx = inject<VcpCtx>(vcpCtxSymbol, {} as VcpCtx);

const props = defineProps({
  data: {
    type: Object as () => TrackItem,
    required: true
  }
})

const draggingOverlap = ctx.manager.data.trackline.draggingOverlap
const actionType = ctx.manager.data.trackline.actionType

const setActiveTrackItem = () => {
  ctx.manager.data.trackline.activeTrackItem.value = props.data
}
const currActive = computed(() => {
  const { activeTrackItem } = ctx.manager.data.trackline
  return props.data.id === activeTrackItem.value?.id
})
// 相关动态样式
const trackItemStyle = computed(() => {
  const { framesPerGap, gapWidth, fps } = ctx.manager.data.timeline
  const { trackItemColors, trackHeights } = ctx.manager.data.trackline
  const { start, end } = props.data
  return {
    left: numberToStyleValue(timeToPixel(start, fps.value, framesPerGap.value, gapWidth.value)),
    width: numberToStyleValue(timeToPixel((end - start), fps.value, framesPerGap.value, gapWidth.value)),
    height: numberToStyleValue(trackHeights[props.data.type]),
    backgroundColor: props.data.changeable ? trackItemColors[props.data.type] : (trackItemColors["unknown"] || "#686868"),
  }
}) 
</script>

<style scoped lang="scss">
.track-item {
  height: 100%;
  background-color: #686868;
  border-radius: 4px;
  position: absolute;
  user-select: none;

  &.track-item-active:not(.unchange) {
    border-radius: 0;
  }

  &.track-item-ghost:not(.unchange) {
    opacity: 0.3;
    border-radius: 4px;

    &.track-item-overlap,
    &>*:not(.track-item-drag-panel) {
      display: none;
    }
  }


  .track-item-drag-panel {
    position: absolute;
    inset: 0;
    z-index: 2;
  }

  .resize-box {
    position: absolute;
    inset: 0px -1px;
    border: 1px solid #fff;
    box-sizing: border-box;
    opacity: 0.8;
    z-index: 1;
    font-size: 1rem;

    .resize-btn {
      background-color: #fff;
      color: #2a2a2e;
      display: flex;
      justify-content: center;
      align-items: center;
      line-height: 1;
      width: 8px;
      position: absolute;
      z-index: 1;
      user-select: none;
      cursor: e-resize;
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

  &.unchange {
    filter: grayscale(0.4);

    .control-box {
      .control-btn {
        display: none;
      }
    }
  }
}
</style>