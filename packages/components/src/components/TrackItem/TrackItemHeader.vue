<template>
  <div class="track-item-header" v-if="data.type === 'text'">
    <span class="track-item-name">{{ data.text }}</span>
  </div>
  <div class="track-item-header" v-else>
    <span class="track-item-name">{{ data.name }}</span>
    <span class="track-item-time">{{ formatSeconds(data.end - data.start) }}</span>
  </div>
</template>

<script lang="ts" setup>
import type { TrackItem } from "@web-vcp/core";
import { formatSeconds } from '@web-vcp/core';

const props = defineProps({
  data: {
    type: Object as () => TrackItem,
    required: true
  }
})
</script>

<style lang="scss" scoped>
.track-item-header {
  height: 20px;
  font-size: 12px;
  padding: 2px 6px;
  white-space: nowrap;
  overflow: hidden;
  box-sizing: border-box;

  .track-item-name+span {
    $headerGap: 6px;
    margin-left: $headerGap * 2;
    position: relative;

    &::before {
      content: '';
      display: block;
      position: absolute;
      left: -$headerGap;
      top: 20%;
      bottom: 20%;
      width: 1px;
      background-color: #e9e9e9;
    }
  }
}
</style>