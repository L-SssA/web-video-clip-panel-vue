<template>
  <div class="track-line" :style="tracklineStyles" @mousedown="setActiveTrackline" @dragstart.self.prevent>
    <div class="track-list" :data-id="data.id" data-domtype="trackLine" :data-tracktype="data.type"
      :style="tracklineListStyles">
      <!-- <div class="new-track-line-sign"
        v-show="data.id === trackState.newTrackLineNeighborId && trackState.showCreateLine"
        :style="newTrackLineSignStyle"></div> -->
      <TrackItem v-for="item in data.data.filter(data => data.reloadFlag)" :key="item.id" :data="item" />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { computed, inject } from "vue";

import type { VcpCtx } from "@/types/vcpContext.ts";
import { vcpCtxSymbol } from "@/config/symbols.ts";

import { numberToStyleValue, timeToPixel, type TrackLine } from "@web-vcp/core";
import TrackItem from "@/components/TrackItem/index.vue";


const ctx = inject<VcpCtx>(vcpCtxSymbol, {} as VcpCtx);

const props = defineProps({
  data: {
    type: Object as () => TrackLine,
    required: true,
  },
})

const setActiveTrackline = () => {
  ctx.manager.data.trackline.activeTrackLine.value = props.data
}

const currActive = computed(() => {
  const { activeTrackLine } = ctx.manager.data.trackline
  return props.data.id === activeTrackLine.value?.id
})
const tracklineStyles = computed(() => {
  const { gapHeight } = ctx.manager.data.trackline
  return {
    marginTop: numberToStyleValue(gapHeight)
  }
})
const tracklineListStyles = computed(() => {
  const { styles } = ctx.manager.data.trackline
  const { fps, framesPerGap, gapWidth } = ctx.manager.data.timeline
  const longestSecond = ctx.manager.data.trackline.getLongestTracklineSecond()
  const tracklineWidth = timeToPixel(longestSecond, fps.value, framesPerGap.value, gapWidth.value)
  return {
    width: numberToStyleValue(tracklineWidth + 400),
    backgroundColor: currActive.value ? styles.value.activeBgColor : styles.value.backgroundColor,
  }
})

// const newTrackLineSignStyle = computed<Record<string, string>>(() => {
//   const style: Record<string, string> = {}
//   if (trackState.newTrackLineNeighborId !== props.data.id) return style
//   if (trackState.newTrackLineCreateDirection === "after") style["bottom"] = `-${props.lineGap / 2}px`
//   else style["top"] = `-${props.lineGap / 2}px`
//   return style
// })
</script>

<style scoped lang="scss">
.track-line {
  display: flex;
  align-items: center;
  position: relative;

  .new-track-line-sign {
    position: absolute;
    background-color: #00c1cd;
    left: 0;
    right: 0;
    height: 1px;
  }

  .volume-button {
    width: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    height: 100%;
  }

  .track-list {
    min-width: 100%;
    height: 100%;
    position: relative;
    flex-shrink: 0;
  }

  .operate-space {
    position: absolute;
    width: 400px;
  }
}
</style>