<template>
  <div class="page-container">
    <VideoClipCanvas class="page-canvas" :manager="manager"></VideoClipCanvas>
    <div class="page-utils">
      <ElButton type="primary" text round :icon="Files" @click="addVideoSource">添加视频</ElButton>
      <ElButton type="primary" text round :icon="Files" @click="addImageSource">添加图片</ElButton>
      <ElButton type="primary" text round :icon="Files" @click="addAudioSource">添加音频</ElButton>
    </div>
    <VideoClipPanel class="page-panel" :manager="manager"></VideoClipPanel>
  </div>
</template>

<script setup lang="ts">
import { TRACKLINE_SOURCE_TYPE, VideoClipPanel, WebVcpManager, openSingleFilePicker, VideoClipCanvas, numberToStyleValue } from "web-vcp";
import { ElButton } from "element-plus";
import { Files } from '@element-plus/icons-vue';
import { toRef } from "vue";

const manager = new WebVcpManager({
  data: { timeline: { scale: 50 }, theme: "dark", system: { panelHeight: 300 } },
});

const systemStyles = manager.data.system.styles
const backgroundColor = toRef(() => systemStyles.value.backgroundColor)
const backgroundColorLight = toRef(() => systemStyles.value.backgroundColorLight)

const addVideoSource = async () => {
  // 添加网络地址
  // manager.addSource(TRACKLINE_SOURCE_TYPE.VIDEO, 'http://127.0.0.1:5500/video.mp4')

  // 添加本地文件
  const file = await openSingleFilePicker("video/*")
  if (!file) return
  manager.addSource(TRACKLINE_SOURCE_TYPE.VIDEO, file)
}
const addImageSource = async () => {
  // 添加网络地址
  // manager.addSource(TRACKLINE_SOURCE_TYPE.IMAGE, 'http://127.0.0.1:5500/pic1.jpg')

  // 添加本地文件
  const file = await openSingleFilePicker("image/*")
  if (!file) return
  manager.addSource(TRACKLINE_SOURCE_TYPE.IMAGE, file)
}
const addAudioSource = async () => {
  // 添加网络地址
  // manager.addSource(TRACKLINE_SOURCE_TYPE.AUDIO, 'http://127.0.0.1:5500/audio.mp3')

  // 添加本地文件
  const file = await openSingleFilePicker("audio/*")
  if (!file) return
  manager.addSource(TRACKLINE_SOURCE_TYPE.AUDIO, file)
}
</script>

<style scoped lang="scss">
.page-container {
  width: 100vw;
  height: 100vh;
  padding: 0;
  background-color: v-bind(backgroundColor);

  .page-canvas {
    height: calc(100vh - 32px - 16px - 300px);
    background-color: #eeeeee;
  }

  .page-utils {
    padding: 8px 10px;

    :deep(.el-button.is-text:not(.is-disabled)) {

      &:active,
      &:hover {
        background-color: v-bind(backgroundColorLight);
      }
    }
  }
}
</style>
