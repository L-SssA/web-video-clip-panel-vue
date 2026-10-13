<template>
  <div class="track-item-preview-loading"></div>
</template>

<script setup lang="ts">
import { inject } from 'vue';

import type { TrackItem } from '@web-vcp/core';

import type { VcpCtx } from '@/types/vcpContext';
import { vcpCtxSymbol } from '@/config/symbols';
import { getBackgroundColor } from '@/utils/trackline';


const props = defineProps({
  data: {
    type: Object as () => TrackItem,
    required: true
  },
})

const ctx = inject<VcpCtx>(vcpCtxSymbol, {} as VcpCtx);
// speed： 每秒移动像素 
const backgroundColor = getBackgroundColor(props.data, ctx.manager.data)
</script>

<style lang="scss" scoped>
.track-item-preview-loading {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border-radius: 4px;
  z-index: 0;
  background-image: linear-gradient(-30deg,
      color-mix(in srgb, v-bind(backgroundColor), black 10%) 25%,
      color-mix(in srgb, v-bind(backgroundColor), white 10%) 37%,
      color-mix(in srgb, v-bind(backgroundColor), black 10%) 63%);
  background-size: 400% 100%;
  animation: loading-animation 1.4s ease infinite;
}

@keyframes loading-animation {
  0% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0 50%;
  }
}
</style>