<template>
  <ElButton @click="addVideoSource">添加视频</ElButton>
  <ElButton @click="addImageSource">添加图片</ElButton>
  <ElButton @click="addAudioSource">添加音频</ElButton>
  <VideoClipPanel :manager="manager"></VideoClipPanel>
</template>

<script setup lang="ts">
import { TRACKLINE_SOURCE_TYPE, VideoClipPanel, WebVcpManager, openSingleFilePicker } from "web-vcp";
import { ElButton } from "element-plus";

const manager = new WebVcpManager({
  data: { timeline: { scale: 50 }, theme: "dark" }
});
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

<style scoped lang="scss"></style>
