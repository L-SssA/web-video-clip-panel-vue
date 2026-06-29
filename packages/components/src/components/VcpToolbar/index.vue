<template>
  <ToolbarLayout class="vcp-toolbar">
    <template #left>
      <IconButton
        class="vcp-toolbar__icon-button"
        v-for="tool in leftToolConfigs"
        :key="tool.name"
        :iconClass="tool.icon"
        :tipsText="tool.tips"
        @click="tool.onclick"
      />
    </template>
    <template #center>
      <IconButton
        class="vcp-toolbar__icon-button"
        v-for="tool in centerToolConfigs"
        :key="tool.name"
        :iconClass="tool.icon"
        :tipsText="tool.tips"
        @click="tool.onclick"
      />
    </template>
    <template #right>
      <IconButton
        class="vcp-toolbar__icon-button"
        v-for="tool in rightToolConfigs"
        :key="tool.name"
        :iconClass="tool.icon"
        :tipsText="tool.tips"
        @click="tool.onclick"
      />
    </template>
  </ToolbarLayout>
</template>

<script setup lang="ts">
import { leftToolConfigs, centerToolConfigs, rightToolConfigs } from "./config";
import ToolbarLayout from "./ToolbarLayout.vue";
</script>

<style scoped lang="scss">
.vcp-toolbar {
  min-height: 48px;
  padding: 0 10px;

  .vcp-toolbar__icon-button {
    color: #333333;
  }
}
</style>
