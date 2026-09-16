<template>
  <VideoClipPanel :theme="theme" :manager="manager"></VideoClipPanel>
  <ElSwitch v-model="theme" :active-value="'dark'" :inactive-value="'light'"></ElSwitch>
</template>

<script setup lang="ts">
import { TRACKLINE_SOURCE_TYPE, VideoClipPanel, WebVcpManager } from "@web-vcp/components";
import { ElSwitch } from "element-plus";

import { ref } from "vue";

const theme = ref("dark");
const manager = new WebVcpManager({
  data: { timeline: { scale: 50 } }
});

// manager.addSource(TRACKLINE_SOURCE_TYPE.VIDEO, "http://127.0.0.1:5500/video.mp4");
// manager.addSource(TRACKLINE_SOURCE_TYPE.IMAGE, "http://127.0.0.1:5500/pic1.jpg");
// manager.addSource(TRACKLINE_SOURCE_TYPE.IMAGE, "http://127.0.0.1:5500/pic2.jpg");
manager.addSource(TRACKLINE_SOURCE_TYPE.AUDIO, "http://127.0.0.1:5500/audio.mp3");
// manager.addSource(TRACKLINE_SOURCE_TYPE.TEXT, "水印");

</script>

<style scoped lang="scss"></style>
