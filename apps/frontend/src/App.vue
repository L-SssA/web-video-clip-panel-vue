<template>
  <VideoClipPanel :theme="theme" :manager="manager"></VideoClipPanel>
  <ElSwitch v-model="theme" :active-value="'dark'" :inactive-value="'light'"></ElSwitch>
  <ElButton @click="manager.addSource(TRACKLINE_SOURCE_TYPE.VIDEO, 'http://127.0.0.1:5500/video.mp4')">添加视频</ElButton>
  <ElButton @click="manager.addSource(TRACKLINE_SOURCE_TYPE.IMAGE, 'http://127.0.0.1:5500/pic1.jpg')">添加图片</ElButton>
  <ElButton @click="manager.addSource(TRACKLINE_SOURCE_TYPE.AUDIO, 'http://127.0.0.1:5500/audio.mp3')">添加音频</ElButton>
</template>

<script setup lang="ts">
import { TRACKLINE_SOURCE_TYPE, VideoClipPanel, WebVcpManager } from "@web-vcp/components";
import { ElSwitch, ElButton } from "element-plus";

import { ref } from "vue";

const theme = ref("dark");
const manager = new WebVcpManager({
  data: { timeline: { scale: 50 } }
});
</script>

<style scoped lang="scss">
.el-button {
  margin-left: 10px;
}
</style>
