<template>
  <div class="track-item" :class="{
    'track-item-active': currActive,
    'track-item-ghost': data.ghost,
    'track-item-overlap': draggingOverlap,
    'unchange': !data.changeable,
  }" :style="trackItemStyle" @mousedown="setActiveTrackItem">
    <TrackItemCtrl :data="data" />
    <TrackItemHeader :data="data" />
    <TrackItemPreviews :data="data" />
  </div>
</template>

<script setup lang='ts'>
import { computed, inject } from 'vue';

import type { VcpCtx } from '@/types/vcpContext.ts';
import { vcpCtxSymbol } from '@/config/symbols.ts';

import type { TrackItem } from '@web-vcp/core';
import { numberToStyleValue, timeToPixel } from '@web-vcp/core';

import TrackItemCtrl from "./TrackItemCtrl.vue";
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

const setActiveTrackItem = () => {
  // 点击后，使当前 trackitem 作为 activeitem，相当于 focus
  ctx.manager.data.trackline.activeTrackItem.value = props.data
}
const currActive = computed(() => {
  // 判断当前 trackitem 是否处于 active 状态
  const { activeTrackItem } = ctx.manager.data.trackline
  return props.data.id === activeTrackItem.value?.id
})
const trackItemStyle = computed(() => {
  // 相关动态样式
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
  border-radius: 4px;
  position: absolute;
  user-select: none;

  &:active:not(.unchange) {
    opacity: 0.8;
  }

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

  &.unchange {
    filter: grayscale(0.4);
  }
}
</style>