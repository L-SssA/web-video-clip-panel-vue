<template>
  <ToolbarLayout class="vcp-toolbar">
    <template #left>
      <component class="vcp-toolbar__tool-item" v-for="config in leftToolbarConfigs" :key="config.key"
        :is="config.component" v-bind="config.props" v-on="config.events" />
    </template>
    <template #center>
      <component class="vcp-toolbar__tool-item" v-for="config in centerToolbarConfigs" :key="config.key"
        :is="config.component" v-bind="config.props" v-on="config.events" />
    </template>
    <template #right>
      <component class="vcp-toolbar__tool-item" v-for="config in rightToolbarConfigs" :key="config.key"
        :is="config.component" v-bind="config.props" v-on="config.events" />
    </template>
  </ToolbarLayout>
</template>

<script setup lang="ts">
import { inject } from "vue";
import ToolbarLayout from "./ToolbarLayout.vue";
import { vcpCtxKey } from "@/provides/vcpContext.ts";
import type { VcpCtx } from "@/types/vcpContext.ts";
import { useVcpToolbar } from "@/hooks/useVcpToolbar.ts";

const ctx = inject<VcpCtx>(vcpCtxKey, {} as VcpCtx);
const {
  leftToolbarConfigs,
  centerToolbarConfigs,
  rightToolbarConfigs
} = useVcpToolbar(ctx) 
</script>

<style scoped lang="scss">
.vcp-toolbar {
  width: 100%;
  padding: 8px 10px;
  box-sizing: border-box;

  .vcp-toolbar__tool-item {
    margin: 0 10px;
  }

  .vcp-toolbar__slider {
    width: 160px;
    margin: 0 10px;

    :deep() {
      .el-slider__runway {
        background-color: var(--vcp-color-light);
      }

      .el-slider__bar {
        background-color: var(--vcp-color);
      }

      .el-slider__button {
        border: none;
        width: 12px;
        height: 12px;
        background-color: var(--vcp-color);
        margin-bottom: 1px;
      }
    }
  }
}
</style>
