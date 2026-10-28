<template>
  <div class="alignment-line" :style="{ left: numberToStyleValue(alignmentLeftPosition - 1) }"
    v-show="showAlignmentLeft">
  </div>
  <div class="alignment-line" :style="{ left: numberToStyleValue(alignmentRightPosition - 1) }"
    v-show="showAlignmentRight">
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';

import type { VcpCtx } from '@/types/vcpContext';

import { vcpCtxSymbol } from '@/config/symbols';
import { numberToStyleValue } from '@web-vcp/core';


const ctx = inject<VcpCtx>(vcpCtxSymbol, {} as VcpCtx);
const { showAlignmentLeft, alignmentLeftPosition, showAlignmentRight, alignmentRightPosition } = ctx.manager.data.trackline
</script>

<style scoped lang="scss">
.alignment-line {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #00c1cd;
}
</style>