<template>
  <div class="track-lines-container">
    <div ref="tracksTypesScrollbarRef" class="track-types-list" :style="{ width: numberToStyleValue(typesWidth) }">
      <i class="type-icon" :class="trackIcons[trackline.type]"
        :style="{ height: numberToStyleValue(trackHeights[trackline.type]), width: numberToStyleValue(typesWidth), ...trackIconStyles }"
        v-for="trackline in tracklines" :key="trackline.id"></i>
    </div>
    <ElScrollbar ref="tracksLinesScrollbarRef" class="track-lines-list" :always="true" @scroll="handleTracksLinesScroll"
      :noresize="false">
      <TrackLine :style="{ height: numberToStyleValue(trackHeights[trackline.type]) }" v-for="trackline in tracklines"
        :key="trackline.id" :data="trackline" />
    </ElScrollbar>
  </div>
</template>

<script lang="ts" setup>
import { ElScrollbar } from "element-plus";
import { computed, inject, ref, watch } from "vue";

import type { VcpCtx } from "@/types/vcpContext.ts";
import { vcpCtxSymbol } from "@/config/symbols.ts";

import TrackLine from "@/components/TrackLine/index.vue";
import { numberToStyleValue } from "@web-vcp/core";


const ctx = inject<VcpCtx>(vcpCtxSymbol, {} as VcpCtx);

const tracksTypesScrollbarRef = ref<HTMLDivElement | null>(null)
const tracksLinesScrollbarRef = ref<InstanceType<typeof ElScrollbar>>()
const trackHeights = ctx.manager.data.trackline.trackHeights
const trackIcons = ctx.manager.data.trackline.trackIcons
const typesWidth = ctx.manager.data.timeline.marginLeft

const tracklines = computed(() => {
  return ctx.manager.data.trackline.mergeTrackLineList.value
})
const trackIconStyles = computed(() => {
  const { styles, gapHeight } = ctx.manager.data.trackline
  return {
    color: styles.value.iconColor,
    fontSize: numberToStyleValue(styles.value.iconSize),
    marginTop: numberToStyleValue(gapHeight)
  }
})


const handleTracksLinesScroll = (event: { scrollLeft: number, scrollTop: number }) => {
  const { scrollLeft, scrollTop } = event
  ctx.manager.data.timeline.scrollOffset.value = scrollLeft
  if (tracksTypesScrollbarRef.value) {
    tracksTypesScrollbarRef.value.scrollTop = scrollTop
  }
}

watch([
  () => ctx.manager.data.trackline.getLongestTracklineSecond()
], () => {
  if (tracksLinesScrollbarRef.value) {
    tracksLinesScrollbarRef.value.update()
  }
})
</script>

<style lang="scss" scoped>
.track-lines-container {
  flex: 1;
  display: flex;
  align-items: flex-start;
  overflow: hidden;

  .track-types-list {
    height: 100%;
    width: 80px;
    overflow: hidden;

    .type-icon {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .track-lines-list {
    flex: 1;
    position: relative;
    height: 100%;
    margin-left: -10px;

    :deep(.el-scrollbar__view) {
      margin-left: 10px;
    }
  }
}
</style>