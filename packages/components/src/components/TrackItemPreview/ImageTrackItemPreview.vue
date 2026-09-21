<template>
  <div class="track-item-preview-image" ref="previewBox">
    <div class="preview-image-list">
      <canvas ref="imageViewCanvas" v-bind="imageViewAttr" :style="imageViewStyle"></canvas>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { computed, inject, nextTick, onMounted, reactive, ref, watch } from 'vue';

import type { VcpCtx } from '@/types/vcpContext';
import { vcpCtxSymbol } from '@/config/symbols';
import type { ImageTrackItem } from "@web-vcp/core";
import { debounce, drawImagePreview, numberToStyleValue, } from '@web-vcp/core';


const ctx = inject<VcpCtx>(vcpCtxSymbol, {} as VcpCtx);

const props = defineProps({
  data: {
    type: Object as () => ImageTrackItem,
    required: true
  },
})

const previewBox = ref<HTMLDivElement>();
const imageViewCanvas = ref<HTMLCanvasElement>();

let imageCanvasContext: CanvasRenderingContext2D | null = null

const outboxAttr = reactive({
  width: 0,
  height: 0,
})

const imageViewAttr = computed(() => ({
  width: outboxAttr.width,
  height: Math.max(outboxAttr.height - ctx.manager.data.trackline.audioBarHeight, 0)
}))

const imageViewStyle = computed(() => ({
  width: numberToStyleValue(imageViewAttr.value.width),
  height: numberToStyleValue(imageViewAttr.value.height),
}))

const drawImageList = debounce(() => {
  if (!imageCanvasContext) return
  drawImagePreview(props.data, ctx.manager.data.ctx, imageCanvasContext)
}, 50)

const updatePrewview = () => {
  if (previewBox.value) {
    const { width, height } = previewBox.value.getBoundingClientRect();
    if (width && height) {
      outboxAttr.width = Math.floor(width);
      outboxAttr.height = Math.floor(height);
    }
  }
  if (imageViewCanvas.value && !imageCanvasContext) {
    imageCanvasContext = imageViewCanvas.value.getContext('2d')
  }
  nextTick(() => drawImageList())
}

onMounted(() => {
  updatePrewview()
})

watch(
  [
    () => props.data.start,
    () => props.data.end,
    ctx.manager.data.timeline.scale,
    () => props.data.ghost,
    () => props.data.previewList,
  ],
  (newVal, oldVal) => {
    const startOffset = newVal[0] - oldVal[0]
    const endOffset = newVal[1] - oldVal[1]
    if (
      Math.abs(startOffset) !== 0 &&
      Math.abs(endOffset) !== 0 &&
      Math.abs(startOffset - endOffset) < 5e-15
    )
      // 跳过拖拽导致的重绘，开始和结束均有等量偏移
      return
    nextTick(() => updatePrewview())
  }
) 
</script>

<style scoped lang="scss">
.track-item-preview-image {
  height: 100%;

  .preview-image-list {
    white-space: nowrap;
    overflow: hidden;
    font-size: 0;
    background-color: rgba(255, 255, 255, 0.2);
  }

  .preview-audio-list {
    height: 10px;
    width: 100%;
    font-size: 0;
    overflow: hidden;
  }
}
</style>