<template>
  <VideoClipPanel :theme="theme" :manager="manager"></VideoClipPanel>
  <ElSwitch v-model="theme" :active-value="'dark'" :inactive-value="'light'"></ElSwitch>
</template>

<script setup lang="ts">
import { VideoClipPanel, WebVcpManager } from "@web-vcp/components";
import { ElSwitch } from "element-plus";

import { ref } from "vue";
const theme = ref("dark");
const manager = new WebVcpManager({
  data: {
    timeline: {
      scale: 50
    }
  }
});
</script>

<style scoped lang="scss"></style>
