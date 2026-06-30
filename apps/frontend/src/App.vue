<template>
  <VideoClipPanel :theme="theme"></VideoClipPanel>
  <ElSwitch v-model="theme" :active-value="'dark'" :inactive-value="'light'"></ElSwitch>
</template>

<script setup lang="ts">
import { VideoClipPanel } from "@web-vcp/components";
import { ElSwitch } from "element-plus";

import { ref } from "vue";
const theme = ref("dark");
</script>

<style scoped lang="scss"></style>
