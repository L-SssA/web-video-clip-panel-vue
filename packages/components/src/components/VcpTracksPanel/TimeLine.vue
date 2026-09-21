<template>
  <div class="timeline-container" ref="timelineContainer" @click="setCurrentTimeByPixel">
    <canvas class="timeline-canvas" ref="timelineCanvas" :style="canvasStyle" v-bind="canvasAttr"></canvas>
  </div>
</template>

<script setup lang='ts'>
import { computed, inject, nextTick, onMounted, onUnmounted, reactive, ref } from "vue";
import { getTrackDurationFormatted, numberToStyleValue } from "@web-vcp/core";

import type { VcpCtx } from '@/types/vcpContext.ts';
import { vcpCtxSymbol } from '@/config/symbols.ts';


const ctx = inject<VcpCtx>(vcpCtxSymbol, {} as VcpCtx);

const timelineContainer = ref<HTMLDivElement>();
const timelineCanvas = ref<HTMLCanvasElement>();

let canvasContext: CanvasRenderingContext2D | null = null

const setCurrentTimeByPixel = (event: MouseEvent) => {
  ctx.manager.data.setCurrentTimeByPixel(event.clientX)
}

const canvasAttr = reactive({
  width: 0,
  height: 0,
})

const canvasStyle = computed(() => ({
  width: numberToStyleValue(canvasAttr.width),
  height: numberToStyleValue(canvasAttr.height)
}))

const drawTimeLine = () => {
  if (!canvasContext) return;
  // 清理 canvas
  canvasContext.clearRect(0, 0, canvasAttr.width, canvasAttr.height);
  // 样式
  const { marginLeft, gapWidth, scrollOffset, gapsPerLabel, framesPerGap, styles } = ctx.manager.data.timeline.ctx
  const { lineColor, fontColor } = styles
  // =========== 顶线 ===========
  canvasContext.fillStyle = lineColor
  canvasContext.fillRect(0, 0, canvasAttr.width, 2)
  // =========== 间隔竖线 ===========
  if (!gapWidth) return
  // 滚动条位移
  const timelineOffsetPix = Math.max(scrollOffset, 0)
  // 计算竖线起始位置（不满足一格的起始）
  let startPosition = timelineOffsetPix % gapWidth
  if (startPosition > 0) startPosition = gapWidth - startPosition
  // 起始帧
  const startFrame = Math.ceil(timelineOffsetPix / gapWidth)
  // x 的固定位移
  for (let i = startFrame; i < (canvasAttr.width + timelineOffsetPix + marginLeft) / gapWidth; i++) {
    const x = (i - startFrame) * gapWidth - 1 + marginLeft + startPosition
    // 每隔 timelineLabelWidth 个间隔标识一下刻度
    if (i % gapsPerLabel == 0) {
      canvasContext.fillRect(x, 0, 2, 20)
      if (i === 0) continue
      canvasContext.fillStyle = fontColor
      canvasContext.font = "12px ui-monospace"
      canvasContext.fillText(getTrackDurationFormatted(i * framesPerGap), x + 6, 20)
      canvasContext.fillStyle = lineColor
    } else {
      canvasContext.fillRect(x, 0, 2, 6)
    }
  }
}

const updateTimeline = () => {
  if (timelineContainer.value) {
    const { width, height } = timelineContainer.value.getBoundingClientRect();
    canvasAttr.width = width;
    canvasAttr.height = height;
  }
  nextTick(() => drawTimeLine())
}

onMounted(() => {
  if (timelineCanvas.value) {
    canvasContext = timelineCanvas.value.getContext('2d');
  }
  updateTimeline()
})
ctx.manager.data.timeline.onUpdate(updateTimeline)

onUnmounted(() => {
  ctx.manager.data.timeline.offUpdate(updateTimeline)
})
</script>

<style scoped lang="scss">
.timeline-container {
  width: 100%;
  height: 30px;
}
</style>