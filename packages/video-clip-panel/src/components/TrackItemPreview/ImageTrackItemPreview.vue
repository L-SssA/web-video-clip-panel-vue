<template>
  <div class="track-item-preview-image" ref="previewBoxRef">
    <div class="preview-image-list" :style="previewListStyles"></div>
  </div>
</template>

<script setup lang='ts'>
import { computed, inject, nextTick, onMounted, reactive, ref, watch } from 'vue';

import type { VcpCtx } from '@/types/vcpContext';
import { vcpCtxSymbol } from '@/config/symbols';
import type { ImageTrackItem } from "@web-vcp/core";
import { debounce, numberToStyleValue } from '@web-vcp/core';
import { getBackgroundColor } from '@/utils/trackline';
import { isBlobUrlValid } from '@/utils/tools';


const props = defineProps({
  data: {
    type: Object as () => ImageTrackItem,
    required: true
  },
})

const ctx = inject<VcpCtx>(vcpCtxSymbol, {} as VcpCtx);
const backgroundColor = getBackgroundColor(props.data, ctx.manager.data)

const previewBoxRef = ref<HTMLDivElement>();
const previewUrl = ref<string>("")

const clientRect = reactive({
  width: 0,
  height: 0,
})

const previewListStyles = computed(() => {
  const { audioBarHeight } = ctx.manager.data.ctx.trackline;
  return {
    backgroundImage: `url(${previewUrl.value})`,
    backgroundRepeat: "repeat-x",
    backgroundSize: "contain",
    width: numberToStyleValue(clientRect.width),
    height: numberToStyleValue(clientRect.height - audioBarHeight)
  }
})

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
}

onMounted(() => {
  updatePrewview()
  getPreviewImage()
})

watch(
  [
    () => props.data.start,
    () => props.data.end,
    ctx.manager.data.timeline.scale,
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
    background-color: color-mix(in srgb, v-bind(backgroundColor), white 10%);
  }

  .preview-audio-list {
    height: 10px;
    width: 100%;
    font-size: 0;
    overflow: hidden;
  }
}
</style>