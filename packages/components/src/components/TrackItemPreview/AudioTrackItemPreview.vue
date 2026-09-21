<template>
  <div class="track-item-preview-audio" ref="previewBox">
    <div class="preview-audio-list" v-show="!data.mute">
      <canvas class="preview-audio-list-canvas" ref="audioViewCanvas" v-bind="audioViewAttr"
        :style="audioViewStyle"></canvas>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { computed, inject, nextTick, onMounted, reactive, ref, watch } from 'vue';

import type { AudioTrackItem } from "@web-vcp/core";
import { debounce, drawAudioPreview, numberToStyleValue, } from '@web-vcp/core';

import type { VcpCtx } from '@/types/vcpContext';
import { vcpCtxSymbol } from '@/config/symbols';


const ctx = inject<VcpCtx>(vcpCtxSymbol, {} as VcpCtx);

const props = defineProps({
  data: {
    type: Object as () => AudioTrackItem,
    required: true
  },
})

const previewBox = ref<HTMLDivElement>();
const audioViewCanvas = ref<HTMLCanvasElement>();

let audioCanvasContext: CanvasRenderingContext2D | null = null

const outboxAttr = reactive({
  width: 0,
  height: 0,
})

const audioViewAttr = computed(() => ({
  width: outboxAttr.width,
  height: outboxAttr.height,
}))

const audioViewStyle = computed(() => ({
  width: numberToStyleValue(audioViewAttr.value.width),
  height: numberToStyleValue(audioViewAttr.value.height),
}))


const drawAudioList = debounce(() => {
  if (!audioCanvasContext) return
  drawAudioPreview(props.data, ctx.manager.data.ctx, audioCanvasContext)
}, 50)

const updatePrewview = () => {
  if (previewBox.value) {
    const { width, height } = previewBox.value.getBoundingClientRect();
    if (width && height) {
      outboxAttr.width = Math.floor(width);
      outboxAttr.height = Math.floor(height);
    }
  }
  if (audioViewCanvas.value && !audioCanvasContext) {
    audioCanvasContext = audioViewCanvas.value.getContext('2d')
  }

  nextTick(() => drawAudioList())
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
    () => props.data.audioData,
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
.track-item-preview-audio {
  height: 100%;


  .preview-audio-list {
    height: 100%;
    width: 100%;
    font-size: 0;
    overflow: hidden;
  }
}
</style>