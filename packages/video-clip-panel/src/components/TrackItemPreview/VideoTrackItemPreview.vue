<template>
  <div class="track-item-preview-video" ref="previewBoxRef">
    <div class="preview-image-list" :style="previewListStyles"></div>
    <div class="preview-audio-data" ref="audioDataRef" v-show="!data.mute">
    </div>
  </div>
</template>

<script setup lang='ts'>
import { computed, inject, nextTick, onMounted, reactive, ref, watch } from 'vue';

import type { VideoTrackItem } from "@web-vcp/core";
import { debounce, numberToStyleValue, drawAudioPreview, CanvasTileMap } from '@web-vcp/core';

import type { VcpCtx } from '@/types/vcpContext';
import { vcpCtxSymbol } from '@/config/symbols';
import { getBackgroundColor } from '@/utils/trackline';
import { isBlobUrlValid } from '@/utils/tools';

const props = defineProps({
  data: {
    type: Object as () => VideoTrackItem,
    required: true
  },
})


const ctx = inject<VcpCtx>(vcpCtxSymbol, {} as VcpCtx);
const canvasBlocker = new CanvasTileMap()
const { audioBarHeight } = ctx.manager.data.trackline.ctx
const audioBarHeightStyle = numberToStyleValue(audioBarHeight)
const backgroundColor = getBackgroundColor(props.data, ctx.manager.data)

const previewBoxRef = ref<HTMLDivElement>();
const audioDataRef = ref<HTMLDivElement>()
const previewUrl = ref<string>("")

const clientRect = reactive({
  width: 0,
  height: 0,
})

const previewListStyles = computed(() => {
  return {
    backgroundImage: `url(${previewUrl.value})`,
    backgroundRepeat: "repeat-x",
    backgroundSize: "contain",
    width: numberToStyleValue(clientRect.width),
    height: numberToStyleValue(clientRect.height - audioBarHeight)
  }
})

const drawAudioList = debounce(() => {
  drawAudioPreview(props.data, ctx.manager.data, canvasBlocker.getContext())
}, 50)


const getPreviewImage = debounce(async () => {
  if (props.data.previewUrl && await isBlobUrlValid(props.data.previewUrl)) {
    previewUrl.value = props.data.previewUrl
  } else {
    previewUrl.value = await ctx.manager.data.webav.tickFirstFrameBlobUrl(props.data)
  }
}, 50)
const updatePrewview = () => {
  if (previewBoxRef.value) {
    const { clientWidth, clientHeight } = previewBoxRef.value;
    clientRect.width = clientWidth || 0;
    clientRect.height = clientHeight || 0;
  }
  canvasBlocker.update()
  nextTick(() => drawAudioList())
}

onMounted(() => {
  if (audioDataRef.value) canvasBlocker.setElement(audioDataRef.value)
  updatePrewview()
  getPreviewImage()
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
.track-item-preview-video {
  height: 100%;
  width: 100%;
  overflow: hidden;

  .preview-image-list {
    white-space: nowrap;
    overflow: hidden;
    font-size: 0;
    background-color: color-mix(in srgb, v-bind(backgroundColor), white 10%);
  }

  .preview-audio-data {
    height: v-bind(audioBarHeightStyle);
    width: 100%;
    font-size: 0;
    overflow: hidden;
  }
}
</style>