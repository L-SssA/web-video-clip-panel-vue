<template>
  <div class="cursor-line" :style="cursorLineStyles" v-show="showNoniusLine">
    <i class="cursor-line-icon ri-home-fill" @mousedown=""></i>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue';

import type { VcpCtx } from '@/types/vcpContext.ts';
import { vcpCtxSymbol } from '@/config/symbols.ts';
import { numberToStyleValue } from '@web-vcp/core';


const ctx = inject<VcpCtx>(vcpCtxSymbol, {} as VcpCtx);

// 游标线的视图位置
const cursorLineViewPosition = computed(() => {
  const { cursorLinePosition, scrollOffset } = ctx.manager.data.timeline
  return cursorLinePosition.value - scrollOffset.value
})
// 是否显示游标线
const showNoniusLine = computed(() => {
  // 由于计算精度的偏差，这里倾向于尽量显示游标线
  return cursorLineViewPosition.value - ctx.manager.data.timeline.marginLeft >= -0.8
})

const cursorLineStyles = computed(() => {
  const { styles } = ctx.manager.data.timeline
  return {
    left: numberToStyleValue(cursorLineViewPosition.value),
    backgroundColor: styles.value.cursorLineColor,
    color: styles.value.cursorLineColor,
    width: numberToStyleValue(styles.value.cursorLineWidth)
  }
})
</script>

<style lang="scss" scoped>
.cursor-line {
  position: absolute;
  top: 14px;
  bottom: 0;
  background-color: #686868;
  width: 2px;
  z-index: 50;

  .cursor-line-icon {
    position: absolute;
    transform: rotateZ(180deg) scaleY(1.4);
    font-size: 16px;
    top: -14px;
    left: -7px;
  }
}
</style>