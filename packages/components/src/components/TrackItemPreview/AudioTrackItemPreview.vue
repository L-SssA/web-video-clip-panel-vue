<template>
  <div class="track-item-preview-audio" ref="previewBoxRef">
    <div class="preview-audio-data" ref="audioDataRef" v-show="!data.mute">
    </div>
  </div>
</template>

<script setup lang='ts'>
import { inject, nextTick, onMounted, reactive, ref, watch } from 'vue';

import type { AudioTrackItem } from "@web-vcp/core";
import { debounce, CanvasTileMap, drawAudioPreview } from '@web-vcp/core';

import type { VcpCtx } from '@/types/vcpContext';
import { vcpCtxSymbol } from '@/config/symbols';


const ctx = inject<VcpCtx>(vcpCtxSymbol, {} as VcpCtx);
const canvasTileMap = new CanvasTileMap()

const props = defineProps({
  data: {
    type: Object as () => AudioTrackItem,
    required: true
  },
})

const previewBoxRef = ref<HTMLDivElement>();
const audioDataRef = ref<HTMLDivElement>()

const outboxAttr = reactive({
  width: 0,
  height: 0,
})

const drawAudioList = debounce(() => {
  drawAudioPreview(props.data, ctx.manager.data, canvasTileMap.getContext())
}, 50)

const updatePrewview = () => {
  if (previewBoxRef.value) {
    const { clientWidth, clientHeight } = previewBoxRef.value;
    outboxAttr.width = clientWidth || 0;
    outboxAttr.height = clientHeight || 0;
  }
  canvasTileMap.update()
  nextTick(() => drawAudioList())
}

onMounted(() => {
  if (audioDataRef.value) canvasTileMap.setElement(audioDataRef.value)
  updatePrewview()
})

watch(
  [
    () => props.data.start,
    () => props.data.end,
    ctx.manager.data.timeline.scale,
    () => props.data.ghost,
    () => props.data.mute
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
  width: 100%;
  height: 100%;

  .preview-audio-data {
    height: 100%;
    width: 100%;
    font-size: 0;
    overflow: hidden;
  }
}
</style>